import { LeadershipStatus, PotentialLevel, Role } from "@prisma/client";

import { calculateVotesProgress } from "@/lib/domain/city";
import { POTENTIAL_METADATA } from "@/lib/constants/potential";
import { getDashboardAggregates } from "@/repositories/leadership-repository";
import { getCitiesCoverageSnapshot } from "@/services/city-service";
import { getCampaignScope } from "@/services/campaign-settings-service";
import { getScopedLeadershipUserIds } from "@/services/user-service";

export async function getDashboardData(role?: Role | null, userId?: string) {
  const scope = role ? await getCampaignScope(role) : undefined;
  const responsavelIds = await getScopedLeadershipUserIds(userId, role);
  const [data, coverage] = await Promise.all([
    getDashboardAggregates({
      estado: scope?.enforcedState ?? "SP",
      responsavelIds
    }),
    getCitiesCoverageSnapshot(role, userId)
  ]);

  const statusCounts = {
    active:
      data.groupedByStatus.find((item) => item.status === LeadershipStatus.ACTIVE)
        ?._count.status ?? 0,
    inactive:
      data.groupedByStatus.find(
        (item) => item.status === LeadershipStatus.INACTIVE
      )?._count.status ?? 0,
    pending:
      data.groupedByStatus.find((item) => item.status === LeadershipStatus.PENDING)
        ?._count.status ?? 0
  };

  return {
    summary: {
      total: data.total,
      active: statusCounts.active,
      inactive: statusCounts.inactive,
      pending: statusCounts.pending,
      pendingLocations: data.pendingLocations,
      coveredCities: coverage.coveredCities,
      missingCities: coverage.missingCities,
      votosCaptados: coverage.votosCaptados,
      metaVotos: coverage.metaVotos,
      votosRestantes: coverage.votosRestantes,
      progressoVotos: calculateVotesProgress(
        coverage.metaVotos,
        coverage.votosCaptados
      )
    },
    cityTotals: data.groupedByCity.map((item) => ({
      name: item.cidade,
      total: item._count.cidade
    })),
    potentialTotals: Object.values(PotentialLevel).map((level) => ({
      level,
      label: POTENTIAL_METADATA[level].label,
      color: POTENTIAL_METADATA[level].chartColor,
      total:
        data.groupedByPotential.find((item) => item.faixaPotencial === level)?._count
          .faixaPotencial ?? 0
    })),
    statusTotals: [
      { label: "Ativas", total: statusCounts.active, color: "#047857" },
      { label: "Inativas", total: statusCounts.inactive, color: "#b91c1c" },
      { label: "Pendentes", total: statusCounts.pending, color: "#d97706" }
    ],
    coverageTotals: [
      { label: "Plantadas", total: coverage.coveredCities, color: "#1d4ed8" },
      { label: "Faltantes", total: coverage.missingCities, color: "#f97316" }
    ],
    topLeaderships: data.topLeaderships,
    topLeadershipChart: data.topLeaderships.map((item) => ({
      name: item.nome,
      indicacoes: item.quantidadeIndicacoes
    })),
    plantedCities: coverage.plantedCities.slice(0, 10),
    missingCityList: coverage.missingCityList.slice(0, 10),
    enforcedState: scope?.enforcedState ?? "SP"
  };
}
