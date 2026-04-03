import { beforeEach, describe, expect, it, vi } from "vitest";

const listRankingMock = vi.fn();
const countLeadershipsMock = vi.fn();

vi.mock("@/repositories/leadership-repository", () => ({
  countLeaderships: countLeadershipsMock,
  listRanking: listRankingMock
}));

vi.mock("@/services/user-service", () => ({
  getScopedLeadershipUserIds: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("@/services/campaign-settings-service", () => ({
  getCampaignScope: vi.fn().mockResolvedValue({
    enforcedState: undefined
  })
}));

describe("getRankingData", () => {
  beforeEach(() => {
    listRankingMock.mockReset();
    countLeadershipsMock.mockReset();
  });

  it("retorna ranking ordenado e metadados de paginação", async () => {
    listRankingMock.mockResolvedValue([
      { id: "1", nome: "Primeira", quantidadeIndicacoes: 30, scoreLideranca: 88 },
      { id: "2", nome: "Segunda", quantidadeIndicacoes: 20, scoreLideranca: 74 }
    ]);
    countLeadershipsMock.mockResolvedValue(2);

    const { getRankingData } = await import("@/services/ranking-service");

    const result = await getRankingData({
      page: "1",
      pageSize: "10",
      cidade: "Sao Paulo",
      minScore: "50",
      sortBy: "COST_PER_VOTE_ASC"
    });

    expect(listRankingMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cidade: "Sao Paulo",
        minScore: 50
      }),
      1,
      10,
      "COST_PER_VOTE_ASC"
    );
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.filters.sortBy).toBe("COST_PER_VOTE_ASC");
  });
});
