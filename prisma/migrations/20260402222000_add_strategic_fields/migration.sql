ALTER TABLE "City"
ADD COLUMN "codigoIbge" TEXT,
ADD COLUMN "metaVotosCidade" INTEGER;

ALTER TABLE "Leadership"
ADD COLUMN "whatsapp" TEXT,
ADD COLUMN "votosReais" INTEGER,
ADD COLUMN "metaVotosIndividual" INTEGER,
ADD COLUMN "scoreLideranca" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "referralCode" TEXT;

UPDATE "Leadership"
SET
  "whatsapp" = REGEXP_REPLACE("telefone", '\D', '', 'g'),
  "referralCode" = "id";

ALTER TABLE "Leadership"
ALTER COLUMN "referralCode" SET NOT NULL;

CREATE UNIQUE INDEX "Leadership_referralCode_key" ON "Leadership"("referralCode");

CREATE TABLE "ReferralSignup" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "telefone" TEXT NOT NULL,
  "email" TEXT,
  "cidade" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'SP',
  "observacoes" TEXT,
  "origemRef" TEXT,
  "leadershipId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReferralSignup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PerformanceHistory" (
  "id" TEXT NOT NULL,
  "leadershipId" TEXT NOT NULL,
  "dataReferencia" TIMESTAMP(3) NOT NULL,
  "votosEstimados" INTEGER NOT NULL,
  "votosReais" INTEGER,
  "quantidadeIndicacoes" INTEGER NOT NULL,
  "custoTotal" DOUBLE PRECISION,
  "score" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PerformanceHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReferralSignup_leadershipId_idx" ON "ReferralSignup"("leadershipId");
CREATE INDEX "ReferralSignup_origemRef_idx" ON "ReferralSignup"("origemRef");
CREATE INDEX "ReferralSignup_createdAt_idx" ON "ReferralSignup"("createdAt");
CREATE INDEX "PerformanceHistory_leadershipId_dataReferencia_idx" ON "PerformanceHistory"("leadershipId", "dataReferencia");
CREATE INDEX "City_codigoIbge_idx" ON "City"("codigoIbge");

ALTER TABLE "ReferralSignup"
ADD CONSTRAINT "ReferralSignup_leadershipId_fkey"
FOREIGN KEY ("leadershipId") REFERENCES "Leadership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PerformanceHistory"
ADD CONSTRAINT "PerformanceHistory_leadershipId_fkey"
FOREIGN KEY ("leadershipId") REFERENCES "Leadership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
