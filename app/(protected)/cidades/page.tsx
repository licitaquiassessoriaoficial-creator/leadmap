import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { buildQueryString, formatCurrency, formatInteger, formatPercent } from "@/lib/utils";
import { getCitiesCoverageSnapshot } from "@/services/city-service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CitiesPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  if (!session) {
    return null;
  }

  const cityQuery =
    typeof resolvedSearchParams.cidade === "string"
      ? resolvedSearchParams.cidade.trim()
      : "";

  const [coverage, filteredCoverage] = await Promise.all([
    getCitiesCoverageSnapshot(session.user.role, session.user.id),
    cityQuery
      ? getCitiesCoverageSnapshot(session.user.role, session.user.id, {
          citySearch: cityQuery
        })
      : Promise.resolve(null)
  ]);

  const visibleCities = filteredCoverage?.cities ?? [];
  const missingCityResults = cityQuery
    ? coverage.missingCityList.filter((city) =>
        city.nome.toLowerCase().includes(cityQuery.toLowerCase())
      )
    : coverage.priorityCities.filter((city) => city.totalResponsaveis === 0).slice(0, 8);
  const exportHref = `/api/export/cidades?${buildQueryString(resolvedSearchParams)}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cidades"
        description="Cobertura territorial, metas de votos, prioridade automática e distribuição de lideranças em SP."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total de cidades"
          value={formatInteger(coverage.totalCities)}
        />
        <StatCard
          label="Plantadas"
          value={formatInteger(coverage.coveredCities)}
        />
        <StatCard
          label="Faltantes"
          value={formatInteger(coverage.missingCities)}
        />
        <StatCard
          label="Cobertura territorial"
          value={formatPercent(coverage.coveragePercent)}
        />
        <StatCard
          label="Eleitores cobertos"
          value={formatPercent(coverage.percentualEleitoresCobertos)}
        />
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Consulta por município
            </h3>
            <p className="text-sm text-slate-500">
              {formatInteger(coverage.totalCities)} municípios disponíveis para
              consulta em São Paulo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/mapa"
              className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Abrir mapa
            </Link>
            <a
              href={exportHref}
              className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Exportar CSV
            </a>
          </div>
        </div>
        <form className="grid gap-3 md:grid-cols-[1fr,auto,auto]" method="get">
          <div className="space-y-2">
            <Input
              name="cidade"
              defaultValue={cityQuery}
              placeholder="Digite o nome da cidade que deseja consultar"
              list="city-search-options"
            />
            <datalist id="city-search-options">
              {coverage.cities.map((city) => (
                <option key={city.id} value={city.nome} />
              ))}
            </datalist>
          </div>
          <Button type="submit">Consultar</Button>
          {cityQuery ? (
            <Link
              href="/cidades"
              className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Limpar busca
            </Link>
          ) : null}
        </form>
        <p className="text-sm text-slate-500">
          {cityQuery
            ? `${formatInteger(visibleCities.length)} resultado(s) para "${cityQuery}".`
            : "Digite o nome da cidade para consultar cobertura, meta de votos, custo médio e responsáveis."}
        </p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {cityQuery ? "Resultado da consulta" : "Cidades prioritárias"}
            </h3>
            <p className="text-sm text-slate-500">
              {cityQuery
                ? "Abra o detalhe da cidade para ver lideranças, meta, votos captados e faltantes."
                : "Recorte automático das cidades com maior necessidade de atuação."}
            </p>
          </div>

          {cityQuery ? (
            visibleCities.length ? (
              <div className="space-y-3">
                {visibleCities.map((city) => (
                  <Link
                    key={city.id}
                    href={`/cidades/${city.id}`}
                    className="grid gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-brand-200 hover:bg-brand-50 md:grid-cols-[1.2fr,140px,140px,140px]"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{city.nome}</p>
                      <p className="text-xs text-slate-500">
                        {city.totalResponsaveis} lideranças responsáveis •{" "}
                        {city.priorityReason}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Meta
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatInteger(city.targetVotes)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Captado
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatInteger(city.votosCaptados)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Progresso
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatPercent(city.progresso)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Nenhuma cidade encontrada para a busca informada.
              </p>
            )
          ) : (
            <div className="space-y-3">
              {coverage.priorityCities.map((city) => (
                <Link
                  key={city.id}
                  href={`/cidades/${city.id}`}
                  className="rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{city.nome}</p>
                      <p className="text-xs text-slate-500">{city.priorityReason}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                      {formatPercent(city.progresso)}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Eleitores
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatInteger(city.totalEleitores)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Captado
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatInteger(city.votosCaptados)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Custo/voto médio
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {city.custoPorVotoMedio == null
                          ? "Aguardando votos"
                          : formatCurrency(city.custoPorVotoMedio)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Cidades faltantes
              </h3>
              <p className="text-sm text-slate-500">
                {cityQuery
                  ? "Municípios sem cobertura que combinam com a busca atual."
                  : "Primeiras cidades sem liderança, priorizadas por impacto."}
              </p>
            </div>
            <div className="space-y-2">
              {missingCityResults.length ? (
                missingCityResults.map((city) => (
                  <Link
                    key={city.id}
                    href={`/cidades/${city.id}`}
                    className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-brand-50"
                  >
                    <p className="font-medium text-slate-900">{city.nome}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatInteger(city.totalEleitores)} eleitores •{" "}
                      {city.priorityReason}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  {cityQuery
                    ? "Nenhuma cidade faltante encontrada para essa busca."
                    : "Use a busca acima para verificar se um município está sem cobertura."}
                </p>
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Distribuição por liderança
              </h3>
              <p className="text-sm text-slate-500">
                Quantidade de cidades sob responsabilidade por liderança.
              </p>
            </div>
            <div className="space-y-3">
              {coverage.leadershipCoverage.slice(0, 10).map((item) => (
                <Link
                  key={item.id}
                  href={`/liderancas/${item.id}`}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-brand-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.nome}</p>
                    <p className="text-xs text-slate-500">
                      {item.cidade} / {item.estado}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.totalCidades}
                    </p>
                    <p className="text-xs text-slate-500">
                      Score {item.scoreLideranca.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
