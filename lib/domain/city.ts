export function resolveCityVoteTarget(
  totalEleitores: number,
  metaVotosCidade?: number | null
) {
  if (metaVotosCidade != null && metaVotosCidade > 0) {
    return metaVotosCidade;
  }

  return totalEleitores;
}

export function calculateVotesRemaining(targetVotes: number, votosCaptados: number) {
  return Math.max(targetVotes - votosCaptados, 0);
}

export function calculateVotesProgress(targetVotes: number, votosCaptados: number) {
  if (targetVotes <= 0) {
    return 0;
  }

  return Math.min((votosCaptados / targetVotes) * 100, 100);
}

export function calculateCoveragePercentage(total: number, covered: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min((covered / total) * 100, 100);
}

export function calculateCityPriority(input: {
  totalEleitores: number;
  votosCaptados: number;
  targetVotes: number;
  totalResponsaveis: number;
}) {
  let score = 0;
  const reasons: string[] = [];
  const progress = calculateVotesProgress(input.targetVotes, input.votosCaptados);

  if (input.totalResponsaveis === 0) {
    score += 50;
    reasons.push("Sem liderança ativa");
  }

  if (input.totalEleitores >= 300000) {
    score += 30;
    reasons.push("Alto eleitorado");
  } else if (input.totalEleitores >= 100000) {
    score += 20;
    reasons.push("Eleitorado relevante");
  }

  if (progress < 25) {
    score += 20;
    reasons.push("Baixa captação");
  } else if (progress < 50) {
    score += 10;
    reasons.push("Meta atrasada");
  }

  return {
    score,
    progress,
    reason: reasons.join(" • ") || "Cobertura estável"
  };
}
