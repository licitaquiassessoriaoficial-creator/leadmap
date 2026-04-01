import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { formatInteger, formatPercent } from "@/lib/utils";
import { getCitiesCoverageSnapshot } from "@/services/city-service";

export default async function CitiesPage() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const coverage = await getCitiesCoverageSnapshot(
    session.user.role,
    session.user.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cidades"
        description="Cobertura territorial, metas de votos e distribuicao de responsabilidades em SP."
      />
      <div className="grid gap-4 md:grid-cols-4">
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
          label="Meta de votos"
          value={formatInteger(coverage.metaVotos)}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Cidades monitoradas
              </h3>
              <p className="text-sm text-slate-500">
                Clique em uma cidade para abrir os detalhes completos.
              </p>
            </div>
            <Link href="/mapa" className="text-sm font-semibold text-brand-700">
              Abrir mapa
            </Link>
          </div>
          <div className="space-y-3">
            {coverage.cities.map((city) => (
              <Link
                key={city.id}
                href={`/cidades/${city.id}`}
                className="grid gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-brand-200 hover:bg-brand-50 md:grid-cols-[1fr,140px,120px]"
              >
                <div>
                  <p className="font-medium text-slate-900">{city.nome}</p>
                  <p className="text-xs text-slate-500">
                    {city.totalResponsaveis} liderancas responsaveis
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
        </Card>
        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Cidades faltantes
              </h3>
              <p className="text-sm text-slate-500">
                Territorios ainda sem cobertura ativa.
              </p>
            </div>
            <div className="space-y-2">
              {coverage.missingCityList.length ? (
                coverage.missingCityList.slice(0, 12).map((city) => (
                  <div
                    key={city.id}
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    {city.nome}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Nenhuma cidade faltante no recorte atual.
                </p>
              )}
            </div>
          </Card>
          <Card className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Distribuicao por lideranca
              </h3>
              <p className="text-sm text-slate-500">
                Quantidade de cidades sob responsabilidade por lideranca.
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
                  <span className="text-sm font-semibold text-slate-900">
                    {item.totalCidades}
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
