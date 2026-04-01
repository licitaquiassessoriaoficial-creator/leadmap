import type { Prisma } from "@prisma/client";

import { safeUserSelect } from "@/repositories/user-repository";

export const leadershipListInclude = {
  cadastradoPor: {
    select: safeUserSelect
  },
  city: true,
  cidadesResponsaveis: {
    include: {
      city: true
    }
  }
} satisfies Prisma.LeadershipInclude;

export const leadershipDetailInclude = {
  cadastradoPor: {
    select: safeUserSelect
  },
  city: true,
  indicadoPor: {
    select: {
      id: true,
      nome: true,
      fotoPerfilUrl: true
    }
  },
  indicados: {
    select: {
      id: true,
      nome: true,
      telefone: true,
      fotoPerfilUrl: true,
      cidade: true,
      estado: true,
      potencialVotosEstimado: true,
      quantidadeIndicacoes: true,
      status: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  },
  cidadesResponsaveis: {
    include: {
      city: true
    },
    orderBy: {
      city: {
        nome: "asc"
      }
    }
  }
} satisfies Prisma.LeadershipInclude;

export type LeadershipWithRelations = Prisma.LeadershipGetPayload<{
  include: typeof leadershipListInclude;
}>;

export type LeadershipWithDetails = Prisma.LeadershipGetPayload<{
  include: typeof leadershipDetailInclude;
}>;

export type AuditLogWithUser = Prisma.AuditLogGetPayload<{
  include: {
    usuario: {
      select: typeof safeUserSelect;
    };
  };
}>;
