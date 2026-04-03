import { PotentialLevel } from "@prisma/client";

export const POTENTIAL_THRESHOLDS = {
  LOW_MAX: 100,
  MEDIUM_MAX: 499,
  HIGH_MIN: 500
} as const;

export function classifyPotentialLevel(value: number): PotentialLevel {
  if (value <= POTENTIAL_THRESHOLDS.LOW_MAX) {
    return PotentialLevel.LOW;
  }

  if (value < POTENTIAL_THRESHOLDS.HIGH_MIN) {
    return PotentialLevel.MEDIUM;
  }

  return PotentialLevel.HIGH;
}

export const POTENTIAL_METADATA: Record<
  PotentialLevel,
  {
    label: string;
    badgeClassName: string;
    markerClassName: string;
    chartColor: string;
  }
> = {
  [PotentialLevel.LOW]: {
    label: "Baixo",
    badgeClassName:
      "bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-200",
    markerClassName: "bg-orange-500",
    chartColor: "#f97316"
  },
  [PotentialLevel.MEDIUM]: {
    label: "Médio",
    badgeClassName:
      "bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200",
    markerClassName: "bg-sky-500",
    chartColor: "#0ea5e9"
  },
  [PotentialLevel.HIGH]: {
    label: "Alto",
    badgeClassName:
      "bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200",
    markerClassName: "bg-yellow-300 border-yellow-500 text-yellow-800",
    chartColor: "#facc15"
  }
};

export const POTENTIAL_OPTIONS = Object.entries(POTENTIAL_METADATA).map(
  ([value, metadata]) => ({
    value,
    label: metadata.label
  })
);
