// src/lib/auth/audit.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "./session";

export async function audit(params: {
    tenantId: string;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    success: boolean;
    message?: string | null;
    method?: string | null;
    path?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    metadata?: any;
}) {
    const ctx = await getAuthContext();

    await prisma.auditLog.create({
        data: {
            tenantId: params.tenantId,
            actorUserId: ctx?.userId ?? null,
            actorMembershipId: ctx?.membershipId ?? null,
            action: params.action,
            resourceType: params.resourceType,
            resourceId: params.resourceId ?? null,
            success: params.success,
            message: params.message ?? null,
            method: params.method ?? null,
            path: params.path ?? null,
            ip: params.ip ?? null,
            userAgent: params.userAgent ?? null,
            metadata: params.metadata ?? null,
        },
        select: { id: true },
    });
}