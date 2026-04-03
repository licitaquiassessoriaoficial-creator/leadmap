import Link from "next/link";
import { notFound } from "next/navigation";

import { LeadershipActions } from "@/components/liderancas/leadership-actions";
import { CostEfficiencyBadge } from "@/components/shared/cost-efficiency-badge";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PageHeader } from "@/components/shared/page-header";
import { PotentialBadge } from "@/components/shared/potential-badge";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { LeadershipStatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { buildReferralPath, buildWhatsAppLink } from "@/lib/domain/leadership";
import { canDeleteLeadership } from "@/lib/permissions";
import {
  formatCoordinate,
  formatCurrency,
  formatDate,
  formatInteger,
  formatPercent
} from "@/lib/utils";
import { getEntityAuditLogs } from "@/services/audit-service";
import {
  getLeadershipById,
  getLeadershipPerformanceSnapshot
} from "@/services/leadership-service";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LeadershipDetailsPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ id }, resolvedSearchParams, session] = await Promise.all([
    params,
    searchParams,
    auth()
  ]);

  const [leadership, auditLogs] = await Promise.all([
    getLeadershipById(id, session?.user.role, session?.user.id),
    getEntityAuditLogs("Leadership", id)
  ]);

  if (!leadership || !session) {
    notFound();
  }

  const feedback =
    typeof resolvedSearchParams.feedback === "string"
      ? decodeURIComponent(resolvedSearchParams.feedback)
      : undefined;
  const referralPath = buildReferralPath(leadership.referralCode);
  const whatsAppLink = buildWhatsAppLink(
    leadership.whatsapp ?? leadership.telefone,
    `Olá, ${leadership.nome}! Vamos falar sobre a operação em ${leadership.cidade}?`
  );
  const performance = getLeadershipPerformanceSnapshot(leadership);

  return (
    <div className="space-y-6">
      <PageHeader
        title={leadership.nome}
        description={`${leadership.cidade} / ${leadership.estado}`}
      />
      <FeedbackBanner message={feedback} />

      <div className="grid gap-6 xl:grid-cols-[1fr,340px]">
        <div className="space-y-6">
          <Card className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4">
                <ProfileAvatar
                  name={leadership.nome}
                  imageUrl={leadership.fotoPerfilUrl}
                  className="h-20 w-20 rounded-3xl"
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <LeadershipStatusBadge status={leadership.status} />
                    <PotentialBadge level={leadership.faixaPotencial} />
                    <CostEfficiencyBadge value={leadership.custoPorVoto} />
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Score {leadership.scoreLideranca.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Base em {leadership.cidade} / {leadership.estado} •{" "}
                    {formatInteger(leadership.cidadesResponsaveis.length)} cidades sob
                    responsabilidade
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  WhatsApp
                </a>
                <a
                  href={referralPath}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Link de indicação
                </a>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Telefone</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.telefone}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">WhatsApp</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.whatsapp ?? leadership.telefone}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">E-mail</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.email ?? "Não informado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Bairro</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.bairro ?? "Não informado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Endereço</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.endereco ?? "Não informado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Responsável</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.cadastradoPor.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Potencial estimado</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatInteger(leadership.potencialVotosEstimado)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Votos reais</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatInteger(leadership.votosReais ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Base usada no cálculo</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatInteger(performance.voteBase ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Custo total</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatCurrency(leadership.custoTotal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Custo por voto</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.custoPorVoto == null
                    ? "Aguardando votos"
                    : formatCurrency(leadership.custoPorVoto)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Meta individual</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatInteger(leadership.metaVotosIndividual ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Progresso da meta</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatPercent(performance.progressoMetaIndividual)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Faltante da meta</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatInteger(performance.faltanteMetaIndividual)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Indicações</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatInteger(leadership.quantidadeIndicacoes)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Indicada por</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.indicadoPor?.nome ?? "Cadastro direto"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Referral code</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.referralCode}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500">Observações</p>
              <p className="mt-2 text-sm text-slate-700">
                {leadership.observacoes ?? "Sem observações."}
              </p>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Cidades sob responsabilidade
                </h3>
                <p className="text-sm text-slate-500">
                  Relação N:N usada para cobertura e metas.
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {leadership.cidadesResponsaveis.map((item) => (
                <Link
                  key={item.cityId}
                  href={`/cidades/${item.cityId}`}
                  className="rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <p className="font-medium text-slate-900">{item.city.nome}</p>
                  <p className="text-xs text-slate-500">
                    Meta de{" "}
                    {formatInteger(item.city.metaVotosCidade ?? item.city.totalEleitores)}{" "}
                    votos
                  </p>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Lideranças indicadas
                </h3>
                <p className="text-sm text-slate-500">
                  Cadastros internos criados a partir do link desta liderança.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {formatInteger(leadership.indicados.length)} registros
              </span>
            </div>
            <div className="space-y-3">
              {leadership.indicados.length ? (
                leadership.indicados.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        name={person.nome}
                        imageUrl={person.fotoPerfilUrl}
                        className="h-10 w-10"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {person.nome}
                        </p>
                        <p className="text-xs text-slate-500">
                          {person.cidade} / {person.estado}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>
                        {formatInteger(
                          person.votosReais ?? person.potencialVotosEstimado
                        )}{" "}
                        votos
                      </p>
                      <p>Score {person.scoreLideranca.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Ainda não há lideranças vinculadas por indicação.
                </p>
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Cadastros públicos recebidos
                </h3>
                <p className="text-sm text-slate-500">
                  Histórico de pessoas que chegaram por este referral code.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {formatInteger(leadership.referralSignups.length)} registros
              </span>
            </div>
            <div className="space-y-3">
              {leadership.referralSignups.length ? (
                leadership.referralSignups.map((signup) => (
                  <div
                    key={signup.id}
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {signup.nome}
                        </p>
                        <p className="text-xs text-slate-500">
                          {signup.cidade} / {signup.estado}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatDate(signup.createdAt)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{signup.telefone}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Nenhum cadastro público recebido por esse link até agora.
                </p>
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Histórico de evolução
            </h3>
            <div className="space-y-3">
              {leadership.performanceHistory.length ? (
                leadership.performanceHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(entry.dataReferencia)}
                      </p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Score {entry.score.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Estimados: {formatInteger(entry.votosEstimados)} • Reais:{" "}
                      {formatInteger(entry.votosReais ?? 0)} • Indicações:{" "}
                      {formatInteger(entry.quantidadeIndicacoes)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Ainda não há snapshots suficientes para esta liderança.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-900">Auditoria</h3>
            <div className="mt-4 space-y-3">
              {auditLogs.length ? (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {log.acao}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{log.descricao}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {log.usuario.name} em {formatDate(log.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Nenhum log registrado para esta liderança.
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Ações</h3>
            <LeadershipActions
              id={leadership.id}
              status={leadership.status}
              canDelete={canDeleteLeadership(session.user.role)}
            />
          </Card>
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Meta individual</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Meta:</span>{" "}
                {formatInteger(leadership.metaVotosIndividual ?? 0)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Captado:</span>{" "}
                {formatInteger(performance.voteBase ?? 0)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Restante:</span>{" "}
                {formatInteger(performance.faltanteMetaIndividual)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Progresso:</span>{" "}
                {formatPercent(performance.progressoMetaIndividual)}
              </p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{
                  width: `${Math.min(performance.progressoMetaIndividual, 100)}%`
                }}
              />
            </div>
          </Card>
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Localização</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Latitude:</span>{" "}
                {formatCoordinate(leadership.latitude)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Longitude:</span>{" "}
                {formatCoordinate(leadership.longitude)}
              </p>
            </div>
          </Card>
          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Sistema</h3>
            <p className="text-sm text-slate-600">
              Criada em {formatDate(leadership.createdAt)}
            </p>
            <p className="text-sm text-slate-600">
              Atualizada em {formatDate(leadership.updatedAt)}
            </p>
            <p className="break-all text-sm text-slate-600">
              Link de indicação: {referralPath}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
