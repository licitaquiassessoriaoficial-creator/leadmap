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
    orderBy: { name: "asc" }
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
    data
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
    data
  });
}
