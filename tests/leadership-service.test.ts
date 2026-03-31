import { LeadershipStatus, LocationStatus, PotentialLevel } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createLeadershipMock = vi.fn();
const recordAuditLogMock = vi.fn();
const geocodeCityStateMock = vi.fn();

vi.mock("@/repositories/leadership-repository", () => ({
  createLeadership: createLeadershipMock,
  deleteLeadership: vi.fn(),
  findLeadershipById: vi.fn(),
  listCities: vi.fn(),
  listLeaderships: vi.fn(),
  listStates: vi.fn(),
  countLeaderships: vi.fn(),
  updateLeadership: vi.fn()
}));

vi.mock("@/services/audit-service", () => ({
  recordAuditLog: recordAuditLogMock
}));

vi.mock("@/services/geocoding-service", () => ({
  geocodeCityState: geocodeCityStateMock
}));

describe("createLeadershipRecord", () => {
  beforeEach(() => {
    createLeadershipMock.mockReset();
    recordAuditLogMock.mockReset();
    geocodeCityStateMock.mockReset();
  });

  it("cria lideranca com faixa calculada e auditoria", async () => {
    geocodeCityStateMock.mockResolvedValue({
      latitude: -23.55,
      longitude: -46.63,
      provider: "nominatim"
    });

    createLeadershipMock.mockImplementation(async (data) => ({
      id: "lead-1",
      ...data,
      status: LeadershipStatus.ACTIVE,
      faixaPotencial: PotentialLevel.HIGH,
      locationStatus: LocationStatus.FOUND,
      createdAt: new Date(),
      updatedAt: new Date(),
      cadastradoPor: {
        id: "user-1",
        name: "Admin",
        email: "admin@leadmap.local",
        passwordHash: "hash",
        role: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }));

    const { createLeadershipRecord } = await import(
      "@/services/leadership-service"
    );

    const result = await createLeadershipRecord(
      {
        nome: "Lideranca Teste",
        telefone: "(11) 99999-9999",
        cidade: "Sao Paulo",
        estado: "SP",
        potencialVotosEstimado: 700,
        quantidadeIndicacoes: 4,
        status: LeadershipStatus.ACTIVE
      },
      "user-1"
    );

    expect(createLeadershipMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Lideranca Teste",
        faixaPotencial: PotentialLevel.HIGH,
        locationStatus: LocationStatus.FOUND,
        latitude: -23.55,
        longitude: -46.63
      })
    );
    expect(recordAuditLogMock).toHaveBeenCalledTimes(1);
    expect(result.id).toBe("lead-1");
  });
});
