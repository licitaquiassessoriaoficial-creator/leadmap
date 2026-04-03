export const COST_PER_VOTE_THRESHOLDS = {
  LOW_MAX: 5,
  MEDIUM_MAX: 10
} as const;

export type CostEfficiencyLevel = "LOW" | "MEDIUM" | "HIGH";

export const COST_EFFICIENCY_METADATA: Record<
  CostEfficiencyLevel,
  {
    label: string;
    badgeClassName: string;
  }
> = {
  LOW: {
    label: "Custo baixo",
    badgeClassName:
      "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200"
  },
  MEDIUM: {
    label: "Custo médio",
    badgeClassName:
      "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200"
  },
  HIGH: {
    label: "Custo alto",
    badgeClassName: "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200"
  }
};

export function classifyCostEfficiency(
  custoPorVoto?: number | null
): CostEfficiencyLevel | null {
  if (custoPorVoto == null || Number.isNaN(custoPorVoto)) {
    return null;
  }

  if (custoPorVoto <= COST_PER_VOTE_THRESHOLDS.LOW_MAX) {
    return "LOW";
  }

  if (custoPorVoto <= COST_PER_VOTE_THRESHOLDS.MEDIUM_MAX) {
    return "MEDIUM";
  }

  return "HIGH";
}
