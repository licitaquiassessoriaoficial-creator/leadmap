import { Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
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

export function listUsers(role?: Role) {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    orderBy: { name: "asc" },
    select: safeUserSelect
  });
}

export function countUsersByRole(role: Role) {
  return prisma.user.count({
    where: { role }
  });
}

export function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
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
