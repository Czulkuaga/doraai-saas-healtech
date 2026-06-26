// src/lib/zod/preventive-case/preventive-case.schema.ts

import { z } from "zod";

import {
  FollowUpFrequency,
  PreventiveCaseStatus,
  PreventiveRiskLevel,
} from "../../../../../../generated/prisma/enums";

const nullableUuid = z
  .string()
  .uuid()
  .optional()
  .or(z.literal(""))
  .nullable()
  .transform((value) => value || null);

const nullableText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => value || null);

const nullableDate = z
  .date()
  .optional()
  .nullable()
  .or(z.string().optional().nullable())
  .transform((value) => {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  });

const nullableNumber = z
  .number()
  .int()
  .min(0)
  .optional()
  .nullable()
  .or(z.string().optional().nullable())
  .transform((value) => {
    if (value === "" || value === null || value === undefined) return null;
    return typeof value === "number" ? value : Number(value);
  });

export const createPreventiveCaseSchema = z.object({
  patientId: z.string().uuid("Le patient est obligatoire."),

  title: nullableText,
  status: z.nativeEnum(PreventiveCaseStatus).optional(),

  pathologyId: nullableUuid,
  providerProfileId: nullableUuid,
  orgUnitId: nullableUuid,
  locationId: nullableUuid,
  serviceTypeId: nullableUuid,
  specialtyId: nullableUuid,

  riskLevel: z.nativeEnum(PreventiveRiskLevel).optional().nullable(),
  followUpFrequency: z.nativeEnum(FollowUpFrequency).optional().nullable(),
  followUpIntervalDays: nullableNumber,

  nextFollowUpAt: nullableDate,
  nextAutomaticFollowUpAt: nullableDate,

  notes: z
    .string()
    .max(2000, "Maximum 2000 caractères.")
    .optional()
    .nullable()
    .transform((value) => value || null),
});

export type CreatePreventiveCaseInput = z.infer<
  typeof createPreventiveCaseSchema
>;

export const updatePreventiveCaseMetaSchema = createPreventiveCaseSchema
  .omit({
    patientId: true,
  })
  .extend({
    id: z.string().uuid(),
    status: z.nativeEnum(PreventiveCaseStatus),
  });

export type UpdatePreventiveCaseMetaInput = z.infer<
  typeof updatePreventiveCaseMetaSchema
>;

export const preventiveCaseIdSchema = z.object({
  id: z.string().uuid(),
});