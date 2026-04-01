import { Role } from "@prisma/client";

import { optionalText } from "@/lib/utils";
import {
  getCampaignSettingsRecord,
  updateCampaignSettingsRecord
} from "@/repositories/campaign-settings-repository";
import { recordAuditLog } from "@/services/audit-service";
import { campaignSettingsSchema } from "@/validations/campaign-settings";

export async function getCampaignSettings() {
  return getCampaignSettingsRecord();
}

export async function getCampaignScope(role?: Role | null) {
  const settings = await getCampaignSettingsRecord();
  const enforcedState =
    role && role !== Role.GLOBAL_ADMIN && settings.restringirAoEstadoPadrao
      ? settings.estadoPadrao ?? undefined
      : undefined;

  return {
    settings,
    enforcedState,
    stateLocked: Boolean(enforcedState)
  };
}

export async function updateCampaignSettings(
  rawInput: unknown,
  usuarioId: string
) {
  const input = campaignSettingsSchema.parse(rawInput);

  const settings = await updateCampaignSettingsRecord({
    nomeCampanha: optionalText(input.nomeCampanha) ?? null,
    estadoPadrao: input.estadoPadrao ?? null,
    restringirAoEstadoPadrao: input.restringirAoEstadoPadrao
  });

  await recordAuditLog({
    entidade: "CampaignSettings",
    entidadeId: settings.id,
    acao: "UPDATE",
    usuarioId,
    descricao: input.restringirAoEstadoPadrao && settings.estadoPadrao
      ? `Campanha configurada para operar no estado ${settings.estadoPadrao}`
      : "Configuração global da campanha atualizada"
  });

  return settings;
}
