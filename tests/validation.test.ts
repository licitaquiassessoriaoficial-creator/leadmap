import { LeadershipStatus } from "@prisma/client";

import {
  leadershipCreateSchema,
  publicLeadershipCreateSchema
} from "@/validations/leadership";

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
      observacoes: "Boa articulação local",
      fotoPerfilUrl: "/uploads/profiles/maria.jpg",
      potencialVotosEstimado: 250,
      votosReais: 180,
      custoTotal: 1500,
      metaVotosIndividual: 220,
      cidadesResponsaveisIds: ["city-sp", "city-campinas"],
      status: LeadershipStatus.ACTIVE
    });

    expect(payload.nome).toBe("Maria da Silva");
    expect(payload.votosReais).toBe(180);
    expect(payload.metaVotosIndividual).toBe(220);
    expect(payload.cidadesResponsaveisIds).toHaveLength(2);
  });

  it("rejeita payload inválido", () => {
    const result = leadershipCreateSchema.safeParse({
      nome: "Jo",
      telefone: "123",
      cidadeId: "",
      estado: "",
      potencialVotosEstimado: -1,
      votosReais: -2,
      custoTotal: -10
    });

    expect(result.success).toBe(false);
  });
});

describe("publicLeadershipCreateSchema", () => {
  it("aceita cadastro público simples com origem de referral", () => {
    const payload = publicLeadershipCreateSchema.parse({
      nome: "Bruna Alves",
      telefone: "5511988887777",
      cidadeId: "city-sp",
      estado: "SP",
      origemRef: "ana-paula-1234abcd"
    });

    expect(payload.origemRef).toBe("ana-paula-1234abcd");
  });

  it("rejeita votos negativos no cadastro público", () => {
    const result = publicLeadershipCreateSchema.safeParse({
      nome: "Bruna Alves",
      telefone: "5511988887777",
      cidadeId: "city-sp",
      estado: "SP",
      votosReais: -1
    });

    expect(result.success).toBe(false);
  });
});
