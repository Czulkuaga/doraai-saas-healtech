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
    const fullName = [partner.firstName, partner.lastName].filter(Boolean).join(" ").trim();
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
            status: true,
            notes: true,
            providerProfileId: true,
            orgUnitId: true,
            locationId: true,
            patient: {
                select: {
                    firstName: true,
                    lastName: true,
                    organizationName: true,
                },
            },
            templateVersion: {
                select: {
                    template: {
                        select: {
                            name: true,
                            code: true,
                        },
                    },
                    sections: {
                        orderBy: { order: "asc" },
                        select: {
                            id: true,
                            key: true,
                            title: true,
                            order: true,
                            fields: {
                                orderBy: { order: "asc" },
                                select: {
                                    id: true,
                                    key: true,
                                    label: true,
                                    type: true,
                                    required: true,
                                    order: true,
                                    config: true,
                                    options: {
                                        orderBy: { order: "asc" },
                                        select: {
                                            id: true,
                                            key: true,
                                            label: true,
                                            order: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            values: {
                select: {
                    fieldId: true,
                    valueString: true,
                    valueNumber: true,
                    valueBoolean: true,
                    valueDate: true,
                    valueDateTime: true,
                    valueJson: true,
                    optionId: true,
                    options: {
                        select: {
                            optionId: true,
                        },
                    },
                },
            },
        },
    });

    if (!preventiveCase) return notFound();

    const [providers, orgUnits, locations] = await Promise.all([
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
    ]);

    return (
        <div className="space-y-6">
            <section>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Modifier le cas {preventiveCase.code}
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {preventiveCase.templateVersion.template.name} · Patient:{" "}
                    {getBusinessPartnerName(preventiveCase.patient)}
                </p>
            </section>

            <PreventiveCaseEditForm
                caseData={{
                    id: preventiveCase.id,
                    code: preventiveCase.code,
                    status: preventiveCase.status,
                    notes: preventiveCase.notes,
                    providerProfileId: preventiveCase.providerProfileId,
                    orgUnitId: preventiveCase.orgUnitId,
                    locationId: preventiveCase.locationId,
                    templateName: preventiveCase.templateVersion.template.name,
                    patientName: getBusinessPartnerName(preventiveCase.patient),
                    sections: preventiveCase.templateVersion.sections,
                    values: preventiveCase.values.map((value) => ({
                        fieldId: value.fieldId,
                        valueString: value.valueString,
                        valueNumber: value.valueNumber?.toString() ?? null,
                        valueBoolean: value.valueBoolean,
                        valueDate: value.valueDate,
                        valueDateTime: value.valueDateTime,
                        valueJson: value.valueJson,
                        optionId: value.optionId,
                        optionIds: value.options.map((option) => option.optionId),
                    })),
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
            />
        </div>
    );
}