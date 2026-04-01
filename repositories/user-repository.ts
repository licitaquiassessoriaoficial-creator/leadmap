import { Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdById: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  });
}

export function findDefaultLeadershipOwner() {
  return prisma.user.findFirst({
    where: {
      role: {
        in: [Role.GLOBAL_ADMIN, Role.ADMIN]
      }
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: safeUserSelect
  });
}

export function findSafeUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: safeUserSelect
  });
}

type UserListFilters = {
  role?: Role;
  roles?: Role[];
  createdById?: string;
  ids?: string[];
};

function buildUserWhere(filters: UserListFilters = {}): Prisma.UserWhereInput {
  return {
    id: filters.ids?.length ? { in: filters.ids } : undefined,
    createdById: filters.createdById,
    role: filters.roles?.length
      ? { in: filters.roles }
      : filters.role
  };
}

export function listUsers(filters: UserListFilters = {}) {
  return prisma.user.findMany({
    where: buildUserWhere(filters),
    orderBy: { name: "asc" },
    select: safeUserSelect
  });
}

export function countUsers(filters: UserListFilters = {}) {
  return prisma.user.count({
    where: buildUserWhere(filters)
  });
}

export function countUsersByRole(role: Role) {
  return countUsers({ role });
}

export function listUsersByCreator(createdById: string, role?: Role) {
  return listUsers({
    createdById,
    role
  });
}

export function findManagedUserById(id: string, createdById: string) {
  return prisma.user.findFirst({
    where: {
      id,
      createdById
    }
  });
}

export function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdById?: string | null;
}) {
  return prisma.user.create({
    data,
    select: safeUserSelect
  });
}

export function updateUser(
  id: string,
  data: {
    role?: Role;
    passwordHash?: string;
    name?: string;
    email?: string;
  }
) {
  return prisma.user.update({
    where: { id },
    data,
    select: safeUserSelect
  });
}
