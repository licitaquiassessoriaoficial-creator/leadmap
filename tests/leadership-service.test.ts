import { LeadershipStatus, LocationStatus, PotentialLevel } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createLeadershipMock = vi.fn();
const replaceLeadershipResponsibleCitiesMock = vi.fn();
const findLeadershipDetailsByIdMock = vi.fn();
const recordAuditLogMock = vi.fn();
const geocodeCityStateMock = vi.fn();
const findCityByIdMock = vi.fn();

vi.mock("@/repositories/leadership-repository", () => ({
  countLeaderships: vi.fn(),
  createLeadership: createLeadershipMock,
  decrementLeadershipIndications: vi.fn(),
  deleteLeadership: vi.fn(),
  findLeadershipById: vi.fn(),
  findLeadershipDetailsById: findLeadershipDetailsByIdMock,
  findLeadershipSummaryById: vi.fn(),
  incrementLeadershipIndications: vi.fn(),
  listLeaderships: vi.fn(),
  replaceLeadershipResponsibleCities: replaceLeadershipResponsibleCitiesMock,
  updateLeadership: vi.fn()
}));

vi.mock("@/repositories/city-repository", () => ({
  findCityById: findCityByIdMock,
  listCities: vi.fn(),
  listStates: vi.fn()
}));

vi.mock("@/repositories/user-repository", () => ({
  findDefaultLeadershipOwner: vi.fn()
}));

vi.mock("@/services/audit-service", () => ({
  recordAuditLog: recordAuditLogMock
}));

vi.mock("@/services/geocoding-service", () => ({
  geocodeCityState: geocodeCityStateMock
}));

vi.mock("@/services/user-service", () => ({
  getScopedLeadershipUserIds: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("@/services/campaign-settings-service", () => ({
  getCampaignScope: vi.fn().mockResolvedValue({
    enforcedState: undefined
  })
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: async (callback: (tx: Record<string, unknown>) => unknown) =>
      callback({} as Record<string, unknown>)
  }
}));

describe("createLeadershipRecord", () => {
  beforeEach(() => {
    createLeadershipMock.mockReset();
    replaceLeadershipResponsibleCitiesMock.mockReset();
    findLeadershipDetailsByIdMock.mockReset();
    recordAuditLogMock.mockReset();
    geocodeCityStateMock.mockReset();
    findCityByIdMock.mockReset();
  });

  it("cria lideranca com faixa calculada, coordenadas e auditoria", async () => {
    findCityByIdMock.mockResolvedValue({
      id: "city-1",
      nome: "Sao Paulo",
      estado: "SP",
      latitude: -23.55,
      longitude: -46.63
    });

    geocodeCityStateMock.mockResolvedValue({
      latitude: -23.55,
      longitude: -46.63,
      provider: "nominatim"
    });

    createLeadershipMock.mockResolvedValue({
      id: "lead-1",
      nome: "Lideranca Teste"
    });

    findLeadershipDetailsByIdMock.mockResolvedValue({
      id: "lead-1",
      nome: "Lideranca Teste",
      cidade: "Sao Paulo",
      estado: "SP",
      cidadeId: "city-1",
      fotoPerfilUrl: null,
      telefone: "5511999999999",
      email: null,
      cpf: null,
      bairro: null,
      endereco: null,
      latitude: -23.55,
      longitude: -46.63,
      locationStatus: LocationStatus.FOUND,
      potencialVotosEstimado: 700,
      custoTotal: 2100,
      faixaPotencial: PotentialLevel.HIGH,
      status: LeadershipStatus.ACTIVE,
      observacoes: null,
      quantidadeIndicacoes: 0,
      indicadoPorId: null,
      cadastradoPorId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      city: {
        id: "city-1",
        nome: "Sao Paulo",
        estado: "SP",
        totalEleitores: 1000000,
        latitude: -23.55,
        longitude: -46.63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      cadastradoPor: {
        id: "user-1",
        name: "Admin",
        email: "admin@leadmap.local",
        role: "ADMIN",
        createdById: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      indicadoPor: null,
      indicados: [],
      cidadesResponsaveis: []
    });

    const { createLeadershipRecord } = await import(
      "@/services/leadership-service"
    );

    const result = await createLeadershipRecord(
      {
        nome: "Lideranca Teste",
        telefone: "5511999999999",
        cidadeId: "city-1",
        estado: "SP",
        potencialVotosEstimado: 700,
        custoTotal: 2100,
        cidadesResponsaveisIds: ["city-2"],
        status: LeadershipStatus.ACTIVE
      },
      "user-1"
    );

    expect(createLeadershipMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Lideranca Teste",
        cidade: "Sao Paulo",
        cidadeId: "city-1",
        faixaPotencial: PotentialLevel.HIGH,
        locationStatus: LocationStatus.FOUND,
        latitude: -23.55,
        longitude: -46.63
      }),
      expect.anything()
    );
    expect(replaceLeadershipResponsibleCitiesMock).toHaveBeenCalledWith(
      "lead-1",
      ["city-1", "city-2"],
      expect.anything()
    );
    expect(recordAuditLogMock).toHaveBeenCalledTimes(1);
    expect(result.id).toBe("lead-1");
  });
});
