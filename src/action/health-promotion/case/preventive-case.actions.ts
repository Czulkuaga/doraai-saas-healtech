"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { nextNumberRangeCode } from "@/lib/number-range";

import {
  NumberRangeObject,
  PreventiveCaseStatus,
  PreventiveTimelineEventType,
} from "../../../../generated/prisma/enums";

import {
  createPreventiveCaseSchema,
  preventiveCaseIdSchema,
  updatePreventiveCaseMetaSchema,
} from "@/lib/zod/private/health-promotion/case/preventive-case.schema";

export async function createPreventiveCaseAction(rawInput: unknown) {
  const tenantId = await requireTenantId();
  const parsed = createPreventiveCaseSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Veuillez vérifier les champs du formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  const patient = await prisma.businessPartner.findFirst({
    where: {
      id: input.patientId,
      tenantId,
    },
    select: { id: true },
  });

  if (!patient) {
    return {
      ok: false as const,
      message: "Patient introuvable.",
    };
  }

  const created = await prisma.$transaction(async (tx) => {
    const code = await nextNumberRangeCode({
      tenantId,
      object: NumberRangeObject.PREVENTIVE_CASE,
      defaultPrefix: "PC",
      tx,
    });

    const preventiveCase = await tx.preventiveCase.create({
      data: {
        tenantId,
        code,
        title: input.title || null,
        patientId: input.patientId,
        pathologyId: input.pathologyId || null,
        providerProfileId: input.providerProfileId || null,
        orgUnitId: input.orgUnitId || null,
        locationId: input.locationId || null,
        serviceTypeId: input.serviceTypeId || null,
        specialtyId: input.specialtyId || null,
        status: input.status ?? PreventiveCaseStatus.OPEN,
        riskLevel: input.riskLevel || null,
        followUpFrequency: input.followUpFrequency ?? undefined,
        followUpIntervalDays: input.followUpIntervalDays ?? null,
        nextFollowUpAt: input.nextFollowUpAt ?? null,
        nextAutomaticFollowUpAt: input.nextAutomaticFollowUpAt ?? null,
        notes: input.notes || null,
      },
      select: {
        id: true,
        code: true,
        patientId: true,
        title: true,
      },
    });

    await tx.preventiveTimelineEvent.create({
      data: {
        tenantId,
        patientId: input.patientId,
        preventiveCaseId: preventiveCase.id,
        type: PreventiveTimelineEventType.CASE_CREATED,
        title: "Dossier préventif créé",
        description: preventiveCase.title || preventiveCase.code,
        occurredAt: new Date(),
      },
    });

    return preventiveCase;
  });

  revalidatePath("/medical-record/health-promotion/cases");
  revalidatePath(`/medical-record/patients/${created.patientId}`);

  return {
    ok: true as const,
    message: "Dossier préventif créé correctement.",
    data: created,
  };
}

export async function updatePreventiveCaseMetaAction(rawInput: unknown) {
  const tenantId = await requireTenantId();
  const parsed = updatePreventiveCaseMetaSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Veuillez vérifier les champs du formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  const preventiveCase = await prisma.preventiveCase.findFirst({
    where: {
      id: input.id,
      tenantId,
    },
    select: {
      id: true,
      patientId: true,
      status: true,
    },
  });

  if (!preventiveCase) {
    return {
      ok: false as const,
      message: "Dossier préventif introuvable.",
    };
  }

  if (
    preventiveCase.status === PreventiveCaseStatus.COMPLETED ||
    preventiveCase.status === PreventiveCaseStatus.CANCELLED
  ) {
    return {
      ok: false as const,
      message: "Ce dossier ne peut plus être modifié.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.preventiveCase.update({
      where: { id: preventiveCase.id },
      data: {
        title: input.title || null,
        status: input.status,
        pathologyId: input.pathologyId || null,
        providerProfileId: input.providerProfileId || null,
        orgUnitId: input.orgUnitId || null,
        locationId: input.locationId || null,
        serviceTypeId: input.serviceTypeId || null,
        specialtyId: input.specialtyId || null,
        riskLevel: input.riskLevel || null,
        followUpFrequency: input.followUpFrequency ?? undefined,
        followUpIntervalDays: input.followUpIntervalDays ?? null,
        nextFollowUpAt: input.nextFollowUpAt ?? null,
        nextAutomaticFollowUpAt: input.nextAutomaticFollowUpAt ?? null,
        notes: input.notes || null,
      },
    });

    await tx.preventiveTimelineEvent.create({
      data: {
        tenantId,
        patientId: preventiveCase.patientId,
        preventiveCaseId: preventiveCase.id,
        type: PreventiveTimelineEventType.CASE_UPDATED,
        title: "Dossier préventif mis à jour",
        description: input.title || null,
        occurredAt: new Date(),
      },
    });
  });

  revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}`);
  revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}/edit`);
  revalidatePath(`/medical-record/patients/${preventiveCase.patientId}`);
  revalidatePath("/medical-record/health-promotion/cases");

  return {
    ok: true as const,
    message: "Informations du dossier enregistrées.",
  };
}

export async function completePreventiveCaseAction(rawInput: unknown) {
  const tenantId = await requireTenantId();
  const parsed = preventiveCaseIdSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Identifiant invalide.",
    };
  }

  const preventiveCase = await prisma.preventiveCase.findFirst({
    where: {
      id: parsed.data.id,
      tenantId,
    },
    select: {
      id: true,
      patientId: true,
      status: true,
    },
  });

  if (!preventiveCase) {
    return {
      ok: false as const,
      message: "Dossier préventif introuvable.",
    };
  }

  if (preventiveCase.status === PreventiveCaseStatus.CANCELLED) {
    return {
      ok: false as const,
      message: "Un dossier annulé ne peut pas être terminé.",
    };
  }

  if (preventiveCase.status === PreventiveCaseStatus.COMPLETED) {
    return {
      ok: false as const,
      message: "Ce dossier est déjà terminé.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.preventiveCase.update({
      where: { id: preventiveCase.id },
      data: {
        status: PreventiveCaseStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    await tx.preventiveTimelineEvent.create({
      data: {
        tenantId,
        patientId: preventiveCase.patientId,
        preventiveCaseId: preventiveCase.id,
        type: PreventiveTimelineEventType.CASE_COMPLETED,
        title: "Dossier préventif terminé",
        occurredAt: new Date(),
      },
    });
  });

  revalidatePath("/medical-record/health-promotion/cases");
  revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}`);
  revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}/edit`);
  revalidatePath(`/medical-record/patients/${preventiveCase.patientId}`);

  return {
    ok: true as const,
    message: "Dossier préventif terminé correctement.",
  };
}

export async function cancelPreventiveCaseAction(rawInput: unknown) {
  const tenantId = await requireTenantId();
  const parsed = preventiveCaseIdSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Identifiant invalide.",
    };
  }

  const preventiveCase = await prisma.preventiveCase.findFirst({
    where: {
      id: parsed.data.id,
      tenantId,
    },
    select: {
      id: true,
      patientId: true,
      status: true,
    },
  });

  if (!preventiveCase) {
    return {
      ok: false as const,
      message: "Dossier préventif introuvable.",
    };
  }

  if (preventiveCase.status === PreventiveCaseStatus.COMPLETED) {
    return {
      ok: false as const,
      message: "Un dossier terminé ne peut pas être annulé.",
    };
  }

  if (preventiveCase.status === PreventiveCaseStatus.CANCELLED) {
    return {
      ok: false as const,
      message: "Ce dossier est déjà annulé.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.preventiveCase.update({
      where: { id: preventiveCase.id },
      data: {
        status: PreventiveCaseStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await tx.preventiveTimelineEvent.create({
      data: {
        tenantId,
        patientId: preventiveCase.patientId,
        preventiveCaseId: preventiveCase.id,
        type: PreventiveTimelineEventType.CASE_CANCELLED,
        title: "Dossier préventif annulé",
        occurredAt: new Date(),
      },
    });
  });

  revalidatePath("/medical-record/health-promotion/cases");
  revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}`);
  revalidatePath(`/medical-record/health-promotion/cases/${preventiveCase.id}/edit`);
  revalidatePath(`/medical-record/patients/${preventiveCase.patientId}`);

  return {
    ok: true as const,
    message: "Dossier préventif annulé correctement.",
  };
}

export async function deletePreventiveCaseAction(rawInput: unknown) {
  const tenantId = await requireTenantId();
  const parsed = preventiveCaseIdSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Identifiant invalide.",
    };
  }

  const preventiveCase = await prisma.preventiveCase.findFirst({
    where: {
      id: parsed.data.id,
      tenantId,
    },
    select: {
      id: true,
      patientId: true,
      status: true,
      _count: {
        select: {
          followUps: true,
          timelineEvents: true,
        },
      },
    },
  });

  if (!preventiveCase) {
    return {
      ok: false as const,
      message: "Dossier préventif introuvable.",
    };
  }

  if (preventiveCase.status !== PreventiveCaseStatus.OPEN) {
    return {
      ok: false as const,
      message: "Seuls les dossiers ouverts peuvent être supprimés.",
    };
  }

  if (preventiveCase._count.followUps > 0) {
    return {
      ok: false as const,
      message:
        "Ce dossier contient déjà des suivis. Il doit être annulé au lieu d’être supprimé.",
    };
  }

  await prisma.preventiveCase.delete({
    where: { id: preventiveCase.id },
  });

  revalidatePath("/medical-record/health-promotion/cases");
  revalidatePath(`/medical-record/patients/${preventiveCase.patientId}`);

  return {
    ok: true as const,
    message: "Dossier préventif supprimé correctement.",
  };
}