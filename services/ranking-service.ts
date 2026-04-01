import { Role } from "@prisma/client";

import { countLeaderships, listRanking } from "@/repositories/leadership-repository";
import { getCampaignScope } from "@/services/campaign-settings-service";
import { getScopedLeadershipUserIds } from "@/services/user-service";
import { rankingQuerySchema } from "@/validations/leadership";

function parseDateRange(startDate?: string, endDate?: string) {
  return {
    startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
    endDate: endDate ? new Date(`${endDate}T23:59:59.999`) : undefined
  };
}

export async function getRankingData(
  rawQuery: Record<string, string | string[] | undefined>,
  role?: Role | null,
  userId?: string
) {
  const scope = role ? await getCampaignScope(role) : undefined;
  const enforcedState = scope?.enforcedState;
  const responsavelIds = await getScopedLeadershipUserIds(userId, role);
  const query = rankingQuerySchema.parse({
    page: rawQuery.page,
    pageSize: rawQuery.pageSize,
    search: rawQuery.search,
    cidade: rawQuery.cidade,
    estado: enforcedState ?? rawQuery.estado,
    faixaPotencial: rawQuery.faixaPotencial,
    status: rawQuery.status,
    responsavelId: rawQuery.responsavelId,
    startDate: rawQuery.startDate,
    endDate: rawQuery.endDate
  });

  const filters = {
    search: query.search,
    cidade: query.cidade,
    estado: enforcedState ?? query.estado,
    faixaPotencial: query.faixaPotencial,
    status: query.status,
    responsavelId: query.responsavelId,
    responsavelIds,
    ...parseDateRange(query.startDate, query.endDate)
  };

  const [items, total] = await Promise.all([
    listRanking(filters, query.page, query.pageSize),
    countLeaderships(filters)
  ]);

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    filters: {
      ...query,
      estado: enforcedState ?? query.estado
    }
  };
}
