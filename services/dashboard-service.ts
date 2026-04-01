import { LeadershipStatus, PotentialLevel, Role } from "@prisma/client";

import { POTENTIAL_METADATA } from "@/lib/constants/potential";
import { getDashboardAggregates } from "@/repositories/leadership-repository";
import { getCampaignScope } from "@/services/campaign-settings-service";

export async function getDashboardData(role?: Role | null) {
  const scope = role ? await getCampaignScope(role) : undefined;
  const data = await getDashboardAggregates({
    estado: scope?.enforcedState
  });

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
      pendingLocations: data.pendingLocations
    },
    cityTotals: data.groupedByCity.map((item) => ({
      name: item.cidade,
      total: item._count.cidade
    })),
    stateTotals: data.groupedByState.map((item) => ({
      name: item.estado,
      total: item._count.estado
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
    topLeaderships: data.topLeaderships,
    enforcedState: scope?.enforcedState
  };
}
