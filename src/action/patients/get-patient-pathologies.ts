"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { BPRoleType } from "../../../generated/prisma/enums";

export async function getPatientPathologiesAction(patientId: string) {
  const tenantId = await requireTenantId();

  const patient = await prisma.businessPartner.findFirst({
    where: {
      id: patientId,
      tenantId,
      roles: {
        some: {
          tenantId,
          role: BPRoleType.PATIENT,
        },
      },
    },
    select: { id: true },
  });

  if (!patient) return [];

  const rows = await prisma.patientPathology.findMany({
    where: {
      tenantId,
      patientId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      notes: true,
      diagnosedAt: true,
      pathology: {
        select: {
          id: true,
          code: true,
          name: true,
          color: true,
          description: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.pathology.id,
    patientPathologyId: row.id,
    code: row.pathology.code,
    name: row.pathology.name,
    color: row.pathology.color,
    description: row.pathology.description,
    notes: row.notes,
    diagnosedAt: row.diagnosedAt,
  }));
}