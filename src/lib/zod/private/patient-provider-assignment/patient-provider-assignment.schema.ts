import { z } from "zod";

export const patientProviderAssignmentTypeEnum = z.enum([
    "PRIMARY_CARE",
    "PREVENTIVE_FOLLOWUP",
    "NURSING",
    "SPECIALIST_SUPPORT",
    "OTHER",
]);

function emptyToNull(value: unknown) {
    if (value === "" || value === undefined) return null;
    return value;
}

export const patientProviderAssignmentSchema = z
    .object({
        patientId: z.string().trim().min(1, "Le patient est requis."),
        providerProfileId: z.string().trim().min(1, "Le professionnel est requis."),
        assignmentType: patientProviderAssignmentTypeEnum,
        isPrimary: z.boolean().default(false),
        isActive: z.boolean().default(true),
        startDate: z.preprocess(
            emptyToNull,
            z.string().trim().nullable().optional()
        ),
        endDate: z.preprocess(
            emptyToNull,
            z.string().trim().nullable().optional()
        ),
        notes: z.preprocess(
            emptyToNull,
            z.string().trim().max(2000, "Les notes sont trop longues.").nullable().optional()
        ),
    })
    .superRefine((data, ctx) => {
        if (data.startDate && Number.isNaN(new Date(data.startDate).getTime())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La date de début est invalide.",
                path: ["startDate"],
            });
        }

        if (data.endDate && Number.isNaN(new Date(data.endDate).getTime())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La date de fin est invalide.",
                path: ["endDate"],
            });
        }

        if (data.startDate && data.endDate) {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);

            if (end < start) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La date de fin doit être postérieure ou égale à la date de début.",
                    path: ["endDate"],
                });
            }
        }
    });

export type PatientProviderAssignmentInput = z.infer<
    typeof patientProviderAssignmentSchema
>;