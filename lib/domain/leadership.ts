export function calculateCostPerVote(
  custoTotal?: number | null,
  potencialVotosEstimado?: number | null
) {
  if (custoTotal == null || potencialVotosEstimado == null || potencialVotosEstimado <= 0) {
    return null;
  }

  return custoTotal / potencialVotosEstimado;
}

export function buildWhatsAppLink(phone: string, message?: string) {
  const normalizedPhone = phone.replace(/\D/g, "");
  const base = `https://wa.me/${normalizedPhone}`;

  if (!message) {
    return base;
  }

  return `${base}?text=${encodeURIComponent(message)}`;
}

export function buildReferralPath(leadershipId: string) {
  return `/cadastro?ref=${leadershipId}`;
}
