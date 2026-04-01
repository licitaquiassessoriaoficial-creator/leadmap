export function calculateVotesRemaining(totalEleitores: number, votosCaptados: number) {
  return Math.max(totalEleitores - votosCaptados, 0);
}

export function calculateVotesProgress(totalEleitores: number, votosCaptados: number) {
  if (totalEleitores <= 0) {
    return 0;
  }

  return Math.min((votosCaptados / totalEleitores) * 100, 100);
}
