import { LeadershipStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { setLeadershipStatus } from "@/services/leadership-service";

const statusSchema = z.object({
  status: z.enum([LeadershipStatus.ACTIVE, LeadershipStatus.INACTIVE])
});

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  try {
    const { id } = await context.params;
    const body = statusSchema.parse(await request.json());
    const leadership = await setLeadershipStatus(
      id,
      body.status,
      session.user.id
    );

    return NextResponse.json({ data: leadership });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Falha ao alterar status"
    );
  }
}
