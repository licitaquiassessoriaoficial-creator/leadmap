import { LeadershipStatus, PotentialLevel, Role } from "@prisma/client";
import { z } from "zod";

import { POTENTIAL_OPTIONS } from "@/lib/constants/potential";

const optionalStringField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalNumberField = z
  .union([z.coerce.number(), z.literal(""), z.null(), z.undefined()])
  .transform((value) => {
    if (value === "" || value == null) {
      return undefined;
    }

    return Number(value);
  })
  .refine((value) => value === undefined || value >= 0, {
    message: "Informe um valor maior ou igual a zero"
  });

const optionalIntegerField = optionalNumberField.transform((value) =>
  value === undefined ? undefined : Math.trunc(value)
);

const optionalImageUrlField = optionalStringField.refine(
  (value) =>
    !value ||
    value.startsWith("/") ||
    z.string().url().safeParse(value).success,
  "Informe uma URL de imagem válida"
);

export const leadershipCreateSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome da liderança"),
  telefone: z.string().trim().min(8, "Informe um telefone válido"),
  email: optionalStringField.refine(
    (value) => !value || z.string().email().safeParse(value).success,
    "Informe um e-mail válido"
  ),
  cpf: optionalStringField.refine(
    (value) => !value || /^\d{11}$/.test(value.replace(/\D/g, "")),
    "CPF deve ter 11 dígitos"
  ),
  cidadeId: z.string().trim().min(1, "Selecione a cidade"),
  estado: z.string().trim().min(2, "Informe o estado").default("SP"),
  bairro: optionalStringField,
  endereco: optionalStringField,
  observacoes: optionalStringField,
  fotoPerfilUrl: optionalImageUrlField,
  potencialVotosEstimado: z.coerce
    .number()
    .int()
    .min(0, "Potencial deve ser maior ou igual a zero"),
  votosReais: optionalIntegerField,
  custoTotal: optionalNumberField,
  metaVotosIndividual: optionalIntegerField,
  cidadesResponsaveisIds: z.array(z.string().trim().min(1)).default([]),
  status: z.nativeEnum(LeadershipStatus).optional()
});

export const leadershipUpdateSchema = leadershipCreateSchema.partial();

export const publicLeadershipCreateSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome"),
  telefone: z.string().trim().min(8, "Informe um telefone válido"),
  email: optionalStringField.refine(
    (value) => !value || z.string().email().safeParse(value).success,
    "Informe um e-mail válido"
  ),
  cidadeId: z.string().trim().min(1, "Selecione a cidade"),
  estado: z.string().trim().min(2, "Informe o estado").default("SP"),
  observacoes: optionalStringField,
  potencialVotosEstimado: optionalIntegerField,
  votosReais: optionalIntegerField,
  origemRef: optionalStringField
});

export const leadershipQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: optionalStringField,
  cidade: optionalStringField,
  estado: optionalStringField,
  faixaPotencial: z.nativeEnum(PotentialLevel).optional(),
  status: z.nativeEnum(LeadershipStatus).optional(),
  responsavelId: optionalStringField,
  minIndicacoes: optionalIntegerField,
  minScore: optionalNumberField,
  maxCostPerVote: optionalNumberField,
  startDate: optionalStringField,
  endDate: optionalStringField
});

export const rankingSortSchema = z.enum([
  "INDICATIONS_DESC",
  "POTENTIAL_DESC",
  "COST_PER_VOTE_ASC",
  "SCORE_DESC"
]);

export const rankingQuerySchema = leadershipQuerySchema.extend({
  pageSize: z.coerce.number().int().min(1).max(50).default(15),
  sortBy: rankingSortSchema.default("INDICATIONS_DESC")
});

export const usersQuerySchema = z.object({
  role: z.nativeEnum(Role).optional()
});

export const potentialSelectOptions = POTENTIAL_OPTIONS;

export type LeadershipCreateInput = z.infer<typeof leadershipCreateSchema>;
export type LeadershipUpdateInput = z.infer<typeof leadershipUpdateSchema>;
export type PublicLeadershipCreateInput = z.infer<
  typeof publicLeadershipCreateSchema
>;
export type LeadershipQueryInput = z.infer<typeof leadershipQuerySchema>;
export type RankingQueryInput = z.infer<typeof rankingQuerySchema>;
export type RankingSortInput = z.infer<typeof rankingSortSchema>;
