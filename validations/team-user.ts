import { z } from "zod";

const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const teamUserCreateSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo"),
  email: z.string().trim().toLowerCase().email("Informe um email válido"),
  password: z.string().trim().min(6, "A senha deve ter no mínimo 6 caracteres")
});

export const teamUserUpdateSchema = z
  .object({
    name: optionalTrimmed.refine(
      (value) => value === undefined || value.length >= 3,
      "Informe o nome completo"
    ),
    email: optionalTrimmed.refine(
      (value) => value === undefined || z.string().email().safeParse(value).success,
      "Informe um email válido"
    ),
    password: optionalTrimmed.refine(
      (value) => value === undefined || value.length >= 6,
      "A nova senha deve ter no mínimo 6 caracteres"
    )
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.email !== undefined ||
      value.password !== undefined,
    {
      message: "Informe ao menos um campo para atualizar"
    }
  );

export type TeamUserCreateInput = z.infer<typeof teamUserCreateSchema>;
export type TeamUserUpdateInput = z.infer<typeof teamUserUpdateSchema>;
