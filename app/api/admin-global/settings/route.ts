import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { auth } from "@/lib/auth";
import { updateCampaignSettings } from "@/services/campaign-settings-service";
import { canAccessAdminGlobal } from "@/services/admin-global-service";

export async function PUT(request: Request) {
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
    const data = await updateCampaignSettings(body, session.user.id);

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "Falha ao salvar a configuração da campanha"
    );
  }
}
