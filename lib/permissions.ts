import { Role } from "@prisma/client";

export function isAdmin(role?: Role | null) {
  return role === Role.ADMIN;
}

export function canDeleteLeadership(role?: Role | null) {
  return isAdmin(role);
}

export function canManageUsers(role?: Role | null) {
  return isAdmin(role);
}
