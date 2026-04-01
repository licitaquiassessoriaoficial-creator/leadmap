import { Role } from "@prisma/client";

import {
  countUsers,
  countUsersByRole,
  findSafeUserById,
  listUsers,
  listUsersByCreator
} from "@/repositories/user-repository";

export async function getUsers(role?: Role) {
  return listUsers(role ? { role } : {});
}

export function getUserCountByRole(role: Role) {
  return countUsersByRole(role);
}

export async function getScopedLeadershipUserIds(
  userId?: string,
  role?: Role | null
) {
  if (!userId || !role) {
    return undefined;
  }

  if (role === Role.GLOBAL_ADMIN) {
    return undefined;
  }

  if (role === Role.ADMIN) {
    const operators = await listUsersByCreator(userId, Role.OPERATOR);
    return [userId, ...operators.map((user) => user.id)];
  }

  return [userId];
}

export async function getVisibleUsersForLeadershipFilters(
  userId: string,
  role?: Role | null
) {
  if (!role) {
    return [];
  }

  if (role === Role.GLOBAL_ADMIN) {
    return listUsers();
  }

  if (role === Role.ADMIN) {
    const [self, operators] = await Promise.all([
      findSafeUserById(userId),
      listUsersByCreator(userId, Role.OPERATOR)
    ]);

    return self ? [self, ...operators] : operators;
  }

  const self = await findSafeUserById(userId);
  return self ? [self] : [];
}

export async function getManagedUsers(userId: string, role?: Role | null) {
  if (!role) {
    return [];
  }

  if (role === Role.GLOBAL_ADMIN) {
    return listUsers();
  }

  if (role === Role.ADMIN) {
    return listUsersByCreator(userId, Role.OPERATOR);
  }

  return [];
}

export async function getManagedUserSummary(
  userId: string,
  role?: Role | null
) {
  if (!role) {
    return {
      total: 0,
      admins: 0,
      operators: 0
    };
  }

  if (role === Role.GLOBAL_ADMIN) {
    const [total, admins, operators] = await Promise.all([
      countUsers(),
      countUsers({ roles: [Role.ADMIN, Role.GLOBAL_ADMIN] }),
      countUsers({ role: Role.OPERATOR })
    ]);

    return { total, admins, operators };
  }

  if (role === Role.ADMIN) {
    const operators = await countUsers({
      createdById: userId,
      role: Role.OPERATOR
    });

    return {
      total: operators,
      admins: 1,
      operators
    };
  }

  return {
    total: 0,
    admins: 0,
    operators: 0
  };
}
