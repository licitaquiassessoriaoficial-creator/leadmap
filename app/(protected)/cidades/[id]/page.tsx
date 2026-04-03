import Link from "next/link";
import { notFound } from "next/navigation";

import { CostEfficiencyBadge } from "@/components/shared/cost-efficiency-badge";
import { PageHeader } from "@/components/shared/page-header";
import { PotentialBadge } from "@/components/shared/potential-badge";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { LeadershipStatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { buildWhatsAppLink } from "@/lib/domain/leadership";
import { formatCurrency, formatInteger, formatPercent } from "@/lib/utils";
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

  const totalVotosReais = city.liderancas.reduce(
    (total, leadership) => total + (leadership.votosReais ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={city.nome}
        description={`Meta de ${formatInteger(city.targetVotes)} votos em ${city.estado}.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Total de eleitores</p>
          <p className="text-3xl font-semibold text-slate-900">
            {formatInteger(city.totalEleitores)}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Meta da cidade</p>
          <p className="text-3xl font-semibold text-slate-900">
            {formatInteger(city.targetVotes)}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Votos captados</p>
          <p className="text-3xl font-semibold text-slate-900">
            {formatInteger(city.votosCaptados)}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Votos reais</p>
          <p className="text-3xl font-semibold text-slate-900">
            {formatInteger(totalVotosReais)}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-sm text-slate-500">Faltante</p>
          <p className="text-3xl font-semibold text-slate-900">
            {formatInteger(city.votosRestantes)}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,340px]">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Lideranças responsáveis
              </h3>
              <p className="text-sm text-slate-500">
                Potencial, votos reais, cidades cobertas e contato rápido por WhatsApp.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {city.liderancas.length ? (
              city.liderancas.map((leadership) => (
                <div
                  key={leadership.id}
                  className="rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        name={leadership.nome}
                        imageUrl={leadership.fotoPerfilUrl}
                        className="h-12 w-12"
                      />
                      <div>
                        <Link
                          href={`/liderancas/${leadership.id}`}
                          className="font-medium text-slate-900"
                        >
                          {leadership.nome}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {leadership.cidade} / {leadership.estado}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PotentialBadge level={leadership.faixaPotencial} />
                      <LeadershipStatusBadge status={leadership.status} />
                      <CostEfficiencyBadge value={leadership.custoPorVoto} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Base de votos
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatInteger(
                          leadership.votosReais ?? leadership.potencialVotosEstimado
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Indicações
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatInteger(leadership.quantidadeIndicacoes)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Custo por voto
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {leadership.custoPorVoto == null
                          ? "Aguardando votos"
                          : formatCurrency(leadership.custoPorVoto)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Cidades
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatInteger(leadership.cidadesResponsaveis.length)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/liderancas/${leadership.id}`}
                      className="text-sm font-semibold text-brand-700"
                    >
                      Abrir liderança
                    </Link>
                    <a
                      href={buildWhatsAppLink(
                        leadership.whatsapp ?? leadership.telefone,
                        `Olá, ${leadership.nome}! Vamos falar sobre a cidade de ${city.nome}?`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-emerald-700"
                    >
                      Abrir WhatsApp
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Nenhuma liderança associada a esta cidade.
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
                {formatInteger(city.targetVotes)}
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

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Inteligência territorial
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Código IBGE:</span>{" "}
                {city.codigoIbge ?? "Não informado"}
              </p>
              <p>
                <span className="font-medium text-slate-900">Lideranças:</span>{" "}
                {formatInteger(city.totalResponsaveis)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Indicações:</span>{" "}
                {formatInteger(city.indicacoes)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Custo/voto médio:</span>{" "}
                {city.custoPorVotoMedio == null
                  ? "Aguardando votos"
                  : formatCurrency(city.custoPorVotoMedio)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Prioridade:</span>{" "}
                {city.priorityReason}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
