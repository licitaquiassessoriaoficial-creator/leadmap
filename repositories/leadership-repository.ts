import {
  LeadershipStatus,
  LocationStatus,
  PotentialLevel,
  Prisma,
  PrismaClient
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { leadershipDetailInclude, leadershipListInclude } from "@/types/app";

export type LeadershipFilters = {
  search?: string;
  cidade?: string;
  estado?: string;
  faixaPotencial?: PotentialLevel;
  status?: LeadershipStatus;
  responsavelId?: string;
  responsavelIds?: string[];
  startDate?: Date;
  endDate?: Date;
};

type DbClient = PrismaClient | Prisma.TransactionClient;

function getDb(db?: DbClient) {
  return db ?? prisma;
}

function buildWhere(filters: LeadershipFilters): Prisma.LeadershipWhereInput {
  const search = filters.search?.trim();

  const createdAt =
    filters.startDate || filters.endDate
      ? {
          ...(filters.startDate ? { gte: filters.startDate } : {}),
          ...(filters.endDate ? { lte: filters.endDate } : {})
        }
      : undefined;

  const conditions: Prisma.LeadershipWhereInput[] = [];

  if (filters.cidade) {
    conditions.push({
      cidade: {
        contains: filters.cidade,
        mode: "insensitive"
      }
    });
  }

  if (filters.estado) {
    conditions.push({
      estado: {
        equals: filters.estado,
        mode: "insensitive"
      }
    });
  }

  if (filters.faixaPotencial) {
    conditions.push({
      faixaPotencial: filters.faixaPotencial
    });
  }

  if (filters.status) {
    conditions.push({
      status: filters.status
    });
  }

  if (filters.responsavelIds?.length) {
    conditions.push({
      cadastradoPorId: {
        in: filters.responsavelIds
      }
    });
  }

  if (filters.responsavelId) {
    conditions.push({
      cadastradoPorId: filters.responsavelId
    });
  }

  if (createdAt) {
    conditions.push({ createdAt });
  }

  if (search) {
    conditions.push({
      OR: [
        { nome: { contains: search, mode: "insensitive" } },
        { telefone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { cidade: { contains: search, mode: "insensitive" } },
        { bairro: { contains: search, mode: "insensitive" } }
      ]
    });
  }

  if (!conditions.length) {
    return {};
  }

  return {
    AND: conditions
  };
}

export function listLeaderships(
  filters: LeadershipFilters,
  page: number,
  pageSize: number
) {
  return prisma.leadership.findMany({
    where: buildWhere(filters),
    include: leadershipListInclude,
    orderBy: [{ updatedAt: "desc" }, { nome: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize
  });
}

export function countLeaderships(filters: LeadershipFilters) {
  return prisma.leadership.count({
    where: buildWhere(filters)
  });
}

export function findLeadershipById(
  id: string,
  filters: Pick<LeadershipFilters, "estado" | "responsavelIds"> = {}
) {
  return prisma.leadership.findFirst({
    where: {
      id,
      estado: filters.estado
        ? {
            equals: filters.estado,
            mode: "insensitive"
          }
        : undefined,
      cadastradoPorId: filters.responsavelIds?.length
        ? {
            in: filters.responsavelIds
          }
        : undefined
    },
    include: leadershipDetailInclude
  });
}

export function findLeadershipDetailsById(id: string, db?: DbClient) {
  return getDb(db).leadership.findUnique({
    where: { id },
    include: leadershipDetailInclude
  });
}

export function findLeadershipSummaryById(id: string, db?: DbClient) {
  return getDb(db).leadership.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      cidadeId: true,
      indicadoPorId: true
    }
  });
}

export function createLeadership(
  data: Prisma.LeadershipUncheckedCreateInput,
  db?: DbClient
) {
  return getDb(db).leadership.create({
    data,
    include: leadershipDetailInclude
  });
}

export function updateLeadership(
  id: string,
  data: Prisma.LeadershipUncheckedUpdateInput,
  db?: DbClient
) {
  return getDb(db).leadership.update({
    where: { id },
    data,
    include: leadershipDetailInclude
  });
}

export function deleteLeadership(id: string, db?: DbClient) {
  return getDb(db).leadership.delete({
    where: { id }
  });
}

export async function replaceLeadershipResponsibleCities(
  leadershipId: string,
  cityIds: string[],
  db?: DbClient
) {
  const uniqueCityIds = Array.from(new Set(cityIds));
  const database = getDb(db);

  await database.leadershipCity.deleteMany({
    where: { leadershipId }
  });

  if (!uniqueCityIds.length) {
    return;
  }

  await database.leadershipCity.createMany({
    data: uniqueCityIds.map((cityId) => ({
      leadershipId,
      cityId
    })),
    skipDuplicates: true
  });
}

export function incrementLeadershipIndications(id: string, db?: DbClient) {
  return getDb(db).leadership.update({
    where: { id },
    data: {
      quantidadeIndicacoes: {
        increment: 1
      }
    }
  });
}

export function decrementLeadershipIndications(id: string, db?: DbClient) {
  return getDb(db).leadership.update({
    where: { id },
    data: {
      quantidadeIndicacoes: {
        decrement: 1
      }
    }
  });
}

export function listRanking(filters: LeadershipFilters, page: number, pageSize: number) {
  return prisma.leadership.findMany({
    where: buildWhere(filters),
    include: leadershipListInclude,
    orderBy: [
      { quantidadeIndicacoes: "desc" },
      { potencialVotosEstimado: "desc" },
      { nome: "asc" }
    ],
    skip: (page - 1) * pageSize,
    take: pageSize
  });
}

export function listMapLeaderships(filters: LeadershipFilters) {
  return prisma.leadership.findMany({
    where: {
      ...buildWhere(filters),
      latitude: {
        not: null
      },
      longitude: {
        not: null
      }
    },
    include: leadershipListInclude,
    orderBy: [{ cidade: "asc" }, { nome: "asc" }]
  });
}

export async function getDashboardAggregates(filters: LeadershipFilters = {}) {
  const where = buildWhere(filters);

  const [
    total,
    groupedByCity,
    groupedByPotential,
    groupedByStatus,
    topLeaderships,
    pendingLocations,
    estimatedVotes
  ] = await Promise.all([
    prisma.leadership.count({ where }),
    prisma.leadership.groupBy({
      where,
      by: ["cidade"],
      _count: {
        cidade: true
      },
      orderBy: {
        _count: {
          cidade: "desc"
        }
      }
    }),
    prisma.leadership.groupBy({
      where,
      by: ["faixaPotencial"],
      _count: {
        faixaPotencial: true
      }
    }),
    prisma.leadership.groupBy({
      where,
      by: ["status"],
      _count: {
        status: true
      }
    }),
    prisma.leadership.findMany({
      where,
      include: leadershipListInclude,
      orderBy: [{ quantidadeIndicacoes: "desc" }, { potencialVotosEstimado: "desc" }],
      take: 5
    }),
    prisma.leadership.count({
      where: {
        ...where,
        locationStatus: LocationStatus.PENDING
      }
    }),
    prisma.leadership.aggregate({
      where,
      _sum: {
        potencialVotosEstimado: true
      }
    })
  ]);

  return {
    total,
    groupedByCity,
    groupedByPotential,
    groupedByStatus,
    topLeaderships,
    pendingLocations,
    estimatedVotes: estimatedVotes._sum.potencialVotosEstimado ?? 0
  };
}
