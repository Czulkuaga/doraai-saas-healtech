"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { BPRoleType } from "../../../generated/prisma/enums";

export async function updatePatientPathologiesAction(input: {
  patientId: string;
  pathologyIds: string[];
}) {
  const tenantId = await requireTenantId();

  const patient = await prisma.businessPartner.findFirst({
    where: {
      id: input.patientId,
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

  if (!patient) {
    throw new Error("Patient introuvable.");
  }

  const uniquePathologyIds = [...new Set(input.pathologyIds)];

  const validPathologies = await prisma.pathology.findMany({
    where: {
      tenantId,
      id: {
        in: uniquePathologyIds,
      },
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  const validIds = validPathologies.map((item) => item.id);

  await prisma.$transaction(async (tx) => {
    await tx.patientPathology.updateMany({
      where: {
        tenantId,
        patientId: input.patientId,
        pathologyId: {
          notIn: validIds,
        },
      },
      data: {
        isActive: false,
        resolvedAt: new Date(),
      },
    });

    for (const pathologyId of validIds) {
      await tx.patientPathology.upsert({
        where: {
          tenantId_patientId_pathologyId: {
            tenantId,
            patientId: input.patientId,
            pathologyId,
          },
        },
        update: {
          isActive: true,
          resolvedAt: null,
        },
        create: {
          tenantId,
          patientId: input.patientId,
          pathologyId,
          isActive: true,
        },
      });
    }
  });

  revalidatePath(`/medical-record/patients/${input.patientId}`);

  return { ok: true };
}