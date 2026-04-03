import { LeadershipStatus } from "@prisma/client";

export const LEADERSHIP_SCORE_WEIGHTS = {
  voteBase: 0.35,
  indications: 0.2,
  efficiency: 0.2,
  coverage: 0.1,
  status: 0.1,
  growth: 0.05
} as const;

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function normalizeByCap(value: number, cap: number) {
  if (cap <= 0) {
    return 0;
  }

  return clamp((value / cap) * 100);
}

function getEfficiencyScore(custoPorVoto?: number | null) {
  if (custoPorVoto == null) {
    return 40;
  }

  if (custoPorVoto <= 2) {
    return 100;
  }

  if (custoPorVoto <= 5) {
    return 85;
  }

  if (custoPorVoto <= 10) {
    return 65;
  }

  if (custoPorVoto <= 20) {
    return 35;
  }

  return 10;
}

function getStatusScore(status: LeadershipStatus) {
  if (status === LeadershipStatus.ACTIVE) {
    return 100;
  }

  if (status === LeadershipStatus.PENDING) {
    return 60;
  }

  return 20;
}

function getGrowthScore(recentGrowthRate?: number | null) {
  if (recentGrowthRate == null) {
    return 50;
  }

  return clamp(50 + recentGrowthRate);
}

export function calculateLeadershipScore(input: {
  voteBase?: number | null;
  quantidadeIndicacoes: number;
  custoPorVoto?: number | null;
  totalCidadesResponsaveis: number;
  status: LeadershipStatus;
  recentGrowthRate?: number | null;
}) {
  const total =
    normalizeByCap(input.voteBase ?? 0, 2000) * LEADERSHIP_SCORE_WEIGHTS.voteBase +
    normalizeByCap(input.quantidadeIndicacoes, 50) *
      LEADERSHIP_SCORE_WEIGHTS.indications +
    getEfficiencyScore(input.custoPorVoto) * LEADERSHIP_SCORE_WEIGHTS.efficiency +
    normalizeByCap(input.totalCidadesResponsaveis, 25) *
      LEADERSHIP_SCORE_WEIGHTS.coverage +
    getStatusScore(input.status) * LEADERSHIP_SCORE_WEIGHTS.status +
    getGrowthScore(input.recentGrowthRate) * LEADERSHIP_SCORE_WEIGHTS.growth;

  return Math.round((total + Number.EPSILON) * 100) / 100;
}
