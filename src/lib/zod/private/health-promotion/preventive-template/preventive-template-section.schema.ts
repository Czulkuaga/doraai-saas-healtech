import { z } from "zod";

export const preventiveTemplateSectionSchema = z.object({
    key: z
        .string()
        .trim()
        .min(1, "La clé est requise.")
        .max(80, "La clé est trop longue.")
        .regex(
            /^[a-z0-9_]+$/,
            "La clé doit contenir uniquement des lettres minuscules, chiffres et underscores."
        ),
    title: z
        .string()
        .trim()
        .min(1, "Le titre est requis.")
        .max(180, "Le titre est trop long."),
    order: z.coerce
        .number()
        .int("L’ordre doit être un nombre entier.")
        .min(1, "L’ordre doit être supérieur ou égal à 1."),
});

export type PreventiveTemplateSectionInput = z.infer<
    typeof preventiveTemplateSectionSchema
>;