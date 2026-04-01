import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { getDashboardData } from "@/services/dashboard-service";

export async function GET() {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  const data = await getDashboardData(session.user.role);

  return NextResponse.json({ data });
}
