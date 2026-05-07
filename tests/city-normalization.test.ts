import { describe, expect, it } from "vitest";

import {
  findCityOptionByName,
  getCanonicalStateCityName,
  sanitizeStateCityOptions
} from "@/lib/domain/cities";

describe("city normalization", () => {
  it("matches canonical SP cities even with accents and punctuation variations", () => {
    expect(getCanonicalStateCityName("Ribeirão Preto", "SP")).toBe("Ribeirão Preto");
    expect(getCanonicalStateCityName("Santa Bárbara d Oeste", "SP")).toBe(
      "Santa Bárbara d'Oeste"
    );
    expect(getCanonicalStateCityName("Embu Guaçu", "SP")).toBe("Embu-Guaçu");
    expect(getCanonicalStateCityName("Sao Luis do Paraitinga", "SP")).toBe(
      "São Luiz do Paraitinga"
    );
  });

  it("removes invalid cities from the supported state options", () => {
    const sanitized = sanitizeStateCityOptions([
      { id: "1", nome: "Rio de Janeiro", estado: "SP" },
      { id: "2", nome: "Ribeirão Preto", estado: "SP" },
      { id: "3", nome: "Ribeirao Preto", estado: "SP" },
      { id: "4", nome: "Campinas", estado: "SP" }
    ]);

    expect(sanitized).toEqual([
      { id: "4", nome: "Campinas", estado: "SP" },
      { id: "2", nome: "Ribeirão Preto", estado: "SP" }
    ]);
  });

  it("finds a city option by user input with flexible normalization", () => {
    const cityOptions = [
      { id: "1", nome: "Santa Bárbara d'Oeste", estado: "SP" },
      { id: "2", nome: "São Paulo", estado: "SP" }
    ];

    expect(findCityOptionByName(cityOptions, "Santa Bárbara d Oeste")?.id).toBe("1");
    expect(findCityOptionByName(cityOptions, "sao paulo")?.id).toBe("2");
  });
});
