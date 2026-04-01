-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'GLOBAL_ADMIN';

-- CreateTable
CREATE TABLE "CampaignSettings" (
    "id" TEXT NOT NULL,
    "nomeCampanha" TEXT,
    "estadoPadrao" TEXT,
    "restringirAoEstadoPadrao" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignSettings_pkey" PRIMARY KEY ("id")
);
