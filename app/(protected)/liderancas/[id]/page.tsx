import Link from "next/link";
import { notFound } from "next/navigation";

import { LeadershipActions } from "@/components/liderancas/leadership-actions";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { PotentialBadge } from "@/components/shared/potential-badge";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { LeadershipStatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { canDeleteLeadership } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import {
  formatCoordinate,
  formatCurrency,
  formatDate,
  formatInteger
} from "@/lib/utils";
import {
  buildReferralPath,
  buildWhatsAppLink,
  calculateCostPerVote
} from "@/lib/domain/leadership";
import { getEntityAuditLogs } from "@/services/audit-service";
import { getLeadershipById } from "@/services/leadership-service";

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
  const referralPath = buildReferralPath(leadership.id);
  const whatsAppLink = buildWhatsAppLink(
    leadership.telefone,
    `Ola, ${leadership.nome}! Vamos falar sobre a operacao em ${leadership.cidade}?`
  );
  const custoPorVoto = calculateCostPerVote(
    leadership.custoTotal,
    leadership.potencialVotosEstimado
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={leadership.nome}
        description={`${leadership.cidade} / ${leadership.estado}`}
      />
      <FeedbackBanner message={feedback} />
      <div className="grid gap-6 xl:grid-cols-[1fr,320px]">
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
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {formatInteger(leadership.quantidadeIndicacoes)} indicacoes
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Base em {leadership.cidade} / {leadership.estado}
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
                  Link de indicacao
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
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.email ?? "Nao informado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Bairro</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.bairro ?? "Nao informado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Endereco</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.endereco ?? "Nao informado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Potencial estimado</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatInteger(leadership.potencialVotosEstimado)}
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
                  {formatCurrency(custoPorVoto)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Responsavel</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.cadastradoPor.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Indicada por</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.indicadoPor?.nome ?? "Cadastro direto"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Observacoes</p>
              <p className="mt-2 text-sm text-slate-700">
                {leadership.observacoes ?? "Sem observacoes."}
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
                  Relacao N:N usada para cobertura e metas.
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
                    Meta de {formatInteger(item.city.totalEleitores)} votos
                  </p>
                </Link>
              ))}
            </div>
          </Card>
          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Pessoas indicadas
                </h3>
                <p className="text-sm text-slate-500">
                  Lista de cadastros criados a partir do link desta lideranca.
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
                    <p className="text-xs text-slate-500">
                      {formatInteger(person.potencialVotosEstimado)} votos
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Ainda nao ha cadastros vinculados por indicacao.
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
                  Nenhum log registrado para esta lideranca.
                </p>
              )}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Acoes</h3>
            <LeadershipActions
              id={leadership.id}
              status={leadership.status}
              canDelete={canDeleteLeadership(session.user.role)}
            />
          </Card>
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Localizacao</h3>
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
            <p className="text-sm text-slate-600 break-all">
              Link de indicacao: {referralPath}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
