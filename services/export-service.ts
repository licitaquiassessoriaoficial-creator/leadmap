import { Role } from "@prisma/client";

import {
  listLeaderships,
  listRanking
} from "@/repositories/leadership-repository";
import { getCampaignScope } from "@/services/campaign-settings-service";
import { getCitiesCoverageSnapshot } from "@/services/city-service";
import { getScopedLeadershipUserIds } from "@/services/user-service";
import {
  leadershipQuerySchema,
  rankingQuerySchema
} from "@/validations/leadership";

function escapeCsvValue(value: unknown) {
  if (value == null) {
    return "";
  }

  const normalized = String(value).replace(/"/g, '""');

  return `"${normalized}"`;
}

function buildCsv(headers: string[], rows: Array<Array<unknown>>) {
  const lines = [headers.map(escapeCsvValue).join(",")];

  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(","));
  }

  return lines.join("\n");
}

function parseDateRange(startDate?: string, endDate?: string) {
  return {
    startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
    endDate: endDate ? new Date(`${endDate}T23:59:59.999`) : undefined
  };
}

export async function exportLeadershipsCsv(
  rawQuery: Record<string, string | string[] | undefined>,
  role?: Role | null,
  userId?: string
) {
  const scope = role ? await getCampaignScope(role) : undefined;
  const responsavelIds = await getScopedLeadershipUserIds(userId, role);
  const query = leadershipQuerySchema.parse({
    search: rawQuery.search,
    cidade: rawQuery.cidade,
    estado: scope?.enforcedState ?? rawQuery.estado ?? "SP",
    faixaPotencial: rawQuery.faixaPotencial,
    status: rawQuery.status,
    responsavelId: rawQuery.responsavelId,
    minIndicacoes: rawQuery.minIndicacoes,
    minScore: rawQuery.minScore,
    maxCostPerVote: rawQuery.maxCostPerVote,
    startDate: rawQuery.startDate,
    endDate: rawQuery.endDate
  });

  const items = await listLeaderships(
    {
      search: query.search,
      cidade: query.cidade,
      estado: scope?.enforcedState ?? query.estado,
      faixaPotencial: query.faixaPotencial,
      status: query.status,
      responsavelId: query.responsavelId,
      responsavelIds,
      minIndicacoes: query.minIndicacoes,
      minScore: query.minScore,
      maxCostPerVote: query.maxCostPerVote,
      ...parseDateRange(query.startDate, query.endDate)
    },
    1,
    10000
  );

  return buildCsv(
    [
      "Nome",
      "Cidade",
      "Estado",
      "Telefone",
      "Votos Potenciais",
      "Votos Reais",
      "Custo Total",
      "Custo por Voto",
      "Score",
      "Status",
      "Indicacoes"
    ],
    items.map((item) => [
      item.nome,
      item.cidade,
      item.estado,
      item.telefone,
      item.potencialVotosEstimado,
      item.votosReais ?? 0,
      item.custoTotal ?? "",
      item.custoPorVoto ?? "",
      item.scoreLideranca,
      item.status,
      item.quantidadeIndicacoes
    ])
  );
}

export async function exportRankingCsv(
  rawQuery: Record<string, string | string[] | undefined>,
  role?: Role | null,
  userId?: string
) {
  const scope = role ? await getCampaignScope(role) : undefined;
  const responsavelIds = await getScopedLeadershipUserIds(userId, role);
  const query = rankingQuerySchema.parse({
    sortBy: rawQuery.sortBy,
    search: rawQuery.search,
    cidade: rawQuery.cidade,
    estado: scope?.enforcedState ?? rawQuery.estado ?? "SP",
    faixaPotencial: rawQuery.faixaPotencial,
    status: rawQuery.status,
    responsavelId: rawQuery.responsavelId,
    minIndicacoes: rawQuery.minIndicacoes,
    minScore: rawQuery.minScore,
    maxCostPerVote: rawQuery.maxCostPerVote,
    startDate: rawQuery.startDate,
    endDate: rawQuery.endDate
  });

  const items = await listRanking(
    {
      search: query.search,
      cidade: query.cidade,
      estado: scope?.enforcedState ?? query.estado,
      faixaPotencial: query.faixaPotencial,
      status: query.status,
      responsavelId: query.responsavelId,
      responsavelIds,
      minIndicacoes: query.minIndicacoes,
      minScore: query.minScore,
      maxCostPerVote: query.maxCostPerVote,
      ...parseDateRange(query.startDate, query.endDate)
    },
    1,
    10000,
    query.sortBy
  );

  return buildCsv(
    [
      "Posicao",
      "Nome",
      "Cidade",
      "Estado",
      "Indicacoes",
      "Votos Potenciais",
      "Votos Reais",
      "Custo Total",
      "Custo por Voto",
      "Score",
      "Status",
      "Cidades Responsaveis"
    ],
    items.map((item, index) => [
      index + 1,
      item.nome,
      item.cidade,
      item.estado,
      item.quantidadeIndicacoes,
      item.potencialVotosEstimado,
      item.votosReais ?? 0,
      item.custoTotal ?? "",
      item.custoPorVoto ?? "",
      item.scoreLideranca,
      item.status,
      item.cidadesResponsaveis.length
    ])
  );
}

export async function exportCitiesCsv(
  rawQuery: Record<string, string | string[] | undefined>,
  role?: Role | null,
  userId?: string
) {
  const query = leadershipQuerySchema.parse({
    search: rawQuery.search,
    cidade: rawQuery.cidade,
    estado: rawQuery.estado ?? "SP",
    faixaPotencial: rawQuery.faixaPotencial,
    status: rawQuery.status,
    responsavelId: rawQuery.responsavelId,
    minIndicacoes: rawQuery.minIndicacoes,
    minScore: rawQuery.minScore,
    maxCostPerVote: rawQuery.maxCostPerVote,
    startDate: rawQuery.startDate,
    endDate: rawQuery.endDate
  });

  const coverage = await getCitiesCoverageSnapshot(role, userId, {
    search: query.search,
    cidade: query.cidade,
    estado: query.estado,
    faixaPotencial: query.faixaPotencial,
    status: query.status,
    responsavelId: query.responsavelId,
    minIndicacoes: query.minIndicacoes,
    minScore: query.minScore,
    maxCostPerVote: query.maxCostPerVote,
    ...parseDateRange(query.startDate, query.endDate)
  });

  return buildCsv(
    [
      "Cidade",
      "Estado",
      "Eleitores",
      "Meta",
      "Votos Captados",
      "Votos Restantes",
      "Progresso",
      "Liderancas",
      "Custo por Voto Medio",
      "Prioridade"
    ],
    coverage.cities.map((city) => [
      city.nome,
      city.estado,
      city.totalEleitores,
      city.targetVotes,
      city.votosCaptados,
      city.votosRestantes,
      city.progresso.toFixed(2),
      city.totalResponsaveis,
      city.custoPorVotoMedio ?? "",
      city.priorityReason
    ])
  );
}
