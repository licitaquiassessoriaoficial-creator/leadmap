import { prisma } from "@/lib/prisma";

export function createAuditLog(data: {
  entidade: string;
  entidadeId: string;
  acao: string;
  usuarioId: string;
  descricao: string;
}) {
  return prisma.auditLog.create({
    data
  });
}

export function listAuditLogsForEntity(entidade: string, entidadeId: string) {
  return prisma.auditLog.findMany({
    where: {
      entidade,
      entidadeId
    },
    include: {
      usuario: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
