"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

export async function getAvailablePathologiesAction() {
  const tenantId = await requireTenantId();

  return prisma.pathology.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      code: true,
      name: true,
      color: true,
      description: true,
    },
  });
}