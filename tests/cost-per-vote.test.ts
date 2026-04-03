import { calculateCostPerVote } from "@/lib/domain/leadership";

describe("calculateCostPerVote", () => {
  it("calcula o custo por voto usando o potencial quando não há votos reais", () => {
    expect(calculateCostPerVote(2000, undefined, 400)).toBe(5);
  });

  it("prioriza votos reais quando eles existem", () => {
    expect(calculateCostPerVote(2000, 250, 400)).toBe(8);
  });

  it("retorna null quando a base de votos é zero", () => {
    expect(calculateCostPerVote(2000, 0, 0)).toBeNull();
  });

  it("arredonda o resultado para duas casas decimais", () => {
    expect(calculateCostPerVote(1000, undefined, 3)).toBe(333.33);
  });
});
