import { describe, expect, it } from "vitest";

import { SP_CITIES } from "@/lib/data/sp-cities";

describe("SP city base", () => {
  it("contains the full municipality base for Sao Paulo", () => {
    expect(SP_CITIES).toHaveLength(645);
  });

  it("does not contain duplicate city names", () => {
    const names = SP_CITIES.map((city) => `${city.nome}:${city.estado}`);

    expect(new Set(names).size).toBe(names.length);
  });
});
