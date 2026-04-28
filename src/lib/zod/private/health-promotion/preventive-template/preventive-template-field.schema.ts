import { z } from "zod";
import { PreventiveFieldType } from "../../../../../../generated/prisma/enums";

function emptyToNull(value: unknown) {
    if (value === "" || value === undefined) return null;
    return value;
}

export const preventiveTemplateFieldSchema = z.object({
    key: z
        .string()
        .trim()
        .min(1, "La clé est requise.")
        .max(80, "La clé est trop longue.")
        .regex(
            /^[a-z0-9_]+$/,
            "La clé doit contenir uniquement des lettres minuscules, chiffres et underscores."
        ),
    label: z
        .string()
        .trim()
        .min(1, "Le libellé est requis.")
        .max(180, "Le libellé est trop long."),
    type: z.nativeEnum(PreventiveFieldType),
    required: z.boolean().default(false),
    order: z.coerce
        .number()
        .int("L’ordre doit être un nombre entier.")
        .min(1, "L’ordre doit être supérieur ou égal à 1."),
    configText: z.preprocess(
        emptyToNull,
        z.string().trim().nullable().optional()
    ),
}).superRefine((data, ctx) => {
    if (!data.configText) return;

    try {
        JSON.parse(data.configText);
    } catch {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La configuration doit être un JSON valide.",
            path: ["configText"],
        });
    }
});

export type PreventiveTemplateFieldInput = z.infer<
    typeof preventiveTemplateFieldSchema
>;