import { z } from "zod";

export const createPathologySchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Le code est requis.")
    .max(50, "Le code ne peut pas dépasser 50 caractères.")
    .transform((value) => value.toUpperCase()),

  name: z
    .string()
    .trim()
    .min(2, "Le nom est requis.")
    .max(120, "Le nom ne peut pas dépasser 120 caractères."),

  description: z
    .string()
    .trim()
    .max(500, "La description ne peut pas dépasser 500 caractères.")
    .optional()
    .nullable()
    .transform((value) => value || null),

  color: z
    .string()
    .trim()
    .max(30, "La couleur ne peut pas dépasser 30 caractères.")
    .optional()
    .nullable()
    .transform((value) => value || null),

  isActive: z.boolean().default(true),
});

export const updatePathologySchema = createPathologySchema.extend({
  id: z.string().uuid("Identifiant invalide."),
});

export type CreatePathologyInput = z.infer<typeof createPathologySchema>;
export type UpdatePathologyInput = z.infer<typeof updatePathologySchema>;