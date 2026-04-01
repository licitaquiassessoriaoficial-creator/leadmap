import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { auth } from "@/lib/auth";
import {
  canAccessAdminGlobal,
  updateManagedUser
} from "@/services/admin-global-service";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  const access = await canAccessAdminGlobal(session.user.role);

  if (!access.allowed) {
    return jsonError("Acesso restrito ao admin global", 403);
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await updateManagedUser(id, body, session.user.id);

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Falha ao atualizar o usuário"
    );
  }
}
