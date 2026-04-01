import { z } from "zod";

import { BRAZILIAN_STATES } from "@/lib/constants/brazil-states";

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalStateCode = optionalTrimmedString
  .transform((value) => value?.toUpperCase())
  .refine(
    (value) => !value || BRAZILIAN_STATES.includes(value as (typeof BRAZILIAN_STATES)[number]),
    "Selecione um estado válido"
  );

export const campaignSettingsSchema = z
  .object({
    nomeCampanha: optionalTrimmedString,
    estadoPadrao: optionalStateCode,
    restringirAoEstadoPadrao: z.boolean().default(false)
  })
  .superRefine((input, context) => {
    if (input.restringirAoEstadoPadrao && !input.estadoPadrao) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["estadoPadrao"],
        message: "Informe o estado padrão para restringir a campanha"
      });
    }
  });

export type CampaignSettingsInput = z.infer<typeof campaignSettingsSchema>;
