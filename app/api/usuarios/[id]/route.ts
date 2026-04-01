import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { canManageTeamUsers } from "@/lib/permissions";
import { updateTeamUser } from "@/services/team-user-service";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  if (!canManageTeamUsers(session.user.role)) {
    return jsonError("Apenas administradores podem atualizar operadores", 403);
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await updateTeamUser(
      id,
      body,
      session.user.id,
      session.user.role
    );

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Falha ao atualizar operador"
    );
  }
}
