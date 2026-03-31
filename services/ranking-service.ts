import { countLeaderships, listRanking } from "@/repositories/leadership-repository";
import { rankingQuerySchema } from "@/validations/leadership";

function parseDateRange(startDate?: string, endDate?: string) {
  return {
    startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
    endDate: endDate ? new Date(`${endDate}T23:59:59.999`) : undefined
  };
}

export async function getRankingData(rawQuery: Record<string, string | string[] | undefined>) {
  const query = rankingQuerySchema.parse({
    page: rawQuery.page,
    pageSize: rawQuery.pageSize,
    search: rawQuery.search,
    cidade: rawQuery.cidade,
    estado: rawQuery.estado,
    faixaPotencial: rawQuery.faixaPotencial,
    status: rawQuery.status,
    responsavelId: rawQuery.responsavelId,
    startDate: rawQuery.startDate,
    endDate: rawQuery.endDate
  });

  const filters = {
    search: query.search,
    cidade: query.cidade,
    estado: query.estado,
    faixaPotencial: query.faixaPotencial,
    status: query.status,
    responsavelId: query.responsavelId,
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
    filters: query
  };
}
