import { calculateCostPerVote } from "@/lib/domain/leadership";

describe("calculateCostPerVote", () => {
  it("calcula o custo por voto quando ha custo e potencial", () => {
    expect(calculateCostPerVote(2000, 400)).toBe(5);
  });

  it("retorna null quando o potencial e zero", () => {
    expect(calculateCostPerVote(2000, 0)).toBeNull();
  });
});
