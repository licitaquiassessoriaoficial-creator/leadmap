import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { leadershipListInclude } from "@/types/app";

type CityFilters = {
  estado?: string;
  ids?: string[];
  search?: string;
};

function buildWhere(filters: CityFilters = {}): Prisma.CityWhereInput {
  return {
    estado: filters.estado
      ? {
          equals: filters.estado,
          mode: "insensitive"
        }
      : undefined,
    id: filters.ids?.length
      ? {
          in: filters.ids
        }
      : undefined,
    nome: filters.search
      ? {
          contains: filters.search,
          mode: "insensitive"
        }
      : undefined
  };
}

export function listCities(filters: CityFilters = {}) {
  return prisma.city.findMany({
    where: buildWhere(filters),
    orderBy: [{ nome: "asc" }]
  });
}

export function listStates() {
  return prisma.city.findMany({
    select: { estado: true },
    distinct: ["estado"],
    orderBy: { estado: "asc" }
  });
}

export function findCityById(id: string) {
  return prisma.city.findUnique({
    where: { id }
  });
}

export function findCityByNameState(nome: string, estado: string) {
  return prisma.city.findUnique({
    where: {
      nome_estado: {
        nome,
        estado
      }
    }
  });
}

export function listCitiesWithCoverage(filters: CityFilters = {}) {
  return prisma.city.findMany({
    where: buildWhere(filters),
    orderBy: [{ nome: "asc" }],
    include: {
      responsaveis: {
        include: {
          leadership: {
            include: leadershipListInclude
          }
        },
        orderBy: {
          leadership: {
            nome: "asc"
          }
        }
      }
    }
  });
}

export function findCityWithCoverageById(id: string) {
  return prisma.city.findUnique({
    where: { id },
    include: {
      responsaveis: {
        include: {
          leadership: {
            include: leadershipListInclude
          }
        },
        orderBy: {
          leadership: {
            nome: "asc"
          }
        }
      }
    }
  });
}
