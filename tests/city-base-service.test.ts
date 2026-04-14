import { describe, expect, it } from "vitest";

import { stateCityBaseNeedsSync } from "@/services/city-base-service";

describe("city-base-service", () => {
  it("does not request sync when the city base is already aligned", () => {
    const expectedCities = [
      {
        nome: "Campinas",
        estado: "SP" as const,
        totalEleitores: 900000,
        codigoIbge: "3509502",
        latitude: -22.9053,
        longitude: -47.0659
      },
      {
        nome: "Sao Paulo",
        estado: "SP" as const,
        totalEleitores: 9000000,
        codigoIbge: "3550308",
        latitude: -23.5505,
        longitude: -46.6333
      }
    ];
    const existingCities = [
      {
        id: "city-1",
        nome: "Campinas",
        estado: "SP",
        totalEleitores: 900000,
        codigoIbge: "3509502",
        latitude: -22.9053,
        longitude: -47.0659
      },
      {
        id: "city-2",
        nome: "Sao Paulo",
        estado: "SP",
        totalEleitores: 9000000,
        codigoIbge: "3550308",
        latitude: -23.5505,
        longitude: -46.6333
      }
    ];

    expect(stateCityBaseNeedsSync(expectedCities, existingCities)).toBe(false);
  });

  it("requests sync when cities exist but coordinates are still missing", () => {
    const expectedCities = [
      {
        nome: "Campinas",
        estado: "SP" as const,
        totalEleitores: 900000,
        codigoIbge: "3509502",
        latitude: -22.9053,
        longitude: -47.0659
      }
    ];
    const existingCities = [
      {
        id: "city-1",
        nome: "Campinas",
        estado: "SP",
        totalEleitores: 900000,
        codigoIbge: null,
        latitude: null,
        longitude: null
      }
    ];

    expect(stateCityBaseNeedsSync(expectedCities, existingCities)).toBe(true);
  });

  it("requests sync when the canonical city data changed", () => {
    const expectedCities = [
      {
        nome: "Sao Paulo",
        estado: "SP" as const,
        totalEleitores: 9000000,
        codigoIbge: "3550308",
        latitude: -23.5505,
        longitude: -46.6333
      }
    ];
    const existingCities = [
      {
        id: "city-1",
        nome: "Sao Paulo",
        estado: "SP",
        totalEleitores: 8900000,
        codigoIbge: "3550308",
        latitude: -23.5505,
        longitude: -46.6333
      }
    ];

    expect(stateCityBaseNeedsSync(expectedCities, existingCities)).toBe(true);
  });
});
