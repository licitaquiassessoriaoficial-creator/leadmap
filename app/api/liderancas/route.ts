import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getQueryObject, jsonError } from "@/lib/api";
import {
  createLeadershipRecord,
  getLeadershipList
} from "@/services/leadership-service";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  const url = new URL(request.url);
  const data = await getLeadershipList(
    getQueryObject(url.searchParams),
    session.user.role,
    session.user.id
  );

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  try {
    const body = await request.json();
    const leadership = await createLeadershipRecord(
      body,
      session.user.id,
      session.user.role
    );

    return NextResponse.json({ data: leadership }, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Falha ao criar liderança"
    );
  }
}
