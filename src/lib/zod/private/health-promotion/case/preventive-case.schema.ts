// src/lib/zod/preventive-case/preventive-case.schema.ts

import { z } from "zod";

export const createPreventiveCaseSchema = z.object({
    patientId: z.string().uuid("Le patient est obligatoire."),
    templateId: z.string().uuid("Le modèle préventif est obligatoire."),

    providerProfileId: z.string().uuid().optional().or(z.literal("")),
    orgUnitId: z.string().uuid().optional().or(z.literal("")),
    locationId: z.string().uuid().optional().or(z.literal("")),

    notes: z.string().max(2000, "Maximum 2000 caractères.").optional(),
});

export type CreatePreventiveCaseInput = z.infer<typeof createPreventiveCaseSchema>;

export const updatePreventiveCaseMetaSchema = z.object({
    id: z.string().uuid(),
    providerProfileId: z.string().uuid().optional().or(z.literal("")),
    orgUnitId: z.string().uuid().optional().or(z.literal("")),
    locationId: z.string().uuid().optional().or(z.literal("")),
    notes: z.string().max(2000, "Maximum 2000 caractères.").optional(),
});

export type UpdatePreventiveCaseMetaInput = z.infer<
    typeof updatePreventiveCaseMetaSchema
>;

export const savePreventiveCaseAnswersSchema = z.object({
    caseId: z.string().uuid(),
    answers: z.record(z.string(), z.unknown()),
});

export type SavePreventiveCaseAnswersInput = z.infer<
    typeof savePreventiveCaseAnswersSchema
>;

export const preventiveCaseIdSchema = z.object({
    id: z.string().uuid(),
});