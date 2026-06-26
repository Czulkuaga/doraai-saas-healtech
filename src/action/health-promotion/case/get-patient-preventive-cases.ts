"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";

function getPartnerName(partner: {
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
}) {
  const fullName = [partner.firstName, partner.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || partner.organizationName || "—";
}

export async function getPatientPreventiveCasesAction(patientId: string) {
  const tenantId = await requireTenantId();

  const items = await prisma.preventiveCase.findMany({
    where: {
      tenantId,
      patientId,
    },
    orderBy: {
      openedAt: "desc",
    },
    select: {
      id: true,
      code: true,
      title: true,
      status: true,
      riskLevel: true,
      followUpFrequency: true,
      followUpIntervalDays: true,
      openedAt: true,
      completedAt: true,
      cancelledAt: true,
      lastFollowUpAt: true,
      nextFollowUpAt: true,
      nextAutomaticFollowUpAt: true,
      notes: true,

      pathology: {
        select: {
          id: true,
          code: true,
          name: true,
          color: true,
        },
      },

      providerProfile: {
        select: {
          id: true,
          partner: {
            select: {
              firstName: true,
              lastName: true,
              organizationName: true,
            },
          },
        },
      },

      _count: {
        select: {
          followUps: true,
          timelineEvents: true,
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    code: item.code,
    title: item.title,
    status: item.status,
    riskLevel: item.riskLevel,
    followUpFrequency: item.followUpFrequency,
    followUpIntervalDays: item.followUpIntervalDays,
    openedAt: item.openedAt,
    completedAt: item.completedAt,
    cancelledAt: item.cancelledAt,
    lastFollowUpAt: item.lastFollowUpAt,
    nextFollowUpAt: item.nextFollowUpAt,
    nextAutomaticFollowUpAt: item.nextAutomaticFollowUpAt,
    notes: item.notes,

    pathology: item.pathology
      ? {
          id: item.pathology.id,
          code: item.pathology.code,
          name: item.pathology.name,
          color: item.pathology.color,
        }
      : null,

    pathologyName: item.pathology?.name ?? null,
    pathologyCode: item.pathology?.code ?? null,

    providerProfileId: item.providerProfile?.id ?? null,
    providerName: item.providerProfile
      ? getPartnerName(item.providerProfile.partner)
      : null,

    followUpsCount: item._count.followUps,
    timelineEventsCount: item._count.timelineEvents,
  }));
}