import { Role } from "@prisma/client";
import { z } from "zod";

const optionalPassword = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const managedUserCreateSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo"),
  email: z.string().trim().toLowerCase().email("Informe um email válido"),
  password: z.string().trim().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.nativeEnum(Role)
});

export const managedUserUpdateSchema = z
  .object({
    role: z.nativeEnum(Role).optional(),
    password: optionalPassword.refine(
      (value) => !value || value.length >= 6,
      "A nova senha deve ter no mínimo 6 caracteres"
    )
  })
  .refine((value) => value.role !== undefined || value.password !== undefined, {
    message: "Informe ao menos um campo para atualizar"
  });

export type ManagedUserCreateInput = z.infer<typeof managedUserCreateSchema>;
export type ManagedUserUpdateInput = z.infer<typeof managedUserUpdateSchema>;
