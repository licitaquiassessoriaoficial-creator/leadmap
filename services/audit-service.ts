import { createAuditLog, listAuditLogsForEntity } from "@/repositories/audit-log-repository";

export function recordAuditLog(input: {
  entidade: string;
  entidadeId: string;
  acao: string;
  usuarioId: string;
  descricao: string;
}) {
  return createAuditLog(input);
}

export function getEntityAuditLogs(entidade: string, entidadeId: string) {
  return listAuditLogsForEntity(entidade, entidadeId);
}
