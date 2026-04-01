import { Role } from "@prisma/client";

import {
  countLeaderships,
  listMapLeaderships
} from "@/repositories/leadership-repository";
import { getCitiesCoverageSnapshot } from "@/services/city-service";
import { getCampaignScope } from "@/services/campaign-settings-service";
import { getScopedLeadershipUserIds } from "@/services/user-service";
import { leadershipQuerySchema } from "@/validations/leadership";

function parseDateRange(startDate?: string, endDate?: string) {
  return {
    startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
    endDate: endDate ? new Date(`${endDate}T23:59:59.999`) : undefined
  };
}

export async function getMapData(
  rawQuery: Record<string, string | string[] | undefined>,
  role?: Role | null,
  userId?: string
) {
  const scope = role ? await getCampaignScope(role) : undefined;
  const enforcedState = scope?.enforcedState ?? "SP";
  const responsavelIds = await getScopedLeadershipUserIds(userId, role);
  const query = leadershipQuerySchema.parse({
    cidade: rawQuery.cidade,
    estado: enforcedState,
    faixaPotencial: rawQuery.faixaPotencial,
    status: rawQuery.status,
    search: rawQuery.search,
    responsavelId: rawQuery.responsavelId,
    startDate: rawQuery.startDate,
    endDate: rawQuery.endDate
  });

  const filters = {
    search: query.search,
    cidade: query.cidade,
    estado: enforcedState,
    faixaPotencial: query.faixaPotencial,
    status: query.status,
    responsavelId: query.responsavelId,
    responsavelIds,
    ...parseDateRange(query.startDate, query.endDate)
  };

  const [points, total, coverage] = await Promise.all([
    listMapLeaderships(filters),
    countLeaderships(filters),
    getCitiesCoverageSnapshot(role, userId, filters)
  ]);

  return {
    points,
    cityPoints: coverage.cities,
    leadershipCoverage: coverage.leadershipCoverage,
    filters: {
      ...query,
      estado: enforcedState
    },
    total
  };
}
