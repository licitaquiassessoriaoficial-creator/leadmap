import { countLeaderships, listMapLeaderships } from "@/repositories/leadership-repository";
import { leadershipQuerySchema } from "@/validations/leadership";

function parseDateRange(startDate?: string, endDate?: string) {
  return {
    startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
    endDate: endDate ? new Date(`${endDate}T23:59:59.999`) : undefined
  };
}

export async function getMapData(rawQuery: Record<string, string | string[] | undefined>) {
  const query = leadershipQuerySchema.parse({
    cidade: rawQuery.cidade,
    estado: rawQuery.estado,
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
    estado: query.estado,
    faixaPotencial: query.faixaPotencial,
    status: query.status,
    responsavelId: query.responsavelId,
    ...parseDateRange(query.startDate, query.endDate)
  };

  const [points, total] = await Promise.all([
    listMapLeaderships(filters),
    countLeaderships(filters)
  ]);

  return {
    points,
    filters: query,
    total
  };
}
