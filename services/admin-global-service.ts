import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

import {
  createUser,
  findUserByEmail,
  findUserById,
  listUsers,
  updateUser
} from "@/repositories/user-repository";
import { recordAuditLog } from "@/services/audit-service";
import { getCampaignSettings } from "@/services/campaign-settings-service";
import { getUserCountByRole } from "@/services/user-service";
import {
  managedUserCreateSchema,
  managedUserUpdateSchema
} from "@/validations/user-management";

export async function canAccessAdminGlobal(role?: Role | null) {
  if (role === Role.GLOBAL_ADMIN) {
    return { allowed: true, bootstrapMode: false };
  }

  if (role !== Role.ADMIN) {
    return { allowed: false, bootstrapMode: false };
  }

  const globalAdminCount = await getUserCountByRole(Role.GLOBAL_ADMIN);

  return {
    allowed: globalAdminCount === 0,
    bootstrapMode: globalAdminCount === 0
  };
}

export async function getAdminGlobalPageData(role?: Role | null) {
  const access = await canAccessAdminGlobal(role);

  if (!access.allowed) {
    return {
      ...access,
      settings: null,
      users: []
    };
  }

  const [settings, users] = await Promise.all([
    getCampaignSettings(),
    listUsers()
  ]);

  return {
    ...access,
    settings,
    users
  };
}

export async function createManagedUser(rawInput: unknown, usuarioId: string) {
  const input = managedUserCreateSchema.parse(rawInput);
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new Error("Já existe um usuário com este email");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await createUser({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role
  });

  await recordAuditLog({
    entidade: "User",
    entidadeId: user.id,
    acao: "CREATE",
    usuarioId,
    descricao: `Usuário ${user.email} criado com perfil ${user.role}`
  });

  return user;
}

export async function updateManagedUser(
  id: string,
  rawInput: unknown,
  usuarioId: string
) {
  const input = managedUserUpdateSchema.parse(rawInput);
  const targetUser = await findUserById(id);

  if (!targetUser) {
    throw new Error("Usuário não encontrado");
  }

  if (targetUser.role === Role.GLOBAL_ADMIN && input.role && input.role !== Role.GLOBAL_ADMIN) {
    const globalAdminCount = await getUserCountByRole(Role.GLOBAL_ADMIN);

    if (globalAdminCount <= 1) {
      throw new Error("Mantenha ao menos um usuário com perfil admin global");
    }
  }

  const passwordHash = input.password
    ? await bcrypt.hash(input.password, 10)
    : undefined;

  const user = await updateUser(id, {
    role: input.role,
    passwordHash
  });

  await recordAuditLog({
    entidade: "User",
    entidadeId: user.id,
    acao: "UPDATE",
    usuarioId,
    descricao: `Usuário ${user.email} atualizado no admin global`
  });

  return user;
}
