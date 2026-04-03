function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildWhatsAppNumber(phone?: string | null) {
  const normalizedPhone = phone?.replace(/\D/g, "") ?? "";

  return normalizedPhone.length > 0 ? normalizedPhone : null;
}

export function resolveLeadershipVoteBase(
  votosReais?: number | null,
  potencialVotosEstimado?: number | null
) {
  if (votosReais != null && votosReais > 0) {
    return votosReais;
  }

  if (potencialVotosEstimado != null && potencialVotosEstimado > 0) {
    return potencialVotosEstimado;
  }

  return null;
}

export function calculateCostPerVote(
  custoTotal?: number | null,
  votosOuBase?: number | null,
  potencialVotosEstimado?: number | null
) {
  const voteBase =
    potencialVotosEstimado === undefined
      ? votosOuBase
      : resolveLeadershipVoteBase(votosOuBase, potencialVotosEstimado);

  if (custoTotal == null || voteBase == null || voteBase <= 0) {
    return null;
  }

  return Math.round(((custoTotal / voteBase) + Number.EPSILON) * 100) / 100;
}

export function calculateGoalProgress(meta?: number | null, captado?: number | null) {
  if (meta == null || meta <= 0) {
    return 0;
  }

  return Math.min((((captado ?? 0) / meta) * 100), 100);
}

export function calculateGoalRemaining(meta?: number | null, captado?: number | null) {
  if (meta == null || meta <= 0) {
    return 0;
  }

  return Math.max(meta - (captado ?? 0), 0);
}

export function buildWhatsAppLink(phone: string, message?: string) {
  const normalizedPhone = buildWhatsAppNumber(phone);

  if (!normalizedPhone) {
    return "https://wa.me/";
  }

  const base = `https://wa.me/${normalizedPhone}`;

  if (!message) {
    return base;
  }

  return `${base}?text=${encodeURIComponent(message)}`;
}

export function generateReferralCode(name: string, seed: string) {
  const base = slugify(name).slice(0, 18) || "lideranca";
  const suffix = seed.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 8);

  return `${base}-${suffix}`;
}

export function buildReferralPath(referralCode: string) {
  return `/cadastro-publico?ref=${referralCode}`;
}
