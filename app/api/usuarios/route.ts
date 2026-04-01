import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { canViewUsers } from "@/lib/permissions";
import { getUsers } from "@/services/user-service";

export async function GET() {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  if (!canViewUsers(session.user.role)) {
    return jsonError("Acesso restrito a administradores", 403);
  }

  const data = await getUsers();

  return NextResponse.json({ data });
}
