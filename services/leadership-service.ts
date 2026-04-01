import {
  LeadershipStatus,
  LocationStatus,
  Prisma,
  Role
} from "@prisma/client";

import { classifyPotentialLevel } from "@/lib/constants/potential";
import { optionalText } from "@/lib/utils";
import {
  countLeaderships,
  createLeadership,
  deleteLeadership,
  findLeadershipById,
  listCities,
  listLeaderships,
  listStates,
  updateLeadership
} from "@/repositories/leadership-repository";
import { recordAuditLog } from "@/services/audit-service";
import { geocodeCityState } from "@/services/geocoding-service";
import { getScopedLeadershipUserIds } from "@/services/user-service";
import {
  leadershipCreateSchema,
  leadershipQuerySchema,
  leadershipUpdateSchema
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

export async function getLeadershipFilters(
  role?: Role | null,
  userId?: string
) {
  const { enforcedState, responsavelIds } = await resolveLeadershipScope(
    userId,
    role
  );
  const [cities, states] = await Promise.all([
    listCities({
      estado: enforcedState,
      responsavelIds
    }),
    listStates({
      estado: enforcedState,
      responsavelIds
    })
  ]);

  return {
    cities: cities.map((item) => item.cidade),
    states: states.map((item) => item.estado),
    enforcedState
  };
}

function parseDateRange(startDate?: string, endDate?: string) {
  return {
    startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
    endDate: endDate ? new Date(`${endDate}T23:59:59.999`) : undefined
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
    estado: enforcedState ?? rawQuery.estado,
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
      estado: normalizeState(enforcedState ?? query.estado)
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

async function resolveCoordinates(cidade: string, estado: string) {
  const geocoded = await geocodeCityState(cidade, estado);

  if (!geocoded) {
    return {
      latitude: null,
      longitude: null,
      locationStatus: LocationStatus.PENDING
    };
  }

  return {
    latitude: geocoded.latitude,
    longitude: geocoded.longitude,
    locationStatus: LocationStatus.FOUND
  };
}

function buildCreatePayload(input: ReturnType<typeof leadershipCreateSchema.parse>, userId: string) {
  const faixaPotencial = classifyPotentialLevel(input.potencialVotosEstimado);
  const estado = normalizeState(input.estado) ?? input.estado.trim();

  return {
    nome: input.nome.trim(),
    telefone: input.telefone.trim(),
    email: optionalText(input.email),
    cpf: optionalText(input.cpf),
    cidade: input.cidade.trim(),
    estado,
    bairro: optionalText(input.bairro),
    endereco: optionalText(input.endereco),
    observacoes: optionalText(input.observacoes),
    quantidadeIndicacoes: input.quantidadeIndicacoes ?? 0,
    potencialVotosEstimado: input.potencialVotosEstimado,
    faixaPotencial,
    status: input.status ?? LeadershipStatus.ACTIVE,
    cadastradoPorId: userId
  };
}

export async function createLeadershipRecord(
  rawInput: unknown,
  userId: string,
  role?: Role | null
) {
  const input = leadershipCreateSchema.parse(rawInput);
  const enforcedState = await resolveScopedState(role);
  const payload = buildCreatePayload(
    {
      ...input,
      estado: enforcedState ?? input.estado
    },
    userId
  );
  const coordinates = await resolveCoordinates(payload.cidade, payload.estado);

  const leadership = await createLeadership({
    ...payload,
    ...coordinates
  });

  await recordAuditLog({
    entidade: "Leadership",
    entidadeId: leadership.id,
    acao: "CREATE",
    usuarioId: userId,
    descricao: `Liderança ${leadership.nome} criada`
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
    throw new Error("Liderança não encontrada");
  }

  const input = leadershipUpdateSchema.parse(rawInput);

  const cidade = input.cidade?.trim() ?? existing.cidade;
  const estado = normalizeState(enforcedState ?? input.estado) ?? existing.estado;
  const shouldRefreshCoordinates =
    cidade !== existing.cidade || estado !== existing.estado;

  const coordinates = shouldRefreshCoordinates
    ? await resolveCoordinates(cidade, estado)
    : {
        latitude: existing.latitude,
        longitude: existing.longitude,
        locationStatus: existing.locationStatus
      };

  const potentialValue =
    input.potencialVotosEstimado ?? existing.potencialVotosEstimado;

  const payload: Prisma.LeadershipUncheckedUpdateInput = {
    nome: input.nome?.trim(),
    telefone: input.telefone?.trim(),
    email: input.email === undefined ? undefined : optionalText(input.email),
    cpf: input.cpf === undefined ? undefined : optionalText(input.cpf),
    cidade,
    estado,
    bairro: input.bairro === undefined ? undefined : optionalText(input.bairro),
    endereco:
      input.endereco === undefined ? undefined : optionalText(input.endereco),
    observacoes:
      input.observacoes === undefined
        ? undefined
        : optionalText(input.observacoes),
    quantidadeIndicacoes: input.quantidadeIndicacoes,
    potencialVotosEstimado: potentialValue,
    faixaPotencial: classifyPotentialLevel(potentialValue),
    status: input.status,
    ...coordinates
  };

  const leadership = await updateLeadership(id, payload);

  await recordAuditLog({
    entidade: "Leadership",
    entidadeId: leadership.id,
    acao: "UPDATE",
    usuarioId: userId,
    descricao: `Liderança ${leadership.nome} atualizada`
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
    throw new Error("Liderança não encontrada");
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
        ? `Liderança ${leadership.nome} reativada`
        : `Liderança ${leadership.nome} inativada`
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
    throw new Error("Liderança não encontrada");
  }

  await deleteLeadership(id);

  await recordAuditLog({
    entidade: "Leadership",
    entidadeId: id,
    acao: "DELETE",
    usuarioId: userId,
    descricao: `Liderança ${existing.nome} excluída`
  });
}
