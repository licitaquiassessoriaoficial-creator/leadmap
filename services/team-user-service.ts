import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

import { canManageTeamUsers } from "@/lib/permissions";
import {
  createUser,
  findManagedUserById,
  findUserByEmail,
  updateUser
} from "@/repositories/user-repository";
import { recordAuditLog } from "@/services/audit-service";
import {
  teamUserCreateSchema,
  teamUserUpdateSchema
} from "@/validations/team-user";

export async function createTeamUser(
  rawInput: unknown,
  managerId: string,
  role?: Role | null
) {
  if (!canManageTeamUsers(role)) {
    throw new Error("Apenas administradores podem gerenciar a equipe");
  }

  const input = teamUserCreateSchema.parse(rawInput);
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new Error("Já existe um usuário com este email");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await createUser({
    name: input.name,
    email: input.email,
    passwordHash,
    role: Role.OPERATOR,
    createdById: managerId
  });

  await recordAuditLog({
    entidade: "User",
    entidadeId: user.id,
    acao: "CREATE",
    usuarioId: managerId,
    descricao: `Operador ${user.email} criado pelo administrador`
  });

  return user;
}

export async function updateTeamUser(
  id: string,
  rawInput: unknown,
  managerId: string,
  role?: Role | null
) {
  if (!canManageTeamUsers(role)) {
    throw new Error("Apenas administradores podem gerenciar a equipe");
  }

  const input = teamUserUpdateSchema.parse(rawInput);
  const targetUser = await findManagedUserById(id, managerId);

  if (!targetUser || targetUser.role !== Role.OPERATOR) {
    throw new Error("Operador não encontrado no seu time");
  }

  if (input.email) {
    const existingUser = await findUserByEmail(input.email);

    if (existingUser && existingUser.id !== id) {
      throw new Error("Já existe um usuário com este email");
    }
  }

  const passwordHash = input.password
    ? await bcrypt.hash(input.password, 10)
    : undefined;

  const user = await updateUser(id, {
    name: input.name,
    email: input.email,
    passwordHash
  });

  await recordAuditLog({
    entidade: "User",
    entidadeId: user.id,
    acao: "UPDATE",
    usuarioId: managerId,
    descricao: `Operador ${user.email} atualizado pelo administrador`
  });

  return user;
}
