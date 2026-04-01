import { Role } from "@prisma/client";

import { countUsersByRole, listUsers } from "@/repositories/user-repository";

export async function getUsers(role?: Role) {
  return listUsers(role);
}

export function getUserCountByRole(role: Role) {
  return countUsersByRole(role);
}
