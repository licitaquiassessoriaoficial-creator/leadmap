import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um email valido"),
  password: z.string().min(6, "A senha deve ter no minimo 6 caracteres")
});

export type LoginInput = z.infer<typeof loginSchema>;
