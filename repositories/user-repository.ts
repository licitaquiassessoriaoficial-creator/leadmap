import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

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
    orderBy: [{ role: "asc" }, { name: "asc" }]
  });
}
