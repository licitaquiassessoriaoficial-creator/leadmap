import { LeadershipStatus, LocationStatus, PotentialLevel } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createLeadershipMock = vi.fn();
const replaceLeadershipResponsibleCitiesMock = vi.fn();
const findLeadershipByIdMock = vi.fn();
const findLeadershipDetailsByIdMock = vi.fn();
const findLeadershipSummaryByReferenceMock = vi.fn();
const updateLeadershipMock = vi.fn();
const incrementLeadershipIndicationsMock = vi.fn();
const createReferralSignupMock = vi.fn();
const createPerformanceSnapshotMock = vi.fn();
const recordAuditLogMock = vi.fn();
const geocodeCityStateMock = vi.fn();
const findCityByIdMock = vi.fn();
const findDefaultLeadershipOwnerMock = vi.fn();

vi.mock("@/repositories/leadership-repository", () => ({
  countLeaderships: vi.fn(),
  createLeadership: createLeadershipMock,
  decrementLeadershipIndications: vi.fn(),
  deleteLeadership: vi.fn(),
  findLeadershipById: findLeadershipByIdMock,
  findLeadershipDetailsById: findLeadershipDetailsByIdMock,
  findLeadershipSummaryById: vi.fn(),
  findLeadershipSummaryByReference: findLeadershipSummaryByReferenceMock,
  incrementLeadershipIndications: incrementLeadershipIndicationsMock,
  listLeaderships: vi.fn(),
  replaceLeadershipResponsibleCities: replaceLeadershipResponsibleCitiesMock,
  updateLeadership: updateLeadershipMock
}));

vi.mock("@/repositories/city-repository", () => ({
  findCityById: findCityByIdMock,
  listCities: vi.fn(),
  listStates: vi.fn()
}));

vi.mock("@/repositories/user-repository", () => ({
  findDefaultLeadershipOwner: findDefaultLeadershipOwnerMock
}));

vi.mock("@/repositories/performance-history-repository", () => ({
  createPerformanceSnapshot: createPerformanceSnapshotMock
}));

vi.mock("@/repositories/referral-signup-repository", () => ({
  createReferralSignup: createReferralSignupMock
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
    leadership: {
      findUnique: vi.fn().mockResolvedValue(null)
    },
    $transaction: async (callback: (tx: Record<string, unknown>) => unknown) =>
      callback({} as Record<string, unknown>)
  }
}));

function buildLeadershipDetails(overrides: Record<string, unknown> = {}) {
  return {
    id: "lead-1",
    nome: "Liderança Teste",
    cidade: "Sao Paulo",
    estado: "SP",
    cidadeId: "city-1",
    fotoPerfilUrl: null,
    telefone: "5511999999999",
    whatsapp: "5511999999999",
    email: null,
    cpf: null,
    bairro: null,
    endereco: null,
    latitude: -23.55,
    longitude: -46.63,
    locationStatus: LocationStatus.FOUND,
    potencialVotosEstimado: 700,
    votosReais: 350,
    custoTotal: 2100,
    custoPorVoto: 6,
    metaVotosIndividual: 500,
    faixaPotencial: PotentialLevel.HIGH,
    scoreLideranca: 81.4,
    status: LeadershipStatus.ACTIVE,
    observacoes: null,
    quantidadeIndicacoes: 3,
    referralCode: "lideranca-teste-1234abcd",
    indicadoPorId: null,
    cadastradoPorId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    city: {
      id: "city-1",
      nome: "Sao Paulo",
      estado: "SP",
      totalEleitores: 1000000,
      metaVotosCidade: 800000,
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
    referralSignups: [],
    performanceHistory: [
      {
        id: "history-1",
        leadershipId: "lead-1",
        dataReferencia: new Date("2026-03-20T00:00:00.000Z"),
        votosEstimados: 650,
        votosReais: 320,
        quantidadeIndicacoes: 2,
        custoTotal: 1900,
        score: 75.2,
        createdAt: new Date("2026-03-20T00:00:00.000Z")
      }
    ],
    cidadesResponsaveis: [
      {
        cityId: "city-1",
        city: {
          id: "city-1",
          nome: "Sao Paulo",
          estado: "SP",
          totalEleitores: 1000000,
          metaVotosCidade: 800000,
          latitude: -23.55,
          longitude: -46.63,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    ],
    ...overrides
  };
}

describe("leadership-service", () => {
  beforeEach(() => {
    createLeadershipMock.mockReset();
    replaceLeadershipResponsibleCitiesMock.mockReset();
    findLeadershipByIdMock.mockReset();
    findLeadershipDetailsByIdMock.mockReset();
    findLeadershipSummaryByReferenceMock.mockReset();
    updateLeadershipMock.mockReset();
    incrementLeadershipIndicationsMock.mockReset();
    createReferralSignupMock.mockReset();
    createPerformanceSnapshotMock.mockReset();
    recordAuditLogMock.mockReset();
    geocodeCityStateMock.mockReset();
    findCityByIdMock.mockReset();
    findDefaultLeadershipOwnerMock.mockReset();
  });

  it("cria liderança com custo por voto calculado, referral e snapshot", async () => {
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

    createLeadershipMock.mockResolvedValue(
      buildLeadershipDetails({
        id: "lead-1",
        custoPorVoto: 6
      })
    );
    findLeadershipDetailsByIdMock.mockResolvedValue(
      buildLeadershipDetails({
        id: "lead-1",
        custoPorVoto: 6
      })
    );

    const { createLeadershipRecord } = await import(
      "@/services/leadership-service"
    );

    const result = await createLeadershipRecord(
      {
        nome: "Liderança Teste",
        telefone: "5511999999999",
        cidadeId: "city-1",
        estado: "SP",
        potencialVotosEstimado: 700,
        votosReais: 350,
        custoTotal: 2100,
        metaVotosIndividual: 500,
        cidadesResponsaveisIds: ["city-2"],
        status: LeadershipStatus.ACTIVE
      },
      "user-1"
    );

    expect(createLeadershipMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Liderança Teste",
        cidade: "Sao Paulo",
        cidadeId: "city-1",
        whatsapp: "5511999999999",
        custoPorVoto: 6,
        faixaPotencial: PotentialLevel.HIGH,
        locationStatus: LocationStatus.FOUND,
        referralCode: expect.any(String),
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
    expect(createPerformanceSnapshotMock).toHaveBeenCalledTimes(1);
    expect(recordAuditLogMock).toHaveBeenCalledTimes(1);
    expect(result.id).toBe("lead-1");
  });

  it("processa cadastro público por link e incrementa a liderança referente", async () => {
    findCityByIdMock.mockResolvedValue({
      id: "city-1",
      nome: "Campinas",
      estado: "SP",
      latitude: -22.9,
      longitude: -47.06
    });
    findDefaultLeadershipOwnerMock.mockResolvedValue({
      id: "user-admin",
      name: "Admin",
      email: "admin@leadmap.local",
      role: "ADMIN"
    });
    findLeadershipSummaryByReferenceMock.mockResolvedValue({
      id: "lead-ref",
      nome: "Ana Paula Martins",
      cidadeId: "city-1",
      indicadoPorId: null,
      referralCode: "ana-paula-1234abcd"
    });
    createLeadershipMock.mockResolvedValue(
      buildLeadershipDetails({
        id: "lead-public",
        nome: "Bruna Melo",
        cidade: "Campinas",
        cidadeId: "city-1",
        potencialVotosEstimado: 120,
        votosReais: null,
        custoTotal: null,
        custoPorVoto: null,
        metaVotosIndividual: null,
        quantidadeIndicacoes: 0,
        scoreLideranca: 54.2,
        referralCode: "bruna-melo-1234abcd"
      })
    );
    findLeadershipDetailsByIdMock
      .mockResolvedValueOnce(
        buildLeadershipDetails({
          id: "lead-ref",
          nome: "Ana Paula Martins",
          quantidadeIndicacoes: 4,
          scoreLideranca: 89.4
        })
      )
      .mockResolvedValueOnce(
        buildLeadershipDetails({
          id: "lead-public",
          nome: "Bruna Melo",
          cidade: "Campinas",
          cidadeId: "city-1",
          potencialVotosEstimado: 120,
          votosReais: null,
          custoTotal: null,
          custoPorVoto: null,
          metaVotosIndividual: null,
          quantidadeIndicacoes: 0,
          scoreLideranca: 54.2,
          referralCode: "bruna-melo-1234abcd"
        })
      );
    updateLeadershipMock.mockResolvedValue(
      buildLeadershipDetails({
        id: "lead-ref",
        nome: "Ana Paula Martins",
        quantidadeIndicacoes: 4,
        scoreLideranca: 89.4
      })
    );

    const { createPublicLeadershipRecord } = await import(
      "@/services/leadership-service"
    );

    const result = await createPublicLeadershipRecord({
      nome: "Bruna Melo",
      telefone: "5511999991111",
      cidadeId: "city-1",
      estado: "SP",
      potencialVotosEstimado: 120,
      origemRef: "ana-paula-1234abcd"
    });

    expect(createReferralSignupMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Bruna Melo",
        leadershipId: "lead-ref",
        origemRef: "ana-paula-1234abcd"
      }),
      expect.anything()
    );
    expect(incrementLeadershipIndicationsMock).toHaveBeenCalledWith(
      "lead-ref",
      expect.anything()
    );
    expect(updateLeadershipMock).toHaveBeenCalledWith(
      "lead-ref",
      expect.objectContaining({
        scoreLideranca: expect.any(Number)
      }),
      expect.anything()
    );
    expect(createPerformanceSnapshotMock).toHaveBeenCalledTimes(2);
    expect(recordAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        acao: "PUBLIC_SIGNUP"
      })
    );
    expect(result.id).toBe("lead-public");
  });
});
