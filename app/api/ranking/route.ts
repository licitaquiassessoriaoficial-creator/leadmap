import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getQueryObject, jsonError } from "@/lib/api";
import { getRankingData } from "@/services/ranking-service";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  const url = new URL(request.url);
  const data = await getRankingData(getQueryObject(url.searchParams), session.user.role);

  return NextResponse.json({ data });
}
