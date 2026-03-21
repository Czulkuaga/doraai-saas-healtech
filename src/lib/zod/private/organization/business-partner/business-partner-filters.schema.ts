import { z } from "zod";
import { PartnerType } from "../../../../../../generated/prisma/enums";

export const businessPartnerFiltersSchema = z.object({
    q: z.string().optional().default(""),
    type: z.union([z.literal("ALL"), z.nativeEnum(PartnerType)]).optional().default("ALL"),
    status: z.union([z.literal("ALL"), z.literal("ACTIVE"), z.literal("INACTIVE")]).optional().default("ALL"),
    sort: z
        .union([
            z.literal("recent"),
            z.literal("oldest"),
            z.literal("name_asc"),
            z.literal("name_desc"),
            z.literal("code_asc"),
            z.literal("code_desc"),
        ])
        .optional()
        .default("recent"),
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(5).max(50).optional().default(5),
});

export type BusinessPartnerFiltersInput = z.infer<typeof businessPartnerFiltersSchema>;