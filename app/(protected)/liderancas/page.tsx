import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { LeadershipFilters } from "@/components/liderancas/leadership-filters";
import { LeadershipTable } from "@/components/liderancas/leadership-table";
import { Card } from "@/components/ui/card";
import { formatInteger } from "@/lib/utils";
import { getUsers } from "@/services/user-service";
import {
  getLeadershipFilters,
  getLeadershipList
} from "@/services/leadership-service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LeadershipListPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const [listData, filterOptions, users] = await Promise.all([
    getLeadershipList(resolvedSearchParams),
    getLeadershipFilters(),
    getUsers()
  ]);

  const feedback =
    typeof resolvedSearchParams.feedback === "string"
      ? decodeURIComponent(resolvedSearchParams.feedback)
      : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Liderancas"
        description="Listagem com filtros, paginação e acesso rapido ao detalhe."
        action="Nova lideranca"
        actionHref="/liderancas/nova"
      />
      <FeedbackBanner message={feedback} />
      <LeadershipFilters
        cities={filterOptions.cities}
        states={filterOptions.states}
        users={users.map((user) => ({ id: user.id, name: user.name }))}
        initialValues={{
          search: listData.filters.search,
          cidade: listData.filters.cidade,
          estado: listData.filters.estado,
          faixaPotencial: listData.filters.faixaPotencial,
          status: listData.filters.status,
          responsavelId: listData.filters.responsavelId,
          startDate: listData.filters.startDate,
          endDate: listData.filters.endDate
        }}
      />
      <Card className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Registros encontrados</p>
          <p className="text-2xl font-semibold text-slate-900">
            {formatInteger(listData.total)}
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Pagina atual com {formatInteger(listData.items.length)} liderancas.
        </p>
      </Card>
      <LeadershipTable data={listData.items} />
      <PaginationControls page={listData.page} totalPages={listData.totalPages} />
    </div>
  );
}
