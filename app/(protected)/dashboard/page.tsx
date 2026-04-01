import Link from "next/link";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { PotentialBadge } from "@/components/shared/potential-badge";
import { LeadershipStatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { buildSearchParams, formatInteger } from "@/lib/utils";
import { getDashboardData } from "@/services/dashboard-service";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const data = await getDashboardData(session.user.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Acompanhe volume, distribuição geográfica e desempenho das lideranças."
        action="Nova liderança"
        actionHref="/liderancas/nova"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total de lideranças"
          value={formatInteger(data.summary.total)}
          helper="Abrir listagem completa"
          href="/liderancas"
        />
        <StatCard
          label="Ativas"
          value={formatInteger(data.summary.active)}
          helper="Filtrar por status ativo"
          href={`/liderancas?${buildSearchParams({ status: "ACTIVE" })}`}
        />
        <StatCard
          label="Inativas"
          value={formatInteger(data.summary.inactive)}
          helper="Filtrar por status inativo"
          href={`/liderancas?${buildSearchParams({ status: "INACTIVE" })}`}
        />
        <StatCard
          label="Pendentes"
          value={formatInteger(data.summary.pending)}
          helper="Filtrar por status pendente"
          href={`/liderancas?${buildSearchParams({ status: "PENDING" })}`}
        />
        <StatCard
          label="Localização pendente"
          value={formatInteger(data.summary.pendingLocations)}
          helper="Revisar visualmente no mapa"
          href="/mapa"
        />
      </div>
      <DashboardCharts
        potentialTotals={data.potentialTotals}
        statusTotals={data.statusTotals}
        cityTotals={data.cityTotals}
        enforcedState={data.enforcedState}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr,320px]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Ranking resumido
              </h3>
              <p className="text-sm text-slate-500">
                Lideranças com maior quantidade de indicações.
              </p>
            </div>
            <Link href="/ranking">
              <Button variant="secondary">Ver ranking</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {data.topLeaderships.map((leadership, index) => (
              <Link
                key={leadership.id}
                href={`/liderancas/${leadership.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-brand-200 hover:bg-brand-50 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 font-semibold text-brand-700">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{leadership.nome}</p>
                    <p className="text-sm text-slate-500">
                      {leadership.cidade} / {leadership.estado}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PotentialBadge level={leadership.faixaPotencial} />
                  <LeadershipStatusBadge status={leadership.status} />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {leadership.quantidadeIndicacoes} indicações
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Estados</h3>
          <p className="mt-1 text-sm text-slate-500">
            Distribuição consolidada por estado.
          </p>
          <div className="mt-4 space-y-3">
            {data.stateTotals.slice(0, 8).map((state) => (
              <Link
                key={state.name}
                href={`/liderancas?${buildSearchParams({ estado: state.name })}`}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span className="text-sm font-medium text-slate-700">
                  {state.name}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {state.total}
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
