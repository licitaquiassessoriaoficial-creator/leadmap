import type { AuditLog, Leadership, User } from "@prisma/client";

export type LeadershipWithRelations = Leadership & {
  cadastradoPor: User;
};

export type AuditLogWithUser = AuditLog & {
  usuario: User;
};
