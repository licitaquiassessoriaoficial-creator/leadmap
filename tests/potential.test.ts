import { PotentialLevel } from "@prisma/client";

import {
  classifyPotentialLevel,
  POTENTIAL_THRESHOLDS
} from "@/lib/constants/potential";

describe("classifyPotentialLevel", () => {
  it("classifica como baixo ate o limite inferior", () => {
    expect(classifyPotentialLevel(0)).toBe(PotentialLevel.LOW);
    expect(classifyPotentialLevel(POTENTIAL_THRESHOLDS.LOW_MAX)).toBe(
      PotentialLevel.LOW
    );
  });

  it("classifica como medio entre os limites", () => {
    expect(classifyPotentialLevel(POTENTIAL_THRESHOLDS.LOW_MAX + 1)).toBe(
      PotentialLevel.MEDIUM
    );
    expect(classifyPotentialLevel(POTENTIAL_THRESHOLDS.MEDIUM_MAX)).toBe(
      PotentialLevel.MEDIUM
    );
  });

  it("classifica como alto acima do limite medio", () => {
    expect(classifyPotentialLevel(POTENTIAL_THRESHOLDS.MEDIUM_MAX + 1)).toBe(
      PotentialLevel.HIGH
    );
  });
});
