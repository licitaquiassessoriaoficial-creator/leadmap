import { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

function getDb(db?: DbClient) {
  return db ?? prisma;
}

export function createPerformanceSnapshot(
  data: Prisma.PerformanceHistoryUncheckedCreateInput,
  db?: DbClient
) {
  return getDb(db).performanceHistory.create({
    data
  });
}
