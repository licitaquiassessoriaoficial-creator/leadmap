import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { canDeleteLeadership } from "@/lib/permissions";
import {
  deleteLeadershipRecord,
  getLeadershipById,
  updateLeadershipRecord
} from "@/services/leadership-service";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  const session = await auth();

  if (!session) {
    return jsonError("Nao autenticado", 401);
  }

  const { id } = await context.params;
  const leadership = await getLeadershipById(id);

  if (!leadership) {
    return jsonError("Lideranca nao encontrada", 404);
  }

  return NextResponse.json({ data: leadership });
}

export async function PUT(request: Request, context: Context) {
  const session = await auth();

  if (!session) {
    return jsonError("Nao autenticado", 401);
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const leadership = await updateLeadershipRecord(id, body, session.user.id);

    return NextResponse.json({ data: leadership });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Falha ao atualizar lideranca"
    );
  }
}

export async function DELETE(_: Request, context: Context) {
  const session = await auth();

  if (!session) {
    return jsonError("Nao autenticado", 401);
  }

  if (!canDeleteLeadership(session.user.role)) {
    return jsonError("Apenas administradores podem excluir liderancas", 403);
  }

  try {
    const { id } = await context.params;
    await deleteLeadershipRecord(id, session.user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Falha ao excluir lideranca"
    );
  }
}
