import {
  LeadershipStatus,
  LocationStatus,
  PotentialLevel,
  Prisma
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

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
        equals: filters.cidade,
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
        { cidade: { contains: search, mode: "insensitive" } }
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

const leadershipInclude = {
  cadastradoPor: true
} satisfies Prisma.LeadershipInclude;

export function listLeaderships(
  filters: LeadershipFilters,
  page: number,
  pageSize: number
) {
  return prisma.leadership.findMany({
    where: buildWhere(filters),
    include: leadershipInclude,
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
    include: leadershipInclude
  });
}

export function createLeadership(
  data: Prisma.LeadershipUncheckedCreateInput
) {
  return prisma.leadership.create({
    data,
    include: leadershipInclude
  });
}

export function updateLeadership(
  id: string,
  data: Prisma.LeadershipUncheckedUpdateInput
) {
  return prisma.leadership.update({
    where: { id },
    data,
    include: leadershipInclude
  });
}

export function deleteLeadership(id: string) {
  return prisma.leadership.delete({
    where: { id }
  });
}

export function listRanking(filters: LeadershipFilters, page: number, pageSize: number) {
  return prisma.leadership.findMany({
    where: buildWhere(filters),
    include: leadershipInclude,
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
    include: leadershipInclude,
    orderBy: [{ estado: "asc" }, { cidade: "asc" }, { nome: "asc" }]
  });
}

export function listCities(filters: LeadershipFilters = {}) {
  return prisma.leadership.findMany({
    where: buildWhere(filters),
    select: { cidade: true },
    distinct: ["cidade"],
    orderBy: { cidade: "asc" }
  });
}

export function listStates(filters: LeadershipFilters = {}) {
  return prisma.leadership.findMany({
    where: buildWhere(filters),
    select: { estado: true },
    distinct: ["estado"],
    orderBy: { estado: "asc" }
  });
}

export async function getDashboardAggregates(filters: LeadershipFilters = {}) {
  const where = buildWhere(filters);

  const [total, groupedByCity, groupedByState, groupedByPotential, groupedByStatus, topLeaderships, pendingLocations] =
    await Promise.all([
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
        by: ["estado"],
        _count: {
          estado: true
        },
        orderBy: {
          _count: {
            estado: "desc"
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
        include: leadershipInclude,
        orderBy: [{ quantidadeIndicacoes: "desc" }, { potencialVotosEstimado: "desc" }],
        take: 5
      }),
      prisma.leadership.count({
        where: {
          ...where,
          locationStatus: LocationStatus.PENDING
        }
      })
    ]);

  return {
    total,
    groupedByCity,
    groupedByState,
    groupedByPotential,
    groupedByStatus,
    topLeaderships,
    pendingLocations
  };
}
