import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { buildWhatsAppLink } from "@/lib/domain/leadership";
import { formatInteger, formatPercent } from "@/lib/utils";
import { getCityDetail } from "@/services/city-service";

type Params = Promise<{ id: string }>;

export default async function CityDetailPage({
  params
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    return null;
  }

  const city = await getCityDetail(id, session.user.role, session.user.id);

  if (!city) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={city.nome}
        description={`Meta de ${formatInteger(city.totalEleitores)} votos no recorte ${city.estado}.`}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Liderancas da cidade</p>
          <p className="text-3xl font-semibold text-slate-900">
            {formatInteger(city.totalResponsaveis)}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Votos estimados</p>
          <p className="text-3xl font-semibold text-slate-900">
            {formatInteger(city.votosCaptados)}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Indicacoes</p>
          <p className="text-3xl font-semibold text-slate-900">
            {formatInteger(city.indicacoes)}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Faltante</p>
          <p className="text-3xl font-semibold text-slate-900">
            {formatInteger(city.faltante)}
          </p>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr,320px]">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Liderancas responsaveis
              </h3>
              <p className="text-sm text-slate-500">
                Potencial, indicacoes e contato rapido por WhatsApp.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {city.liderancas.length ? (
              city.liderancas.map((leadership) => (
                <div
                  key={leadership.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      name={leadership.nome}
                      imageUrl={leadership.fotoPerfilUrl}
                      className="h-12 w-12"
                    />
                    <div>
                      <a
                        href={`/liderancas/${leadership.id}`}
                        className="font-medium text-slate-900"
                      >
                        {leadership.nome}
                      </a>
                      <p className="text-xs text-slate-500">
                        {formatInteger(leadership.potencialVotosEstimado)} votos ·{" "}
                        {formatInteger(leadership.quantidadeIndicacoes)} indicacoes
                      </p>
                    </div>
                  </div>
                  <a
                    href={buildWhatsAppLink(
                      leadership.telefone,
                      `Ola, ${leadership.nome}! Vamos falar sobre a cidade de ${city.nome}?`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-emerald-700"
                  >
                    Abrir WhatsApp
                  </a>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Nenhuma lideranca associada a esta cidade.
              </p>
            )}
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Meta de votos</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Meta:</span>{" "}
                {formatInteger(city.totalEleitores)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Captado:</span>{" "}
                {formatInteger(city.votosCaptados)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Restante:</span>{" "}
                {formatInteger(city.votosRestantes)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Progresso:</span>{" "}
                {formatPercent(city.progresso)}
              </p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: `${Math.min(city.progresso, 100)}%` }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
