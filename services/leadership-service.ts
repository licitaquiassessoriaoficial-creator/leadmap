import { LeadershipStatus, LocationStatus, Role } from "@prisma/client";

import { calculateCostPerVote } from "@/lib/domain/leadership";
import { classifyPotentialLevel } from "@/lib/constants/potential";
import { prisma } from "@/lib/prisma";
import { optionalText } from "@/lib/utils";
import {
  findCityById,
  listCities as listRegisteredCities,
  listStates as listRegisteredStates
} from "@/repositories/city-repository";
import {
  countLeaderships,
  createLeadership,
  decrementLeadershipIndications,
  deleteLeadership,
  findLeadershipById,
  findLeadershipDetailsById,
  findLeadershipSummaryById,
  incrementLeadershipIndications,
  listLeaderships,
  replaceLeadershipResponsibleCities,
  updateLeadership
} from "@/repositories/leadership-repository";
import { findDefaultLeadershipOwner } from "@/repositories/user-repository";
import { recordAuditLog } from "@/services/audit-service";
import { geocodeCityState } from "@/services/geocoding-service";
import { getScopedLeadershipUserIds } from "@/services/user-service";
import {
  leadershipCreateSchema,
  leadershipQuerySchema,
  leadershipUpdateSchema,
  publicLeadershipCreateSchema
} from "@/validations/leadership";
import { getCampaignScope } from "@/services/campaign-settings-service";

function normalizeState(value?: string) {
  return value?.trim().toUpperCase();
}

async function resolveScopedState(role?: Role | null) {
  if (!role) {
    return undefined;
  }

  const scope = await getCampaignScope(role);
  return scope.enforcedState;
}

async function resolveLeadershipScope(userId?: string, role?: Role | null) {
  const [enforcedState, responsavelIds] = await Promise.all([
    resolveScopedState(role),
    getScopedLeadershipUserIds(userId, role)
  ]);

  return {
    enforcedState,
    responsavelIds
  };
}

async function resolveCity(cidadeId: string, enforcedState?: string) {
  const city = await findCityById(cidadeId);

  if (!city) {
    throw new Error("Cidade nao encontrada");
  }

  if (enforcedState && city.estado !== enforcedState) {
    throw new Error("Cidade fora do escopo configurado");
  }

  return city;
}

async function resolveCoordinates(cidade: string, estado: string, fallback?: {
  latitude?: number | null;
  longitude?: number | null;
}) {
  const geocoded = await geocodeCityState(cidade, estado);

  if (geocoded) {
    return {
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      locationStatus: LocationStatus.FOUND
    };
  }

  if (fallback?.latitude != null && fallback.longitude != null) {
    return {
      latitude: fallback.latitude,
      longitude: fallback.longitude,
      locationStatus: LocationStatus.FOUND
    };
  }

  return {
    latitude: null,
    longitude: null,
    locationStatus: LocationStatus.PENDING
  };
}

function buildResponsibleCityIds(baseCityId: string, cityIds?: string[]) {
  return Array.from(new Set([baseCityId, ...(cityIds ?? [])]));
}

function buildCreatePayload(
  input: ReturnType<typeof leadershipCreateSchema.parse>,
  city: Awaited<ReturnType<typeof resolveCity>>,
  userId: string,
  status: LeadershipStatus
) {
  const faixaPotencial = classifyPotentialLevel(input.potencialVotosEstimado);

  return {
    nome: input.nome.trim(),
    telefone: input.telefone.trim(),
    email: optionalText(input.email),
    cpf: optionalText(input.cpf),
    fotoPerfilUrl: optionalText(input.fotoPerfilUrl),
    cidade: city.nome,
    estado: city.estado,
    cidadeId: city.id,
    bairro: optionalText(input.bairro),
    endereco: optionalText(input.endereco),
    observacoes: optionalText(input.observacoes),
    potencialVotosEstimado: input.potencialVotosEstimado,
    custoTotal: input.custoTotal ?? null,
    faixaPotencial,
    status,
    cadastradoPorId: userId
  };
}

function parseDateRange(startDate?: string, endDate?: string) {
  return {
    startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
    endDate: endDate ? new Date(`${endDate}T23:59:59.999`) : undefined
  };
}

export async function getLeadershipFilters(
  role?: Role | null,
  userId?: string
) {
  const { enforcedState } = await resolveLeadershipScope(userId, role);
  const [cities, states] = await Promise.all([
    listRegisteredCities({
      estado: enforcedState
    }),
    listRegisteredStates()
  ]);

  return {
    cities: cities.map((item) => item.nome),
    states: (enforcedState
      ? states.filter((item) => item.estado === enforcedState)
      : states
    ).map((item) => item.estado),
    cityOptions: cities,
    enforcedState
  };
}

export async function getLeadershipList(
  rawQuery: Record<string, string | string[] | undefined>,
  role?: Role | null,
  userId?: string
) {
  const { enforcedState, responsavelIds } = await resolveLeadershipScope(
    userId,
    role
  );
  const query = leadershipQuerySchema.parse({
    page: rawQuery.page,
    pageSize: rawQuery.pageSize,
    search: rawQuery.search,
    cidade: rawQuery.cidade,
    estado: enforcedState ?? rawQuery.estado ?? "SP",
    faixaPotencial: rawQuery.faixaPotencial,
    status: rawQuery.status,
    responsavelId: rawQuery.responsavelId,
    startDate: rawQuery.startDate,
    endDate: rawQuery.endDate
  });

  const filters = {
    search: query.search,
    cidade: query.cidade,
    estado: normalizeState(enforcedState ?? query.estado),
    faixaPotencial: query.faixaPotencial,
    status: query.status,
    responsavelId: query.responsavelId,
    responsavelIds,
    ...parseDateRange(query.startDate, query.endDate)
  };

  const [items, total] = await Promise.all([
    listLeaderships(filters, query.page, query.pageSize),
    countLeaderships(filters)
  ]);

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    filters: {
      ...query,
      estado: normalizeState(enforcedState ?? query.estado ?? "SP")
    }
  };
}

export async function getLeadershipById(
  id: string,
  role?: Role | null,
  userId?: string
) {
  const { enforcedState, responsavelIds } = await resolveLeadershipScope(
    userId,
    role
  );

  return findLeadershipById(id, {
    estado: enforcedState,
    responsavelIds
  });
}

export async function getReferralLeadership(id: string) {
  return findLeadershipSummaryById(id);
}

export async function createLeadershipRecord(
  rawInput: unknown,
  userId: string,
  role?: Role | null
) {
  const input = leadershipCreateSchema.parse(rawInput);
  const enforcedState = await resolveScopedState(role);
  const city = await resolveCity(input.cidadeId, enforcedState);
  const payload = buildCreatePayload(
    {
      ...input,
      estado: enforcedState ?? city.estado
    },
    city,
    userId,
    input.status ?? LeadershipStatus.ACTIVE
  );
  const coordinates = await resolveCoordinates(city.nome, city.estado, city);
  const responsibleCityIds = buildResponsibleCityIds(
    city.id,
    input.cidadesResponsaveisIds
  );

  const leadership = await prisma.$transaction(async (tx) => {
    const created = await createLeadership(
      {
        ...payload,
        ...coordinates
      },
      tx
    );

    await replaceLeadershipResponsibleCities(created.id, responsibleCityIds, tx);

    return findLeadershipDetailsById(created.id, tx);
  });

  if (!leadership) {
    throw new Error("Falha ao carregar a lideranca criada");
  }

  await recordAuditLog({
    entidade: "Leadership",
    entidadeId: leadership.id,
    acao: "CREATE",
    usuarioId: userId,
    descricao: `Lideranca ${leadership.nome} criada`
  });

  return leadership;
}

export async function createPublicLeadershipRecord(rawInput: unknown) {
  const input = publicLeadershipCreateSchema.parse(rawInput);
  const [city, owner, referrer] = await Promise.all([
    resolveCity(input.cidadeId, "SP"),
    findDefaultLeadershipOwner(),
    input.indicadoPorId ? findLeadershipSummaryById(input.indicadoPorId) : null
  ]);

  if (!owner) {
    throw new Error("Nenhum usuario administrativo disponivel para o cadastro");
  }

  if (input.indicadoPorId && !referrer) {
    throw new Error("Link de indicacao invalido");
  }

  const payload = buildCreatePayload(
    {
      ...input,
      estado: city.estado
    },
    city,
    owner.id,
    LeadershipStatus.PENDING
  );
  const coordinates = await resolveCoordinates(city.nome, city.estado, city);
  const responsibleCityIds = buildResponsibleCityIds(
    city.id,
    input.cidadesResponsaveisIds
  );

  const leadership = await prisma.$transaction(async (tx) => {
    const created = await createLeadership(
      {
        ...payload,
        ...coordinates,
        indicadoPorId: referrer?.id ?? null
      },
      tx
    );

    await replaceLeadershipResponsibleCities(created.id, responsibleCityIds, tx);

    if (referrer) {
      await incrementLeadershipIndications(referrer.id, tx);
    }

    return findLeadershipDetailsById(created.id, tx);
  });

  if (!leadership) {
    throw new Error("Falha ao concluir o cadastro");
  }

  await recordAuditLog({
    entidade: "Leadership",
    entidadeId: leadership.id,
    acao: "CREATE",
    usuarioId: owner.id,
    descricao: referrer
      ? `Lideranca ${leadership.nome} criada via indicacao de ${referrer.nome}`
      : `Lideranca ${leadership.nome} criada via cadastro publico`
  });

  return leadership;
}

export async function updateLeadershipRecord(
  id: string,
  rawInput: unknown,
  userId: string,
  role?: Role | null
) {
  const { enforcedState, responsavelIds } = await resolveLeadershipScope(
    userId,
    role
  );
  const existing = await findLeadershipById(id, {
    estado: enforcedState,
    responsavelIds
  });

  if (!existing) {
    throw new Error("Lideranca nao encontrada");
  }

  const input = leadershipUpdateSchema.parse(rawInput);
  const city = input.cidadeId
    ? await resolveCity(input.cidadeId, enforcedState)
    : existing.city;

  if (!city) {
    throw new Error("Cidade base nao encontrada");
  }

  const shouldRefreshCoordinates = city.id !== existing.cidadeId;
  const coordinates = shouldRefreshCoordinates
    ? await resolveCoordinates(city.nome, city.estado, city)
    : {
        latitude: existing.latitude,
        longitude: existing.longitude,
        locationStatus: existing.locationStatus
      };

  const potentialValue =
    input.potencialVotosEstimado ?? existing.potencialVotosEstimado;
  const responsibleCityIds = buildResponsibleCityIds(
    city.id,
    input.cidadesResponsaveisIds ??
      existing.cidadesResponsaveis.map((item) => item.cityId)
  );

  const leadership = await prisma.$transaction(async (tx) => {
    await updateLeadership(
      id,
      {
        nome: input.nome?.trim(),
        telefone: input.telefone?.trim(),
        email: input.email === undefined ? undefined : optionalText(input.email),
        cpf: input.cpf === undefined ? undefined : optionalText(input.cpf),
        fotoPerfilUrl:
          input.fotoPerfilUrl === undefined
            ? undefined
            : optionalText(input.fotoPerfilUrl),
        cidade: city.nome,
        estado: city.estado,
        cidadeId: city.id,
        bairro:
          input.bairro === undefined ? undefined : optionalText(input.bairro),
        endereco:
          input.endereco === undefined ? undefined : optionalText(input.endereco),
        observacoes:
          input.observacoes === undefined
            ? undefined
            : optionalText(input.observacoes),
        potencialVotosEstimado: potentialValue,
        custoTotal:
          input.custoTotal === undefined ? undefined : input.custoTotal ?? null,
        faixaPotencial: classifyPotentialLevel(potentialValue),
        status: input.status,
        ...coordinates
      },
      tx
    );

    await replaceLeadershipResponsibleCities(id, responsibleCityIds, tx);

    return findLeadershipDetailsById(id, tx);
  });

  if (!leadership) {
    throw new Error("Falha ao carregar a lideranca atualizada");
  }

  await recordAuditLog({
    entidade: "Leadership",
    entidadeId: leadership.id,
    acao: "UPDATE",
    usuarioId: userId,
    descricao: `Lideranca ${leadership.nome} atualizada`
  });

  return leadership;
}

export async function setLeadershipStatus(
  id: string,
  status: "ACTIVE" | "INACTIVE",
  userId: string,
  role?: Role | null
) {
  const { enforcedState, responsavelIds } = await resolveLeadershipScope(
    userId,
    role
  );
  const existing = await findLeadershipById(id, {
    estado: enforcedState,
    responsavelIds
  });

  if (!existing) {
    throw new Error("Lideranca nao encontrada");
  }

  const leadership = await updateLeadership(id, {
    status
  });

  await recordAuditLog({
    entidade: "Leadership",
    entidadeId: leadership.id,
    acao: status === LeadershipStatus.ACTIVE ? "REACTIVATE" : "INACTIVATE",
    usuarioId: userId,
    descricao:
      status === LeadershipStatus.ACTIVE
        ? `Lideranca ${leadership.nome} reativada`
        : `Lideranca ${leadership.nome} inativada`
  });

  return leadership;
}

export async function deleteLeadershipRecord(
  id: string,
  userId: string,
  role?: Role | null
) {
  const { enforcedState, responsavelIds } = await resolveLeadershipScope(
    userId,
    role
  );
  const existing = await findLeadershipById(id, {
    estado: enforcedState,
    responsavelIds
  });

  if (!existing) {
    throw new Error("Lideranca nao encontrada");
  }

  await prisma.$transaction(async (tx) => {
    if (existing.indicadoPorId) {
      await decrementLeadershipIndications(existing.indicadoPorId, tx);
    }

    await deleteLeadership(id, tx);
  });

  await recordAuditLog({
    entidade: "Leadership",
    entidadeId: id,
    acao: "DELETE",
    usuarioId: userId,
    descricao: `Lideranca ${existing.nome} excluida`
  });
}

export function getLeadershipPerformanceSnapshot(leadership: {
  quantidadeIndicacoes: number;
  custoTotal?: number | null;
  potencialVotosEstimado: number;
}) {
  return {
    quantidadeIndicacoes: leadership.quantidadeIndicacoes,
    custoPorVoto: calculateCostPerVote(
      leadership.custoTotal,
      leadership.potencialVotosEstimado
    ),
    potencialVotosEstimado: leadership.potencialVotosEstimado
  };
}
