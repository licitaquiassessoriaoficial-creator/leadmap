import { beforeEach, describe, expect, it, vi } from "vitest";

const listRankingMock = vi.fn();
const countLeadershipsMock = vi.fn();

vi.mock("@/repositories/leadership-repository", () => ({
  countLeaderships: countLeadershipsMock,
  listRanking: listRankingMock
}));

describe("getRankingData", () => {
  beforeEach(() => {
    listRankingMock.mockReset();
    countLeadershipsMock.mockReset();
  });

  it("retorna ranking ordenado e metadados de paginação", async () => {
    listRankingMock.mockResolvedValue([
      { id: "1", nome: "Primeira", quantidadeIndicacoes: 30 },
      { id: "2", nome: "Segunda", quantidadeIndicacoes: 20 }
    ]);
    countLeadershipsMock.mockResolvedValue(2);

    const { getRankingData } = await import("@/services/ranking-service");

    const result = await getRankingData({
      page: "1",
      pageSize: "10",
      cidade: "Sao Paulo"
    });

    expect(listRankingMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cidade: "Sao Paulo"
      }),
      1,
      10
    );
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
  });
});
