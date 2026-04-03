import { Role } from "@prisma/client";

import {
  calculateCityPriority,
  calculateCoveragePercentage,
  calculateVotesProgress,
  calculateVotesRemaining,
  resolveCityVoteTarget
} from "@/lib/domain/city";
import { resolveLeadershipVoteBase } from "@/lib/domain/leadership";
import {
  findCityWithCoverageById,
  listCitiesWithCoverage
} from "@/repositories/city-repository";
import { ensureStateCityBase } from "@/services/city-base-service";
import { getCampaignScope } from "@/services/campaign-settings-service";
import { getScopedLeadershipUserIds } from "@/services/user-service";

type VisibleCityRecord = Awaited<ReturnType<typeof listCitiesWithCoverage>>[number];
type CityCoverageFilters = {
  search?: string;
  cidade?: string;
  citySearch?: string;
  estado?: string;
  faixaPotencial?: string;
  status?: string;
  responsavelId?: string;
  minIndicacoes?: number;
  minScore?: number;
  maxCostPerVote?: number;
  startDate?: Date;
  endDate?: Date;
};

function matchesText(value?: string | null, query?: string) {
  if (!query?.trim()) {
    return true;
  }

  return value?.toLowerCase().includes(query.trim().toLowerCase()) ?? false;
}

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

    if (!matchesText(leadership.cidade, filters.cidade)) {
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

    if (
      filters.minIndicacoes != null &&
      leadership.quantidadeIndicacoes < filters.minIndicacoes
    ) {
      return false;
    }

    if (filters.minScore != null && leadership.scoreLideranca < filters.minScore) {
      return false;
    }

    if (
      filters.maxCostPerVote != null &&
      (leadership.custoPorVoto == null ||
        leadership.custoPorVoto > filters.maxCostPerVote)
    ) {
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
        leadership.whatsapp,
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
  const votosCaptados = responsaveis.reduce((total, item) => {
    return (
      total +
      (resolveLeadershipVoteBase(
        item.leadership.votosReais,
        item.leadership.potencialVotosEstimado
      ) ?? 0)
    );
  }, 0);
  const indicacoes = responsaveis.reduce(
    (total, item) => total + item.leadership.quantidadeIndicacoes,
    0
  );
  const responsaveisComCusto = responsaveis.filter(
    (item) => item.leadership.custoPorVoto != null
  );
  const custoPorVotoMedio = responsaveisComCusto.length
    ? responsaveisComCusto.reduce(
        (total, item) => total + (item.leadership.custoPorVoto ?? 0),
        0
      ) / responsaveisComCusto.length
    : null;
  const targetVotes = resolveCityVoteTarget(
    city.totalEleitores,
    city.metaVotosCidade
  );
  const priority = calculateCityPriority({
    totalEleitores: city.totalEleitores,
    votosCaptados,
    targetVotes,
    totalResponsaveis: responsaveis.length
  });

  return {
    id: city.id,
    nome: city.nome,
    estado: city.estado,
    codigoIbge: city.codigoIbge,
    totalEleitores: city.totalEleitores,
    metaVotosCidade: city.metaVotosCidade,
    targetVotes,
    latitude: city.latitude,
    longitude: city.longitude,
    totalResponsaveis: responsaveis.length,
    votosCaptados,
    votosRestantes: calculateVotesRemaining(targetVotes, votosCaptados),
    progresso: calculateVotesProgress(targetVotes, votosCaptados),
    indicacoes,
    custoPorVotoMedio:
      custoPorVotoMedio == null || Number.isNaN(custoPorVotoMedio)
        ? null
        : Math.round((custoPorVotoMedio + Number.EPSILON) * 100) / 100,
    priorityScore: priority.score,
    priorityReason: priority.reason,
    liderancas: responsaveis.map((item) => item.leadership)
  };
}

export async function getCitiesCoverageSnapshot(
  role?: Role | null,
  userId?: string,
  filters: CityCoverageFilters = {}
) {
  const { enforcedState, responsavelIds } = await resolveScope(userId, role);
  const targetState = filters.estado ?? enforcedState ?? "SP";
  const citySearch = filters.citySearch?.trim() || filters.cidade?.trim();

  await ensureStateCityBase(targetState);

  const cities = await listCitiesWithCoverage({
    estado: targetState,
    search: citySearch
  });
  const summaries = cities
    .filter((city) => matchesText(city.nome, citySearch))
    .map((city) => buildCitySummary(city, responsavelIds, filters));

  const coveredCities = summaries.filter((city) => city.totalResponsaveis > 0);
  const missingCities = summaries.filter((city) => city.totalResponsaveis === 0);
  const totalEleitoresCobertos = coveredCities.reduce(
    (total, city) => total + city.totalEleitores,
    0
  );
  const totalEleitoresMonitorados = summaries.reduce(
    (total, city) => total + city.totalEleitores,
    0
  );

  const leadershipCoverageMap = new Map<
    string,
    {
      id: string;
      nome: string;
      cidade: string;
      estado: string;
      fotoPerfilUrl: string | null;
      totalCidades: number;
      scoreLideranca: number;
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
        totalCidades: (current?.totalCidades ?? 0) + 1,
        scoreLideranca: leadership.scoreLideranca
      });
    }
  }

  return {
    cities: summaries,
    totalCities: summaries.length,
    coveredCities: coveredCities.length,
    missingCities: missingCities.length,
    coveragePercent: calculateCoveragePercentage(
      summaries.length,
      coveredCities.length
    ),
    totalEleitoresCobertos,
    totalEleitoresMonitorados,
    percentualEleitoresCobertos: calculateCoveragePercentage(
      totalEleitoresMonitorados,
      totalEleitoresCobertos
    ),
    votosCaptados: summaries.reduce((total, city) => total + city.votosCaptados, 0),
    metaVotos: summaries.reduce((total, city) => total + city.targetVotes, 0),
    votosRestantes: summaries.reduce(
      (total, city) => total + city.votosRestantes,
      0
    ),
    plantedCities: coveredCities,
    missingCityList: missingCities,
    priorityCities: [...summaries]
      .sort((a, b) => b.priorityScore - a.priorityScore || b.totalEleitores - a.totalEleitores)
      .slice(0, 10),
    leadershipCoverage: Array.from(leadershipCoverageMap.values()).sort(
      (a, b) => b.totalCidades - a.totalCidades || b.scoreLideranca - a.scoreLideranca
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
