import Link from "next/link";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { PotentialBadge } from "@/components/shared/potential-badge";
import { LeadershipStatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { formatInteger } from "@/lib/utils";
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
        <StatCard label="Total de lideranças" value={formatInteger(data.summary.total)} />
        <StatCard label="Ativas" value={formatInteger(data.summary.active)} />
        <StatCard label="Inativas" value={formatInteger(data.summary.inactive)} />
        <StatCard label="Pendentes" value={formatInteger(data.summary.pending)} />
        <StatCard
          label="Localização pendente"
          value={formatInteger(data.summary.pendingLocations)}
        />
      </div>
      <DashboardCharts
        potentialTotals={data.potentialTotals}
        statusTotals={data.statusTotals}
        cityTotals={data.cityTotals}
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
              <div
                key={leadership.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
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
              </div>
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
              <div
                key={state.name}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">
                  {state.name}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {state.total}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
