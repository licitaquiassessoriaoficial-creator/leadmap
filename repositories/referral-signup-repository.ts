import { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

function getDb(db?: DbClient) {
  return db ?? prisma;
}

export function createReferralSignup(
  data: Prisma.ReferralSignupUncheckedCreateInput,
  db?: DbClient
) {
  return getDb(db).referralSignup.create({
    data
  });
}

export function listReferralSignupsByLeadership(
  leadershipId: string,
  db?: DbClient
) {
  return getDb(db).referralSignup.findMany({
    where: { leadershipId },
    orderBy: { createdAt: "desc" }
  });
}
