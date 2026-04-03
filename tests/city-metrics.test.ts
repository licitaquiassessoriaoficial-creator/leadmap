import {
  calculateVotesProgress,
  calculateVotesRemaining,
  resolveCityVoteTarget
} from "@/lib/domain/city";

describe("city vote metrics", () => {
  it("usa meta customizada quando ela existe", () => {
    expect(resolveCityVoteTarget(1000, 700)).toBe(700);
  });

  it("calcula votos faltantes pela meta da cidade", () => {
    expect(calculateVotesRemaining(700, 550)).toBe(150);
  });

  it("calcula o percentual atingido da meta", () => {
    expect(calculateVotesProgress(700, 560)).toBe(80);
  });
});
