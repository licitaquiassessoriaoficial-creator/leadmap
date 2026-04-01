import Link from "next/link";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { PotentialBadge } from "@/components/shared/potential-badge";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { formatInteger, formatPercent } from "@/lib/utils";
import { getDashboardData } from "@/services/dashboard-service";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const data = await getDashboardData(session.user.role, session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Acompanhe liderancas, cobertura de cidades, metas de votos e desempenho territorial em SP."
        action="Nova lideranca"
        actionHref="/liderancas/nova"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total de liderancas"
          value={formatInteger(data.summary.total)}
          helper="Abrir cadastro completo"
          href="/liderancas"
        />
        <StatCard
          label="Cidades plantadas"
          value={formatInteger(data.summary.coveredCities)}
          helper="Ver cobertura detalhada"
          href="/cidades"
        />
        <StatCard
          label="Cidades faltantes"
          value={formatInteger(data.summary.missingCities)}
          helper="Priorizar expansao"
          href="/cidades"
        />
        <StatCard
          label="Votos captados"
          value={formatInteger(data.summary.votosCaptados)}
          helper={`Meta total: ${formatInteger(data.summary.metaVotos)}`}
          href="/cidades"
        />
      </div>
      <DashboardCharts
        potentialTotals={data.potentialTotals}
        coverageTotals={data.coverageTotals}
        topLeadershipChart={data.topLeadershipChart}
      />
      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Top 5 liderancas
              </h3>
              <p className="text-sm text-slate-500">
                Ordenacao por quantidade de indicacoes.
              </p>
            </div>
            <Link href="/ranking" className="text-sm font-semibold text-brand-700">
              Abrir ranking
            </Link>
          </div>
          <div className="space-y-3">
            {data.topLeaderships.map((leadership, index) => (
              <Link
                key={leadership.id}
                href={`/liderancas/${leadership.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-brand-200 hover:bg-brand-50 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 font-semibold text-brand-700">
                    {index + 1}
                  </div>
                  <ProfileAvatar
                    name={leadership.nome}
                    imageUrl={leadership.fotoPerfilUrl}
                    className="h-12 w-12"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{leadership.nome}</p>
                    <p className="text-sm text-slate-500">
                      {leadership.cidade} / {leadership.estado}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PotentialBadge level={leadership.faixaPotencial} />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {formatInteger(leadership.quantidadeIndicacoes)} indicacoes
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Resumo de votos
              </h3>
              <p className="text-sm text-slate-500">
                Captado versus meta consolidada da malha monitorada.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Progresso geral
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {formatPercent(data.summary.progressoVotos)}
                  </p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>Captado: {formatInteger(data.summary.votosCaptados)}</p>
                  <p>Restante: {formatInteger(data.summary.votosRestantes)}</p>
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${Math.min(data.summary.progressoVotos, 100)}%` }}
                />
              </div>
            </div>
          </Card>
          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Cidades plantadas
                </h3>
                <p className="text-sm text-slate-500">
                  Primeiras cidades com liderancas responsaveis.
                </p>
              </div>
              <Link href="/cidades" className="text-sm font-semibold text-brand-700">
                Ver todas
              </Link>
            </div>
            <div className="space-y-3">
              {data.plantedCities.map((city) => (
                <Link
                  key={city.id}
                  href={`/cidades/${city.id}`}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-brand-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{city.nome}</p>
                    <p className="text-xs text-slate-500">
                      {formatInteger(city.votosCaptados)} captados
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                    {formatPercent(city.progresso)}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
