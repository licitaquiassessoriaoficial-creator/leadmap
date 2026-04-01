import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { createPublicLeadershipRecord } from "@/services/leadership-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const leadership = await createPublicLeadershipRecord(body);

    return NextResponse.json({ data: leadership }, { status: 201 });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Falha ao concluir o cadastro"
    );
  }
}
