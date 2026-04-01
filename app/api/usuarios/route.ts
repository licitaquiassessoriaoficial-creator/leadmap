import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { canManageTeamUsers, canViewUsers } from "@/lib/permissions";
import { createTeamUser } from "@/services/team-user-service";
import { getManagedUsers } from "@/services/user-service";

export async function GET() {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  if (!canViewUsers(session.user.role)) {
    return jsonError("Acesso restrito a administradores", 403);
  }

  const data = await getManagedUsers(session.user.id, session.user.role);

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  if (!canManageTeamUsers(session.user.role)) {
    return jsonError("Apenas administradores podem cadastrar operadores", 403);
  }

  try {
    const body = await request.json();
    const data = await createTeamUser(body, session.user.id, session.user.role);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Falha ao cadastrar operador"
    );
  }
}
