import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { auth } from "@/lib/auth";
import {
  canAccessAdminGlobal,
  createManagedUser
} from "@/services/admin-global-service";

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  const access = await canAccessAdminGlobal(session.user.role);

  if (!access.allowed) {
    return jsonError("Acesso restrito ao admin global", 403);
  }

  try {
    const body = await request.json();
    const data = await createManagedUser(body, session.user.id);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Falha ao liberar o acesso"
    );
  }
}
