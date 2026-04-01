/*
  Warnings:

  - Added the required column `cidadeId` to the `Leadership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CampaignSettings" ALTER COLUMN "id" SET DEFAULT 'default';

-- AlterTable
ALTER TABLE "Leadership" ADD COLUMN     "cidadeId" TEXT NOT NULL,
ADD COLUMN     "custoTotal" DOUBLE PRECISION,
ADD COLUMN     "fotoPerfilUrl" TEXT,
ADD COLUMN     "indicadoPorId" TEXT,
ALTER COLUMN "estado" SET DEFAULT 'SP';

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'SP',
    "totalEleitores" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadershipCity" (
    "leadershipId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadershipCity_pkey" PRIMARY KEY ("leadershipId","cityId")
);

-- CreateIndex
CREATE INDEX "City_estado_nome_idx" ON "City"("estado", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "City_nome_estado_key" ON "City"("nome", "estado");

-- CreateIndex
CREATE INDEX "LeadershipCity_cityId_idx" ON "LeadershipCity"("cityId");

-- CreateIndex
CREATE INDEX "Leadership_cidadeId_idx" ON "Leadership"("cidadeId");

-- CreateIndex
CREATE INDEX "Leadership_indicadoPorId_idx" ON "Leadership"("indicadoPorId");

-- AddForeignKey
ALTER TABLE "Leadership" ADD CONSTRAINT "Leadership_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leadership" ADD CONSTRAINT "Leadership_indicadoPorId_fkey" FOREIGN KEY ("indicadoPorId") REFERENCES "Leadership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadershipCity" ADD CONSTRAINT "LeadershipCity_leadershipId_fkey" FOREIGN KEY ("leadershipId") REFERENCES "Leadership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadershipCity" ADD CONSTRAINT "LeadershipCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
