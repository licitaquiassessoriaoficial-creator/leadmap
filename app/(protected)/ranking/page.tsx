import { LeadershipFilters } from "@/components/liderancas/leadership-filters";
import { RankingSortControl } from "@/components/ranking/ranking-sort-control";
import { RankingTable } from "@/components/ranking/ranking-table";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatCard } from "@/components/shared/stat-card";
import { auth } from "@/lib/auth";
import { buildQueryString, formatInteger } from "@/lib/utils";
import { getLeadershipFilters } from "@/services/leadership-service";
import { getRankingData } from "@/services/ranking-service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RankingPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  if (!session) {
    return null;
  }

  const [ranking, filterOptions] = await Promise.all([
    getRankingData(resolvedSearchParams, session.user.role, session.user.id),
    getLeadershipFilters(session.user.role, session.user.id)
  ]);
  const exportHref = `/api/export/ranking?${buildQueryString(
    resolvedSearchParams
  )}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ranking"
        description="Ordenação estratégica por indicações, potencial, custo por voto e score."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Lideranças ranqueadas"
          value={formatInteger(ranking.total)}
          helper="Abrir ranking completo"
          href="/ranking"
        />
        <StatCard
          label="Página atual"
          value={formatInteger(ranking.page)}
          helper="Recarregar esta página"
          href={`/ranking?page=${ranking.page}`}
        />
        <StatCard
          label="Itens por página"
          value={formatInteger(ranking.pageSize)}
          helper="Ajustar com filtros"
          href="/ranking"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-panel md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">
            Compare eficiência, score e volume de votos na mesma tela.
          </p>
          <p className="text-sm text-slate-500">
            A exportação respeita exatamente os filtros e a ordenação atual.
          </p>
        </div>
        <a
          href={exportHref}
          className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
        >
          Exportar CSV
        </a>
      </div>

      <LeadershipFilters
        cities={filterOptions.cities}
        states={filterOptions.states}
        initialValues={{
          search: ranking.filters.search,
          cidade: ranking.filters.cidade,
          estado: ranking.filters.estado,
          faixaPotencial: ranking.filters.faixaPotencial,
          status: ranking.filters.status,
          minIndicacoes: ranking.filters.minIndicacoes,
          minScore: ranking.filters.minScore,
          maxCostPerVote: ranking.filters.maxCostPerVote,
          startDate: ranking.filters.startDate,
          endDate: ranking.filters.endDate
        }}
        showResponsible={false}
        showPeriod
        lockedState={filterOptions.enforcedState}
      />

      <RankingSortControl value={ranking.filters.sortBy} />
      <RankingTable
        data={ranking.items}
        page={ranking.page}
        pageSize={ranking.pageSize}
      />
      <PaginationControls page={ranking.page} totalPages={ranking.totalPages} />
    </div>
  );
}
