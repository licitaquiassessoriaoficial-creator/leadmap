import { Role } from "@prisma/client";

import { listUsers } from "@/repositories/user-repository";

export async function getUsers(role?: Role) {
  return listUsers(role);
}
