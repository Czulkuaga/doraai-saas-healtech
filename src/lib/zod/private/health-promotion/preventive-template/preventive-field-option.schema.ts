// src/lib/zod/health-promotion/preventive-template/preventive-field-option.schema.ts
import { z } from "zod";

export const preventiveFieldOptionSchema = z.object({
    key: z
        .string()
        .trim()
        .min(1, "La clé est requise.")
        .max(80, "La clé est trop longue.")
        .regex(/^[a-z0-9_]+$/, "Utilisez uniquement minuscules, chiffres et underscores."),
    label: z
        .string()
        .trim()
        .min(1, "Le libellé est requis.")
        .max(180, "Le libellé est trop long."),
    order: z.coerce.number().int().min(1, "L’ordre doit être supérieur ou égal à 1."),
});

export type PreventiveFieldOptionInput = z.infer<typeof preventiveFieldOptionSchema>;