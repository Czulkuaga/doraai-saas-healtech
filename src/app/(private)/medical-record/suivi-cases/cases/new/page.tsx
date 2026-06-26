import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { CreatePreventiveCaseForm } from "@/components/private/medical-record/health-promotion/cases/create-preventive-case-form";
import { BPRoleType } from "../../../../../../../generated/prisma/enums";

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

export default async function NewPreventiveCasePage() {
  const tenantId = await requireTenantId();

  const [
    patients,
    pathologies,
    providers,
    orgUnits,
    locations,
    serviceTypes,
    specialties,
  ] = await Promise.all([
    prisma.businessPartner.findMany({
      where: {
        tenantId,
        isActive: true,
        roles: {
          some: {
            tenantId,
            role: BPRoleType.PATIENT,
          },
        },
      },
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" },
        { organizationName: "asc" },
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        organizationName: true,
      },
    }),

    prisma.pathology.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),

    prisma.providerProfile.findMany({
      where: {
        partner: {
          tenantId,
        },
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
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
      orderBy: {
        name: "asc",
      },
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
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.serviceType.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        code: "asc",
      },
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
      orderBy: {
        code: "asc",
      },
      select: {
        id: true,
        code: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Nouveau dossier préventif
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Créez un dossier de suivi préventif pour un patient.
        </p>
      </section>

      <CreatePreventiveCaseForm
        patients={patients.map((item) => ({
          id: item.id,
          name: getBusinessPartnerName(item),
        }))}
        pathologies={pathologies.map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code,
        }))}
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