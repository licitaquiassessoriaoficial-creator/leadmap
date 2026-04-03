import { LeadershipFilters } from "@/components/liderancas/leadership-filters";
import { LeadershipTable } from "@/components/liderancas/leadership-table";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { buildQueryString, formatInteger } from "@/lib/utils";
import {
  getLeadershipFilters,
  getLeadershipList
} from "@/services/leadership-service";
import { getVisibleUsersForLeadershipFilters } from "@/services/user-service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LeadershipListPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  if (!session) {
    return null;
  }

  const [listData, filterOptions, users] = await Promise.all([
    getLeadershipList(resolvedSearchParams, session.user.role, session.user.id),
    getLeadershipFilters(session.user.role, session.user.id),
    getVisibleUsersForLeadershipFilters(session.user.id, session.user.role)
  ]);

  const feedback =
    typeof resolvedSearchParams.feedback === "string"
      ? decodeURIComponent(resolvedSearchParams.feedback)
      : undefined;
  const exportHref = `/api/export/liderancas?${buildQueryString(
    resolvedSearchParams
  )}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lideranças"
        description="Listagem operacional com busca textual, filtros avançados, score e eficiência."
        action="Nova liderança"
        actionHref="/liderancas/nova"
      />
      <FeedbackBanner message={feedback} />

      <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">
            Filtre por território, score, custo por voto e indicações.
          </p>
          <p className="text-sm text-slate-500">
            A exportação gera o mesmo recorte que você está vendo na tabela.
          </p>
        </div>
        <a
          href={exportHref}
          className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
        >
          Exportar CSV
        </a>
      </Card>

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
          minIndicacoes: listData.filters.minIndicacoes,
          minScore: listData.filters.minScore,
          maxCostPerVote: listData.filters.maxCostPerVote,
          startDate: listData.filters.startDate,
          endDate: listData.filters.endDate
        }}
        lockedState={filterOptions.enforcedState}
        showResponsible={session.user.role !== "OPERATOR"}
      />

      <Card className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Registros encontrados</p>
          <p className="text-2xl font-semibold text-slate-900">
            {formatInteger(listData.total)}
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Página atual com {formatInteger(listData.items.length)} lideranças.
        </p>
      </Card>

      <LeadershipTable data={listData.items} />
      <PaginationControls page={listData.page} totalPages={listData.totalPages} />
    </div>
  );
}
