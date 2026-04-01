import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS_ID = "default";

export function getCampaignSettingsRecord() {
  return prisma.campaignSettings.upsert({
    where: { id: DEFAULT_SETTINGS_ID },
    update: {},
    create: { id: DEFAULT_SETTINGS_ID }
  });
}

export function updateCampaignSettingsRecord(data: {
  nomeCampanha?: string | null;
  estadoPadrao?: string | null;
  restringirAoEstadoPadrao: boolean;
}) {
  return prisma.campaignSettings.upsert({
    where: { id: DEFAULT_SETTINGS_ID },
    update: data,
    create: {
      id: DEFAULT_SETTINGS_ID,
      ...data
    }
  });
}
