import { LeadershipStatus } from "@prisma/client";

import { calculateLeadershipScore } from "@/lib/domain/score";

describe("calculateLeadershipScore", () => {
  it("premia lideranças mais eficientes e ativas", () => {
    const efficient = calculateLeadershipScore({
      voteBase: 800,
      quantidadeIndicacoes: 18,
      custoPorVoto: 3.4,
      totalCidadesResponsaveis: 12,
      status: LeadershipStatus.ACTIVE,
      recentGrowthRate: 12
    });
    const risky = calculateLeadershipScore({
      voteBase: 120,
      quantidadeIndicacoes: 2,
      custoPorVoto: 18,
      totalCidadesResponsaveis: 2,
      status: LeadershipStatus.INACTIVE,
      recentGrowthRate: -10
    });

    expect(efficient).toBeGreaterThan(risky);
  });

  it("retorna valor arredondado para duas casas", () => {
    const result = calculateLeadershipScore({
      voteBase: 501,
      quantidadeIndicacoes: 7,
      custoPorVoto: 6.237,
      totalCidadesResponsaveis: 5,
      status: LeadershipStatus.PENDING
    });

    expect(result).toBe(Math.round(result * 100) / 100);
  });
});
