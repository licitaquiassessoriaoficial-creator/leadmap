import { Role } from "@prisma/client";

export function isGlobalAdmin(role?: Role | null) {
  return role === Role.GLOBAL_ADMIN;
}

export function isAdmin(role?: Role | null) {
  return role === Role.ADMIN || isGlobalAdmin(role);
}

export function canDeleteLeadership(role?: Role | null) {
  return isAdmin(role);
}

export function canViewUsers(role?: Role | null) {
  return isAdmin(role);
}

export function canManageUsers(role?: Role | null) {
  return isGlobalAdmin(role);
}
