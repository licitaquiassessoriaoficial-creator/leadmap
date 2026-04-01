import { Role } from "@prisma/client";

import { calculateVotesProgress, calculateVotesRemaining } from "@/lib/domain/city";
import {
  findCityWithCoverageById,
  listCitiesWithCoverage
} from "@/repositories/city-repository";
import { getCampaignScope } from "@/services/campaign-settings-service";
import { getScopedLeadershipUserIds } from "@/services/user-service";

type VisibleCityRecord = Awaited<ReturnType<typeof listCitiesWithCoverage>>[number];
type CityCoverageFilters = {
  search?: string;
  cidade?: string;
  estado?: string;
  faixaPotencial?: string;
  status?: string;
  responsavelId?: string;
  startDate?: Date;
  endDate?: Date;
};

async function resolveScope(userId?: string, role?: Role | null) {
  const scope = role ? await getCampaignScope(role) : undefined;
  const responsavelIds = await getScopedLeadershipUserIds(userId, role);

  return {
    enforcedState: scope?.enforcedState,
    responsavelIds
  };
}

function filterResponsibilities(
  city: VisibleCityRecord,
  responsavelIds?: string[],
  filters: CityCoverageFilters = {}
) {
  const search = filters.search?.trim().toLowerCase();

  return city.responsaveis.filter((item) => {
    const leadership = item.leadership;

    if (
      responsavelIds?.length &&
      !responsavelIds.includes(leadership.cadastradoPorId)
    ) {
      return false;
    }

    if (
      filters.responsavelId &&
      leadership.cadastradoPorId !== filters.responsavelId
    ) {
      return false;
    }

    if (filters.cidade && leadership.cidade !== filters.cidade) {
      return false;
    }

    if (filters.estado && leadership.estado !== filters.estado) {
      return false;
    }

    if (
      filters.faixaPotencial &&
      leadership.faixaPotencial !== filters.faixaPotencial
    ) {
      return false;
    }

    if (filters.status && leadership.status !== filters.status) {
      return false;
    }

    if (filters.startDate && leadership.createdAt < filters.startDate) {
      return false;
    }

    if (filters.endDate && leadership.createdAt > filters.endDate) {
      return false;
    }

    if (search) {
      const haystack = [
        leadership.nome,
        leadership.telefone,
        leadership.email,
        leadership.cidade,
        leadership.bairro
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(search)) {
        return false;
      }
    }

    return true;
  });
}

function buildCitySummary(
  city: VisibleCityRecord,
  responsavelIds?: string[],
  filters: CityCoverageFilters = {}
) {
  const responsaveis = filterResponsibilities(city, responsavelIds, filters);
  const votosCaptados = responsaveis.reduce(
    (total, item) => total + item.leadership.potencialVotosEstimado,
    0
  );
  const indicacoes = responsaveis.reduce(
    (total, item) => total + item.leadership.quantidadeIndicacoes,
    0
  );

  return {
    id: city.id,
    nome: city.nome,
    estado: city.estado,
    totalEleitores: city.totalEleitores,
    latitude: city.latitude,
    longitude: city.longitude,
    totalResponsaveis: responsaveis.length,
    votosCaptados,
    votosRestantes: calculateVotesRemaining(city.totalEleitores, votosCaptados),
    progresso: calculateVotesProgress(city.totalEleitores, votosCaptados),
    indicacoes,
    liderancas: responsaveis.map((item) => item.leadership)
  };
}

export async function getCitiesCoverageSnapshot(
  role?: Role | null,
  userId?: string,
  filters: CityCoverageFilters = {}
) {
  const { enforcedState, responsavelIds } = await resolveScope(userId, role);
  const cities = await listCitiesWithCoverage({
    estado: filters.estado ?? enforcedState ?? "SP"
  });
  const summaries = cities
    .filter((city) => !filters.cidade || city.nome === filters.cidade)
    .map((city) => buildCitySummary(city, responsavelIds, filters));

  const coveredCities = summaries.filter((city) => city.totalResponsaveis > 0);
  const missingCities = summaries.filter((city) => city.totalResponsaveis === 0);

  const leadershipCoverageMap = new Map<
    string,
    {
      id: string;
      nome: string;
      cidade: string;
      estado: string;
      fotoPerfilUrl: string | null;
      totalCidades: number;
    }
  >();

  for (const city of summaries) {
    for (const leadership of city.liderancas) {
      const current = leadershipCoverageMap.get(leadership.id);

      leadershipCoverageMap.set(leadership.id, {
        id: leadership.id,
        nome: leadership.nome,
        cidade: leadership.cidade,
        estado: leadership.estado,
        fotoPerfilUrl: leadership.fotoPerfilUrl,
        totalCidades: (current?.totalCidades ?? 0) + 1
      });
    }
  }

  return {
    cities: summaries,
    totalCities: summaries.length,
    coveredCities: coveredCities.length,
    missingCities: missingCities.length,
    votosCaptados: summaries.reduce((total, city) => total + city.votosCaptados, 0),
    metaVotos: summaries.reduce((total, city) => total + city.totalEleitores, 0),
    votosRestantes: summaries.reduce(
      (total, city) => total + city.votosRestantes,
      0
    ),
    plantedCities: coveredCities,
    missingCityList: missingCities,
    leadershipCoverage: Array.from(leadershipCoverageMap.values()).sort(
      (a, b) => b.totalCidades - a.totalCidades || a.nome.localeCompare(b.nome)
    )
  };
}

export async function getCityDetail(
  cityId: string,
  role?: Role | null,
  userId?: string,
  filters: CityCoverageFilters = {}
) {
  const { enforcedState, responsavelIds } = await resolveScope(userId, role);
  const city = await findCityWithCoverageById(cityId);

  if (!city) {
    return null;
  }

  if (enforcedState && city.estado !== enforcedState) {
    return null;
  }

  const summary = buildCitySummary(city, responsavelIds, filters);

  return {
    ...summary,
    faltante: summary.votosRestantes
  };
}
