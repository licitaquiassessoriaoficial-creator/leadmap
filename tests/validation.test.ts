import { LeadershipStatus } from "@prisma/client";

import { leadershipCreateSchema } from "@/validations/leadership";

describe("leadershipCreateSchema", () => {
  it("valida um payload completo", () => {
    const payload = leadershipCreateSchema.parse({
      nome: "Maria da Silva",
      telefone: "5511999990000",
      email: "maria@example.com",
      cpf: "12345678901",
      cidadeId: "city-sp",
      estado: "SP",
      bairro: "Centro",
      endereco: "Rua A, 123",
      observacoes: "Boa articulacao local",
      fotoPerfilUrl: "/uploads/profiles/maria.jpg",
      potencialVotosEstimado: 250,
      custoTotal: 1500,
      cidadesResponsaveisIds: ["city-sp", "city-campinas"],
      status: LeadershipStatus.ACTIVE
    });

    expect(payload.nome).toBe("Maria da Silva");
    expect(payload.cidadeId).toBe("city-sp");
    expect(payload.cidadesResponsaveisIds).toHaveLength(2);
  });

  it("rejeita payload invalido", () => {
    const result = leadershipCreateSchema.safeParse({
      nome: "Jo",
      telefone: "123",
      cidadeId: "",
      estado: "",
      potencialVotosEstimado: -1
    });

    expect(result.success).toBe(false);
  });
});
