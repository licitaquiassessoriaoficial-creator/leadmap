import { LeadershipStatus, LocationStatus, Role } from "@prisma/client";

import { classifyPotentialLevel } from "@/lib/constants/potential";
import {
  isSupportedStateCityName,
  sanitizeStateCityOptions
} from "@/lib/domain/cities";
import {
  buildWhatsAppNumber,
  calculateCostPerVote,
  calculateGoalProgress,
  calculateGoalRemaining,
  generateReferralCode,
  resolveLeadershipVoteBase
} from "@/lib/domain/leadership";
import { calculateLeadershipScore } from "@/lib/domain/score";
import { prisma } from "@/lib/prisma";
import { optionalText } from "@/lib/utils";
import {
  findCityById,
  listCities as listRegisteredCities,
  listStates as listRegisteredStates
} from "@/repositories/city-repository";
import { createPerformanceSnapshot } from "@/repositories/performance-history-repository";
import { createReferralSignup } from "@/repositories/referral-signup-repository";
import {
  countLeaderships,
  createLeadership,
  decrementLeadershipIndications,
  deleteLeadership,
  findLeadershipById,
  findLeadershipDetailsById,
  findLeadershipSummaryById,
  findLeadershipSummaryByReference,
  incrementLeadershipIndications,
  listLeaderships,
  replaceLeadershipResponsibleCities,
  updateLeadership
} from "@/repositories/leadership-repository";
import { findDefaultLeadershipOwner } from "@/repositories/user-repository";
import { recordAuditLog } from "@/services/audit-service";
import { getCampaignScope } from "@/services/campaign-settings-service";
import { ensureStateCityBase } from "@/services/city-base-service";
import { geocodeCityState } from "@/services/geocoding-service";
import { getScopedLeadershipUserIds } from "@/services/user-service";
import {
  leadershipCreateSchema,
  leadershipQuerySchema,
  leadershipUpdateSchema,
  publicLeadershipCreateSchema
} from "@/validations/leadership";

function normalizeState(value?: string) {
  return value?.trim().toUpperCase();
}

function calculateRecentGrowthRate(
  currentVoteBase?: number | null,
  previousSnapshot?: {
    votosEstimados: number;
    votosReais?: number | null;
  } | null
) {
  const previousVoteBase = resolveLeadershipVoteBase(
    previousSnapshot?.votosReais,
    previousSnapshot?.votosEstimados
  );

  if (currentVoteBase == null || previousVoteBase == null || previousVoteBase <= 0) {
    return null;
  }

  return (
    Math.round(
      ((((currentVoteBase - previousVoteBase) / previousVoteBase) * 100) +
        Number.EPSILON) *
        100
    ) / 100
  );
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
    throw new Error("Cidade não encontrada");
  }

  if (enforcedState && city.estado !== enforcedState) {
    throw new Error("Cidade fora do escopo configurado");
  }

  if (!isSupportedStateCityName(city.nome, city.estado)) {
    throw new Error("Cidade fora da base oficial do estado configurado");
  }

  return city;
}

async function resolveCoordinates(
  cidade: string,
  estado: string,
  fallback?: {
    latitude?: number | null;
    longitude?: number | null;
  }
) {
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

async function ensureUniqueReferralCode(name: string, seed: string) {
  const baseCode = generateReferralCode(name, seed);
  let candidate = baseCode;
  let suffix = 1;

  while (await prisma.leadership.findUnique({ where: { referralCode: candidate } })) {
    candidate = `${baseCode}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function buildDerivedLeadershipData(input: {
  nome: string;
  telefone: string;
  potencialVotosEstimado: number;
  votosReais?: number | null;
  custoTotal?: number | null;
  metaVotosIndividual?: number | null;
  quantidadeIndicacoes: number;
  totalCidadesResponsaveis: number;
  status: LeadershipStatus;
  recentGrowthRate?: number | null;
}) {
  const voteBase = resolveLeadershipVoteBase(
    input.votosReais,
    input.potencialVotosEstimado
  );
  const custoPorVoto = calculateCostPerVote(
    input.custoTotal,
    input.votosReais,
    input.potencialVotosEstimado
  );

  return {
    whatsapp: buildWhatsAppNumber(input.telefone),
    faixaPotencial: classifyPotentialLevel(input.potencialVotosEstimado),
    custoPorVoto,
    scoreLideranca: calculateLeadershipScore({
      voteBase,
      quantidadeIndicacoes: input.quantidadeIndicacoes,
      custoPorVoto,
      totalCidadesResponsaveis: input.totalCidadesResponsaveis,
      status: input.status,
      recentGrowthRate: input.recentGrowthRate
    }),
    progressoMetaIndividual: calculateGoalProgress(
      input.metaVotosIndividual,
      voteBase
    ),
    faltanteMetaIndividual: calculateGoalRemaining(
      input.metaVotosIndividual,
      voteBase
    ),
    voteBase
  };
}

async function registerPerformanceSnapshot(
  leadership: {
    id: string;
    potencialVotosEstimado: number;
    votosReais?: number | null;
    quantidadeIndicacoes: number;
    custoTotal?: number | null;
    scoreLideranca: number;
  },
  tx?: Parameters<typeof createPerformanceSnapshot>[1]
) {
  await createPerformanceSnapshot(
    {
      leadershipId: leadership.id,
      dataReferencia: new Date(),
      votosEstimados: leadership.potencialVotosEstimado,
      votosReais: leadership.votosReais ?? null,
      quantidadeIndicacoes: leadership.quantidadeIndicacoes,
      custoTotal: leadership.custoTotal ?? null,
      score: leadership.scoreLideranca
    },
    tx
  );
}

async function refreshLeadershipDerivedMetrics(
  leadershipId: string,
  tx: Parameters<typeof createPerformanceSnapshot>[1]
) {
  const leadership = await findLeadershipDetailsById(leadershipId, tx);

  if (!leadership) {
    return null;
  }

  const recentGrowthRate = calculateRecentGrowthRate(
    resolveLeadershipVoteBase(
      leadership.votosReais,
      leadership.potencialVotosEstimado
    ),
    leadership.performanceHistory[0]
  );
  const derived = buildDerivedLeadershipData({
    nome: leadership.nome,
    telefone: leadership.telefone,
    potencialVotosEstimado: leadership.potencialVotosEstimado,
    votosReais: leadership.votosReais,
    custoTotal: leadership.custoTotal,
    metaVotosIndividual: leadership.metaVotosIndividual,
    quantidadeIndicacoes: leadership.quantidadeIndicacoes,
    totalCidadesResponsaveis: leadership.cidadesResponsaveis.length,
    status: leadership.status,
    recentGrowthRate
  });
  const updated = await updateLeadership(
    leadershipId,
    {
      whatsapp: derived.whatsapp,
      custoPorVoto: derived.custoPorVoto,
      scoreLideranca: derived.scoreLideranca
    },
    tx
  );

  await registerPerformanceSnapshot(updated, tx);

  return updated;
}

function parseDateRange(startDate?: string, endDate?: string) {
  return {
    startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
    endDate: endDate ? new Date(`${endDate}T23:59:59.999`) : undefined
  };
}

export async function getLeadershipFilters(role?: Role | null, userId?: string) {
  const { enforcedState } = await resolveLeadershipScope(userId, role);
  await ensureStateCityBase(enforcedState ?? "SP");
  const [registeredCities, states] = await Promise.all([
    listRegisteredCities({
      estado: enforcedState
    }),
    listRegisteredStates()
  ]);
  const cities = sanitizeStateCityOptions(registeredCities);

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
    minIndicacoes: rawQuery.minIndicacoes,
    minScore: rawQuery.minScore,
    maxCostPerVote: rawQuery.maxCostPerVote,
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
    minIndicacoes: query.minIndicacoes,
    minScore: query.minScore,
    maxCostPerVote: query.maxCostPerVote,
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

export async function getReferralLeadership(reference: string) {
  return findLeadershipSummaryByReference(reference);
}

export async function createLeadershipRecord(
  rawInput: unknown,
  userId: string,
  role?: Role | null
) {
  const input = leadershipCreateSchema.parse(rawInput);
  const enforcedState = await resolveScopedState(role);
  const city = await resolveCity(input.cidadeId, enforcedState);
  const coordinates = await resolveCoordinates(city.nome, city.estado, city);
  const responsibleCityIds = buildResponsibleCityIds(
    city.id,
    input.cidadesResponsaveisIds
  );
  const derived = buildDerivedLeadershipData({
    nome: input.nome,
    telefone: input.telefone,
    potencialVotosEstimado: input.potencialVotosEstimado,
    votosReais: input.votosReais,
    custoTotal: input.custoTotal ?? null,
    metaVotosIndividual: input.metaVotosIndividual ?? null,
    quantidadeIndicacoes: 0,
    totalCidadesResponsaveis: responsibleCityIds.length,
    status: input.status ?? LeadershipStatus.ACTIVE
  });
  const referralCode = await ensureUniqueReferralCode(input.nome, crypto.randomUUID());

  const leadership = await prisma.$transaction(async (tx) => {
    const created = await createLeadership(
      {
        nome: input.nome.trim(),
        telefone: input.telefone.trim(),
        whatsapp: derived.whatsapp,
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
        votosReais: input.votosReais ?? null,
        custoTotal: input.custoTotal ?? null,
        custoPorVoto: derived.custoPorVoto,
        metaVotosIndividual: input.metaVotosIndividual ?? null,
        faixaPotencial: derived.faixaPotencial,
        scoreLideranca: derived.scoreLideranca,
        status: input.status ?? LeadershipStatus.ACTIVE,
        referralCode,
        cadastradoPorId: userId,
        ...coordinates
      },
      tx
    );

    await replaceLeadershipResponsibleCities(created.id, responsibleCityIds, tx);
    await registerPerformanceSnapshot(created, tx);

    return findLeadershipDetailsById(created.id, tx);
  });

  if (!leadership) {
    throw new Error("Falha ao carregar a liderança criada");
  }

  await recordAuditLog({
    entidade: "Leadership",
    entidadeId: leadership.id,
    acao: "CREATE",
    usuarioId: userId,
    descricao: `Liderança ${leadership.nome} criada`
  });

  return leadership;
}

export async function createPublicLeadershipRecord(rawInput: unknown) {
  const input = publicLeadershipCreateSchema.parse(rawInput);
  const [city, owner, referrer] = await Promise.all([
    resolveCity(input.cidadeId, "SP"),
    findDefaultLeadershipOwner(),
    input.origemRef ? findLeadershipSummaryByReference(input.origemRef) : null
  ]);

  if (!owner) {
    throw new Error("Nenhum usuário administrativo disponível para o cadastro");
  }

  if (input.origemRef && !referrer) {
    throw new Error("Link de indicação inválido");
  }

  const responsibleCityIds = buildResponsibleCityIds(city.id, []);
  const derived = buildDerivedLeadershipData({
    nome: input.nome,
    telefone: input.telefone,
    potencialVotosEstimado: input.potencialVotosEstimado ?? 0,
    votosReais: input.votosReais,
    custoTotal: null,
    metaVotosIndividual: null,
    quantidadeIndicacoes: 0,
    totalCidadesResponsaveis: responsibleCityIds.length,
    status: LeadershipStatus.PENDING
  });
  const referralCode = await ensureUniqueReferralCode(input.nome, crypto.randomUUID());
  const coordinates = await resolveCoordinates(city.nome, city.estado, city);

  const leadership = await prisma.$transaction(async (tx) => {
    const created = await createLeadership(
      {
        nome: input.nome.trim(),
        telefone: input.telefone.trim(),
        whatsapp: derived.whatsapp,
        email: optionalText(input.email),
        cidade: city.nome,
        estado: city.estado,
        cidadeId: city.id,
        observacoes: optionalText(input.observacoes),
        potencialVotosEstimado: input.potencialVotosEstimado ?? 0,
        votosReais: input.votosReais ?? null,
        custoPorVoto: null,
        metaVotosIndividual: null,
        faixaPotencial: derived.faixaPotencial,
        scoreLideranca: derived.scoreLideranca,
        status: LeadershipStatus.PENDING,
        referralCode,
        indicadoPorId: referrer?.id ?? null,
        cadastradoPorId: owner.id,
        ...coordinates
      },
      tx
    );

    await replaceLeadershipResponsibleCities(created.id, responsibleCityIds, tx);
    await createReferralSignup(
      {
        nome: input.nome.trim(),
        telefone: input.telefone.trim(),
        email: optionalText(input.email),
        cidade: city.nome,
        estado: city.estado,
        observacoes: optionalText(input.observacoes),
        origemRef: input.origemRef ?? referrer?.referralCode ?? null,
        leadershipId: referrer?.id ?? null
      },
      tx
    );

    if (referrer) {
      await incrementLeadershipIndications(referrer.id, tx);
      await refreshLeadershipDerivedMetrics(referrer.id, tx);
    }

    await registerPerformanceSnapshot(created, tx);

    return findLeadershipDetailsById(created.id, tx);
  });

  if (!leadership) {
    throw new Error("Falha ao concluir o cadastro");
  }

  await recordAuditLog({
    entidade: "ReferralSignup",
    entidadeId: leadership.id,
    acao: "PUBLIC_SIGNUP",
    usuarioId: owner.id,
    descricao: referrer
      ? `Cadastro público de ${leadership.nome} vinculado a ${referrer.nome}`
      : `Cadastro público de ${leadership.nome} sem vínculo de indicação`
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
  const city = input.cidadeId
    ? await resolveCity(input.cidadeId, enforcedState)
    : existing.city;

  if (!city) {
    throw new Error("Cidade base não encontrada");
  }

  const responsibleCityIds = buildResponsibleCityIds(
    city.id,
    input.cidadesResponsaveisIds ??
      existing.cidadesResponsaveis.map((item) => item.cityId)
  );
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
  const realVotesValue =
    input.votosReais === undefined ? existing.votosReais : input.votosReais ?? null;
  const costValue =
    input.custoTotal === undefined ? existing.custoTotal : input.custoTotal ?? null;
  const goalValue =
    input.metaVotosIndividual === undefined
      ? existing.metaVotosIndividual
      : input.metaVotosIndividual ?? null;
  const statusValue = input.status ?? existing.status;
  const currentVoteBase = resolveLeadershipVoteBase(realVotesValue, potentialValue);
  const recentGrowthRate = calculateRecentGrowthRate(
    currentVoteBase,
    existing.performanceHistory[0]
  );
  const derived = buildDerivedLeadershipData({
    nome: input.nome ?? existing.nome,
    telefone: input.telefone ?? existing.telefone,
    potencialVotosEstimado: potentialValue,
    votosReais: realVotesValue,
    custoTotal: costValue,
    metaVotosIndividual: goalValue,
    quantidadeIndicacoes: existing.quantidadeIndicacoes,
    totalCidadesResponsaveis: responsibleCityIds.length,
    status: statusValue,
    recentGrowthRate
  });

  const leadership = await prisma.$transaction(async (tx) => {
    const updated = await updateLeadership(
      id,
      {
        nome: input.nome?.trim(),
        telefone: input.telefone?.trim(),
        whatsapp:
          input.telefone === undefined
            ? undefined
            : buildWhatsAppNumber(input.telefone?.trim()),
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
        votosReais: input.votosReais === undefined ? undefined : realVotesValue,
        custoTotal: input.custoTotal === undefined ? undefined : costValue,
        custoPorVoto: derived.custoPorVoto,
        metaVotosIndividual:
          input.metaVotosIndividual === undefined ? undefined : goalValue,
        faixaPotencial: derived.faixaPotencial,
        scoreLideranca: derived.scoreLideranca,
        status: input.status,
        ...coordinates
      },
      tx
    );

    await replaceLeadershipResponsibleCities(id, responsibleCityIds, tx);
    await registerPerformanceSnapshot(updated, tx);

    return findLeadershipDetailsById(id, tx);
  });

  if (!leadership) {
    throw new Error("Falha ao carregar a liderança atualizada");
  }

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

  const derived = buildDerivedLeadershipData({
    nome: existing.nome,
    telefone: existing.telefone,
    potencialVotosEstimado: existing.potencialVotosEstimado,
    votosReais: existing.votosReais,
    custoTotal: existing.custoTotal,
    metaVotosIndividual: existing.metaVotosIndividual,
    quantidadeIndicacoes: existing.quantidadeIndicacoes,
    totalCidadesResponsaveis: existing.cidadesResponsaveis.length,
    status
  });

  const leadership = await prisma.$transaction(async (tx) => {
    const updated = await updateLeadership(
      id,
      {
        status,
        scoreLideranca: derived.scoreLideranca
      },
      tx
    );

    await registerPerformanceSnapshot(updated, tx);

    return updated;
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

  await prisma.$transaction(async (tx) => {
    if (existing.indicadoPorId) {
      await decrementLeadershipIndications(existing.indicadoPorId, tx);
      await refreshLeadershipDerivedMetrics(existing.indicadoPorId, tx);
    }

    await deleteLeadership(id, tx);
  });

  await recordAuditLog({
    entidade: "Leadership",
    entidadeId: id,
    acao: "DELETE",
    usuarioId: userId,
    descricao: `Liderança ${existing.nome} excluída`
  });
}

export function getLeadershipPerformanceSnapshot(leadership: {
  quantidadeIndicacoes: number;
  custoPorVoto?: number | null;
  custoTotal?: number | null;
  potencialVotosEstimado: number;
  votosReais?: number | null;
  metaVotosIndividual?: number | null;
  scoreLideranca?: number | null;
}) {
  const voteBase = resolveLeadershipVoteBase(
    leadership.votosReais,
    leadership.potencialVotosEstimado
  );

  return {
    quantidadeIndicacoes: leadership.quantidadeIndicacoes,
    custoPorVoto:
      leadership.custoPorVoto ??
      calculateCostPerVote(
        leadership.custoTotal,
        leadership.votosReais,
        leadership.potencialVotosEstimado
      ),
    potencialVotosEstimado: leadership.potencialVotosEstimado,
    votosReais: leadership.votosReais ?? null,
    voteBase,
    progressoMetaIndividual: calculateGoalProgress(
      leadership.metaVotosIndividual,
      voteBase
    ),
    faltanteMetaIndividual: calculateGoalRemaining(
      leadership.metaVotosIndividual,
      voteBase
    ),
    scoreLideranca: leadership.scoreLideranca ?? 0
  };
}
