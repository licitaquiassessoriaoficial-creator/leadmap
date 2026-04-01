import { LocationStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { LeadershipActions } from "@/components/liderancas/leadership-actions";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { LeadershipStatusBadge } from "@/components/shared/status-badge";
import { PotentialBadge } from "@/components/shared/potential-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { canDeleteLeadership } from "@/lib/permissions";
import { formatCoordinate, formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
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
    getLeadershipById(id, session?.user.role),
    getEntityAuditLogs("Leadership", id)
  ]);

  if (!leadership || !session) {
    notFound();
  }

  const feedback =
    typeof resolvedSearchParams.feedback === "string"
      ? decodeURIComponent(resolvedSearchParams.feedback)
      : undefined;

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
            <div className="flex flex-wrap items-center gap-3">
              <LeadershipStatusBadge status={leadership.status} />
              <PotentialBadge level={leadership.faixaPotencial} />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {leadership.quantidadeIndicacoes} indicações
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Telefone</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.telefone}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.email ?? "Não informado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Endereço</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.endereco ?? "Não informado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Bairro</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.bairro ?? "Não informado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Potencial estimado</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.potencialVotosEstimado}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Responsável</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {leadership.cadastradoPor.name}
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
            <h3 className="text-lg font-semibold text-slate-900">Localização</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Status:</span>{" "}
                {leadership.locationStatus === LocationStatus.FOUND
                  ? "Encontrada"
                  : "Pendente"}
              </p>
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
          </Card>
        </div>
      </div>
    </div>
  );
}
