import { z } from "zod";

function emptyToNull(value: unknown) {
    if (value === "" || value === undefined) return null;
    return value;
}

export const preventiveTemplateStatusEnum = z.enum([
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED",
]);

export const preventiveTemplateSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, "Le code est requis.")
        .max(40, "Le code est trop long."),
    name: z
        .string()
        .trim()
        .min(1, "Le nom est requis.")
        .max(180, "Le nom est trop long."),
    description: z.preprocess(
        emptyToNull,
        z.string().trim().max(5000, "La description est trop longue.").nullable().optional()
    ),
    serviceTypeId: z.preprocess(
        emptyToNull,
        z.string().trim().nullable().optional()
    ),
    specialtyId: z.preprocess(
        emptyToNull,
        z.string().trim().nullable().optional()
    ),
    status: preventiveTemplateStatusEnum.default("DRAFT"),
    isActive: z.boolean().default(true),
});

export type PreventiveTemplateInput = z.infer<typeof preventiveTemplateSchema>;