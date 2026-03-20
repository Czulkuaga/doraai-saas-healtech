import { z } from "zod";
import type {
    UserCategory,
    MembershipStatus,
} from "@/lib/types/users/users-types";

const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const userCategorySchema = z.enum([
    "SUPERADMIN",
    "ADMIN",
    "USER",
    "PROFESSIONAL",
] as const satisfies readonly UserCategory[]);

export const membershipStatusSchema = z.enum([
    "ACTIVE",
    "INACTIVE",
    "SUSPENDED",
    "PENDING",
] as const satisfies readonly MembershipStatus[]);

const passwordSchema = z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(50, "Le mot de passe ne peut pas dépasser 50 caractères.")
    .regex(
        strongPasswordRegex,
        "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial."
    );

export const userBaseSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(2, "Le prénom doit contenir au moins 2 caractères.")
        .max(60),

    lastName: z
        .string()
        .trim()
        .min(2, "Le nom doit contenir au moins 2 caractères.")
        .max(60),

    email: z
        .string({ message: "L’adresse e-mail est requise." })
        .trim()
        .min(3, "L’adresse e-mail est requise.")
        .email("Veuillez saisir une adresse e-mail valide.")
        .max(160, "L’adresse e-mail ne peut pas dépasser 160 caractères.")
        .transform((v) => v.toLowerCase()),

    phone: z
        .string({ message: "Le numéro de téléphone est requis." })
        .trim()
        .min(1, "Le numéro de téléphone est requis.")
        .max(40, "Le numéro de téléphone ne peut pas dépasser 40 caractères."),

    category: userCategorySchema,

    isActive: z.boolean({
        message: "Le statut du compte est invalide.",
    }),

    membershipStatus: membershipStatusSchema,
});

export const createUserSchema = userBaseSchema
    .extend({
        password: passwordSchema,
        confirmPassword: z.string().min(1, "La confirmation du mot de passe est requise."),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: "Les mots de passe ne correspondent pas.",
            });
        }
    });

export const updateUserSchema = userBaseSchema
    .extend({
        membershipId: z
            .string({
                message: "L’identifiant de la relation utilisateur est requis.",
            })
            .trim()
            .min(1, "L’identifiant de la relation utilisateur est requis."),
        password: z.string().optional(),
        confirmPassword: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        const password = data.password?.trim() ?? "";
        const confirmPassword = data.confirmPassword?.trim() ?? "";

        if (!password && !confirmPassword) return;

        if (!password) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["password"],
                message: "Le nouveau mot de passe est requis.",
            });
            return;
        }

        const passwordCheck = passwordSchema.safeParse(password);
        if (!passwordCheck.success) {
            for (const issue of passwordCheck.error.issues) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["password"],
                    message: issue.message,
                });
            }
        }

        if (!confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: "La confirmation du mot de passe est requise.",
            });
        }

        if (password && confirmPassword && password !== confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: "Les mots de passe ne correspondent pas.",
            });
        }
    });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;