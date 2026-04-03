import Link from "next/link";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { CostEfficiencyBadge } from "@/components/shared/cost-efficiency-badge";
import { PageHeader } from "@/components/shared/page-header";
import { PotentialBadge } from "@/components/shared/potential-badge";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { formatCurrency, formatInteger, formatPercent } from "@/lib/utils";
import { getDashboardData } from "@/services/dashboard-service";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const data = await getDashboardData(session.user.role, session.user.id);
  const totalCities = data.summary.coveredCities + data.summary.missingCities;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Acompanhe lideranças, cobertura territorial, metas de votos e eficiência operacional em São Paulo."
        action="Nova liderança"
        actionHref="/liderancas/nova"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total de lideranças"
          value={formatInteger(data.summary.total)}
          helper="Base total monitorada"
          href="/liderancas"
        />
        <StatCard
          label="Lideranças ativas"
          value={formatInteger(data.summary.active)}
          helper="Operação em andamento"
          href="/liderancas?status=ACTIVE"
        />
        <StatCard
          label="Lideranças inativas"
          value={formatInteger(data.summary.inactive)}
          helper="Avaliar retomada"
          href="/liderancas?status=INACTIVE"
        />
        <StatCard
          label="Lideranças pendentes"
          value={formatInteger(data.summary.pending)}
          helper="Cadastros aguardando análise"
          href="/liderancas?status=PENDING"
        />
        <StatCard
          label="Cidades cobertas"
          value={formatInteger(data.summary.coveredCities)}
          helper="Municípios plantados"
          href="/cidades"
        />
        <StatCard
          label="Cidades faltantes"
          value={formatInteger(data.summary.missingCities)}
          helper="Priorizar expansão"
          href="/cidades"
        />
        <StatCard
          label="Cobertura territorial"
          value={formatPercent(data.summary.coveragePercent)}
          helper={`${formatInteger(data.summary.coveredCities)} de ${formatInteger(totalCities)} cidades`}
          href="/cidades"
        />
        <StatCard
          label="Eleitores cobertos"
          value={formatInteger(data.summary.totalEleitoresCobertos)}
          helper={`${formatPercent(data.summary.percentualEleitoresCobertos)} do eleitorado monitorado`}
          href="/cidades"
        />
        <StatCard
          label="Votos captados"
          value={formatInteger(data.summary.votosCaptados)}
          helper={`Meta total: ${formatInteger(data.summary.metaVotos)}`}
          href="/cidades"
        />
        <StatCard
          label="Votos faltantes"
          value={formatInteger(data.summary.votosRestantes)}
          helper="Gap consolidado por cidade"
          href="/cidades"
        />
        <StatCard
          label="Custo por voto médio"
          value={formatCurrency(data.summary.custoPorVotoMedio)}
          helper={
            data.bestEfficiencyLeadership
              ? `Melhor eficiência: ${data.bestEfficiencyLeadership.nome}`
              : "Aguardando base válida"
          }
          href="/ranking?sortBy=COST_PER_VOTE_ASC"
        />
        <StatCard
          label="Geocodificação pendente"
          value={formatInteger(data.summary.pendingLocations)}
          helper="Cadastros sem coordenadas confirmadas"
          href="/mapa"
        />
      </div>

      <DashboardCharts
        potentialTotals={data.potentialTotals}
        statusTotals={data.statusTotals}
        coverageTotals={data.coverageTotals}
        topLeadershipChart={data.topLeadershipChart}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Top 5 lideranças
              </h3>
              <p className="text-sm text-slate-500">
                Volume de indicações, score estratégico e eficiência por voto.
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
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <PotentialBadge level={leadership.faixaPotencial} />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {formatInteger(leadership.quantidadeIndicacoes)} indicações
                  </span>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    Score {leadership.scoreLideranca.toFixed(2)}
                  </span>
                  <CostEfficiencyBadge value={leadership.custoPorVoto} />
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
                    {formatPercent(
                      data.summary.metaVotos > 0
                        ? (data.summary.votosCaptados / data.summary.metaVotos) * 100
                        : 0
                    )}
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
                  style={{
                    width: `${Math.min(
                      data.summary.metaVotos > 0
                        ? (data.summary.votosCaptados / data.summary.metaVotos) * 100
                        : 0,
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Alertas estratégicos
              </h3>
              <p className="text-sm text-slate-500">
                Pontos que merecem reação rápida da operação.
              </p>
            </div>
            <div className="space-y-3">
              {data.alerts.length ? (
                data.alerts.map((alert) => (
                  <Link
                    key={alert.id}
                    href={alert.href ?? "/dashboard"}
                    className="block rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {alert.title}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                          alert.severity === "high"
                            ? "bg-rose-100 text-rose-700"
                            : alert.severity === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {alert.severity === "high"
                          ? "Alta"
                          : alert.severity === "medium"
                            ? "Média"
                            : "Baixa"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{alert.description}</p>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  Nenhum alerta crítico no momento.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Cidades prioritárias
              </h3>
              <p className="text-sm text-slate-500">
                Priorização automática por eleitorado, cobertura e meta.
              </p>
            </div>
            <Link href="/cidades" className="text-sm font-semibold text-brand-700">
              Abrir cidades
            </Link>
          </div>
          <div className="space-y-3">
            {data.priorityCities.map((city) => (
              <Link
                key={city.id}
                href={`/cidades/${city.id}`}
                className="block rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{city.nome}</p>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                    {formatPercent(city.progresso)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{city.priorityReason}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Cidades cobertas
              </h3>
              <p className="text-sm text-slate-500">
                Municípios já plantados com captação em andamento.
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

        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Cidades sem cobertura
              </h3>
              <p className="text-sm text-slate-500">
                Primeiras lacunas territoriais a serem atacadas.
              </p>
            </div>
            <Link href="/cidades" className="text-sm font-semibold text-brand-700">
              Priorizar
            </Link>
          </div>
          <div className="space-y-3">
            {data.missingCityList.map((city) => (
              <Link
                key={city.id}
                href={`/cidades/${city.id}`}
                className="block rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-brand-50"
              >
                <p className="text-sm font-medium text-slate-900">{city.nome}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatInteger(city.totalEleitores)} eleitores monitorados
                </p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
