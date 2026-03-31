-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "LeadershipStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "PotentialLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "LocationStatus" AS ENUM ('FOUND', 'PENDING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leadership" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "bairro" TEXT,
    "endereco" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "locationStatus" "LocationStatus" NOT NULL DEFAULT 'PENDING',
    "potencialVotosEstimado" INTEGER NOT NULL,
    "faixaPotencial" "PotentialLevel" NOT NULL,
    "status" "LeadershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "observacoes" TEXT,
    "quantidadeIndicacoes" INTEGER NOT NULL DEFAULT 0,
    "cadastradoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leadership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Leadership_cidade_idx" ON "Leadership"("cidade");

-- CreateIndex
CREATE INDEX "Leadership_estado_idx" ON "Leadership"("estado");

-- CreateIndex
CREATE INDEX "Leadership_faixaPotencial_idx" ON "Leadership"("faixaPotencial");

-- CreateIndex
CREATE INDEX "Leadership_status_idx" ON "Leadership"("status");

-- CreateIndex
CREATE INDEX "Leadership_locationStatus_idx" ON "Leadership"("locationStatus");

-- CreateIndex
CREATE INDEX "Leadership_cadastradoPorId_idx" ON "Leadership"("cadastradoPorId");

-- CreateIndex
CREATE INDEX "Leadership_createdAt_idx" ON "Leadership"("createdAt");

-- CreateIndex
CREATE INDEX "Leadership_quantidadeIndicacoes_idx" ON "Leadership"("quantidadeIndicacoes");

-- CreateIndex
CREATE INDEX "AuditLog_entidade_entidadeId_idx" ON "AuditLog"("entidade", "entidadeId");

-- CreateIndex
CREATE INDEX "AuditLog_usuarioId_idx" ON "AuditLog"("usuarioId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Leadership" ADD CONSTRAINT "Leadership_cadastradoPorId_fkey" FOREIGN KEY ("cadastradoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
