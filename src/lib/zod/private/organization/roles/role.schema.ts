import { z } from "zod";

export const roleFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Le nom du rôle doit contenir au moins 2 caractères.")
        .max(80, "Le nom du rôle ne peut pas dépasser 80 caractères."),
    key: z
        .string()
        .trim()
        .min(2, "La clé doit contenir au moins 2 caractères.")
        .max(80, "La clé ne peut pas dépasser 80 caractères.")
        .regex(/^[a-z0-9._-]+$/i, "La clé contient des caractères non autorisés."),
    isActive: z.boolean().default(true),
    permissionIds: z.array(z.string().min(1)).default([]),
});

export type RoleFormInput = z.infer<typeof roleFormSchema>;

export const roleListQuerySchema = z.object({
    q: z.string().optional().default(""),
    status: z.enum(["all", "active", "inactive"]).optional().default("all"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type RoleListQueryInput = z.infer<typeof roleListQuerySchema>;