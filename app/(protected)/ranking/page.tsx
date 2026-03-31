import { LeadershipFilters } from "@/components/liderancas/leadership-filters";
import { RankingTable } from "@/components/ranking/ranking-table";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatCard } from "@/components/shared/stat-card";
import { getLeadershipFilters } from "@/services/leadership-service";
import { getRankingData } from "@/services/ranking-service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RankingPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const [ranking, filterOptions] = await Promise.all([
    getRankingData(resolvedSearchParams),
    getLeadershipFilters()
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ranking"
        description="Ordenação principal por quantidade de indicações, com filtros por território e período."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Lideranças ranqueadas" value={ranking.total} />
        <StatCard label="Página atual" value={ranking.page} />
        <StatCard label="Itens por página" value={ranking.pageSize} />
      </div>
      <LeadershipFilters
        cities={filterOptions.cities}
        states={filterOptions.states}
        initialValues={{
          cidade: ranking.filters.cidade,
          estado: ranking.filters.estado,
          faixaPotencial: ranking.filters.faixaPotencial,
          status: ranking.filters.status,
          startDate: ranking.filters.startDate,
          endDate: ranking.filters.endDate
        }}
        showSearch={false}
        showResponsible={false}
        showPeriod
      />
      <RankingTable
        data={ranking.items}
        page={ranking.page}
        pageSize={ranking.pageSize}
      />
      <PaginationControls page={ranking.page} totalPages={ranking.totalPages} />
    </div>
  );
}
