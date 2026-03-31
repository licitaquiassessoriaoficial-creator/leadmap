import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getQueryObject, jsonError } from "@/lib/api";
import { getMapData } from "@/services/map-service";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  const url = new URL(request.url);
  const data = await getMapData(getQueryObject(url.searchParams));

  return NextResponse.json({ data });
}
