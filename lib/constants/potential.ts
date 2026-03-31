import { PotentialLevel } from "@prisma/client";

export const POTENTIAL_THRESHOLDS = {
  LOW_MAX: 100,
  MEDIUM_MAX: 500
} as const;

export function classifyPotentialLevel(value: number): PotentialLevel {
  if (value <= POTENTIAL_THRESHOLDS.LOW_MAX) {
    return PotentialLevel.LOW;
  }

  if (value <= POTENTIAL_THRESHOLDS.MEDIUM_MAX) {
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
    label: "Medio",
    badgeClassName:
      "bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200",
    markerClassName: "bg-sky-500",
    chartColor: "#0ea5e9"
  },
  [PotentialLevel.HIGH]: {
    label: "Alto",
    badgeClassName:
      "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200",
    markerClassName: "bg-amber-100 border-amber-500 text-amber-700",
    chartColor: "#facc15"
  }
};

export const POTENTIAL_OPTIONS = Object.entries(POTENTIAL_METADATA).map(
  ([value, metadata]) => ({
    value,
    label: metadata.label
  })
);
