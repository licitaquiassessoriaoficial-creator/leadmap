import { LeadershipStatus } from "@prisma/client";

import { leadershipCreateSchema } from "@/validations/leadership";

describe("leadershipCreateSchema", () => {
  it("valida um payload completo", () => {
    const payload = leadershipCreateSchema.parse({
      nome: "Maria da Silva",
      telefone: "(11) 99999-0000",
      email: "maria@example.com",
      cpf: "12345678901",
      cidade: "Sao Paulo",
      estado: "SP",
      bairro: "Centro",
      endereco: "Rua A, 123",
      observacoes: "Boa articulacao local",
      potencialVotosEstimado: 250,
      quantidadeIndicacoes: 12,
      status: LeadershipStatus.ACTIVE
    });

    expect(payload.nome).toBe("Maria da Silva");
    expect(payload.quantidadeIndicacoes).toBe(12);
  });

  it("rejeita payload invalido", () => {
    const result = leadershipCreateSchema.safeParse({
      nome: "Jo",
      telefone: "123",
      cidade: "",
      estado: "",
      potencialVotosEstimado: -1
    });

    expect(result.success).toBe(false);
  });
});
