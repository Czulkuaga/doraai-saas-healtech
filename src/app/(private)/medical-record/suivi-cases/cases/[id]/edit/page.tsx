// src/app/(private)/medical-record/health-promotion/cases/[id]/edit/page.tsx

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { PreventiveCaseEditForm } from "@/components/private/medical-record/health-promotion/cases/preventive-case-edit-form";

function getBusinessPartnerName(partner: {
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

export default async function EditPreventiveCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenantId = await requireTenantId();

  const preventiveCase = await prisma.preventiveCase.findFirst({
    where: { id, tenantId },
    select: {
      id: true,
      code: true,
      title: true,
      status: true,
      notes: true,

      riskLevel: true,
      followUpFrequency: true,
      followUpIntervalDays: true,
      nextFollowUpAt: true,
      nextAutomaticFollowUpAt: true,

      pathologyId: true,
      providerProfileId: true,
      orgUnitId: true,
      locationId: true,
      serviceTypeId: true,
      specialtyId: true,

      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          organizationName: true,
        },
      },

      pathology: {
        select: {
          name: true,
          code: true,
        },
      },
    },
  });

  if (!preventiveCase) return notFound();

  const [providers, orgUnits, locations, pathologies, serviceTypes, specialties] =
    await Promise.all([
      prisma.providerProfile.findMany({
        where: {
          partner: { tenantId },
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
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
      }),

      prisma.orgUnit.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      }),

      prisma.location.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
        },
      }),

      prisma.pathology.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          code: true,
        },
      }),

      prisma.serviceType.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: { code: "asc" },
        select: {
          id: true,
          code: true,
        },
      }),

      prisma.specialty.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: { code: "asc" },
        select: {
          id: true,
          code: true,
        },
      }),
    ]);

  const caseTitle =
    preventiveCase.title ||
    preventiveCase.pathology?.name ||
    "Dossier préventif";

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Modifier le dossier {preventiveCase.code}
        </h1>

        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {caseTitle} · Patient: {getBusinessPartnerName(preventiveCase.patient)}
        </p>
      </section>

      <PreventiveCaseEditForm
        caseData={{
          id: preventiveCase.id,
          code: preventiveCase.code,
          title: preventiveCase.title,
          status: preventiveCase.status,
          notes: preventiveCase.notes,

          riskLevel: preventiveCase.riskLevel,
          followUpFrequency: preventiveCase.followUpFrequency,
          followUpIntervalDays: preventiveCase.followUpIntervalDays,
          nextFollowUpAt: preventiveCase.nextFollowUpAt,
          nextAutomaticFollowUpAt: preventiveCase.nextAutomaticFollowUpAt,

          pathologyId: preventiveCase.pathologyId,
          providerProfileId: preventiveCase.providerProfileId,
          orgUnitId: preventiveCase.orgUnitId,
          locationId: preventiveCase.locationId,
          serviceTypeId: preventiveCase.serviceTypeId,
          specialtyId: preventiveCase.specialtyId,

          patientName: getBusinessPartnerName(preventiveCase.patient),
        }}
        providers={providers.map((item) => ({
          id: item.id,
          name: getBusinessPartnerName(item.partner),
        }))}
        orgUnits={orgUnits.map((item) => ({
          id: item.id,
          name: item.name,
        }))}
        locations={locations.map((item) => ({
          id: item.id,
          name: item.name,
        }))}
        pathologies={pathologies.map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code,
        }))}
        serviceTypes={serviceTypes.map((item) => ({
          id: item.id,
          name: item.code,
        }))}
        specialties={specialties.map((item) => ({
          id: item.id,
          name: item.code,
        }))}
      />
    </div>
  );
}