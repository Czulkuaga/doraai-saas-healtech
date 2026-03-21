import { z } from "zod";
import { BPRoleType, PartnerType } from "../../../../../../generated/prisma/enums";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
    z.preprocess((val) => {
        if (typeof val === "string" && val.trim() === "") return undefined;
        return val;
    }, schema.optional());

export const businessPartnerSchema = z
    .object({
        type: z.nativeEnum(PartnerType, {
            error: "Le type de tiers est obligatoire.",
        }),

        code: emptyToUndefined(
            z
                .string()
                .trim()
                .min(2, "Le code doit contenir au moins 2 caractères.")
                .max(50, "Le code ne peut pas dépasser 50 caractères.")
        ),

        isActive: z.boolean().default(true),

        firstName: emptyToUndefined(
            z
                .string()
                .trim()
                .min(2, "Le prénom doit contenir au moins 2 caractères.")
                .max(120, "Le prénom ne peut pas dépasser 120 caractères.")
        ),

        lastName: emptyToUndefined(
            z
                .string()
                .trim()
                .min(2, "Le nom doit contenir au moins 2 caractères.")
                .max(120, "Le nom ne peut pas dépasser 120 caractères.")
        ),

        organizationName: emptyToUndefined(
            z
                .string()
                .trim()
                .min(2, "Le nom de l’organisation doit contenir au moins 2 caractères.")
                .max(180, "Le nom de l’organisation ne peut pas dépasser 180 caractères.")
        ),

        email: emptyToUndefined(
            z
                .string()
                .trim()
                .email("Adresse e-mail invalide.")
                .max(190, "L’e-mail ne peut pas dépasser 190 caractères.")
        ),

        phone: emptyToUndefined(
            z
                .string()
                .trim()
                .min(5, "Numéro de téléphone invalide.")
                .max(40, "Le téléphone ne peut pas dépasser 40 caractères.")
        ),

        birthDate: emptyToUndefined(
            z.string().refine((value) => !value || !Number.isNaN(Date.parse(value)), {
                message: "Date invalide.",
            })
        ),

        roles: z
            .array(z.nativeEnum(BPRoleType), {
                error: "Sélectionnez au moins un rôle valide.",
            })
            .min(1, "Sélectionnez au moins un rôle."),
    })
    .superRefine((data, ctx) => {
        if (data.type === PartnerType.PERSON) {
            if (!data.firstName?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["firstName"],
                    message: "Le prénom est obligatoire pour une personne.",
                });
            }

            if (!data.lastName?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["lastName"],
                    message: "Le nom est obligatoire pour une personne.",
                });
            }
        }

        if (data.type === PartnerType.ORGANIZATION) {
            if (!data.organizationName?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["organizationName"],
                    message: "Le nom de l’organisation est obligatoire.",
                });
            }
        }
    });

export type BusinessPartnerSchemaInput = z.infer<typeof businessPartnerSchema>;