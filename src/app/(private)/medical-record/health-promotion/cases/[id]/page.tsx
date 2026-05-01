import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenantId } from "@/lib/auth/session";
import { PreventiveCaseStatus } from "../../../../../../../generated/prisma/enums";
import Link from "next/link";

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

function formatValue(value: any) {
    if (!value) return "—";

    if (value.valueString) return value.valueString;
    if (value.valueNumber) return String(value.valueNumber);
    if (value.valueBoolean !== null)
        return value.valueBoolean ? "Oui" : "Non";

    if (value.valueDate)
        return new Intl.DateTimeFormat("fr-BE").format(value.valueDate);

    if (value.valueDateTime)
        return new Intl.DateTimeFormat("fr-BE", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(value.valueDateTime);

    if (value.option) return value.option.label;

    if (value.options?.length > 0) {
        return value.options.map((o: any) => o.option.label).join(", ");
    }

    return "—";
}

export default async function PreventiveCasePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const tenantId = await requireTenantId();

    const preventiveCase = await prisma.preventiveCase.findFirst({
        where: {
            id,
            tenantId,
        },
        select: {
            id: true,
            code: true,
            status: true,
            openedAt: true,
            completedAt: true,
            cancelledAt: true,
            notes: true,

            patient: {
                select: {
                    firstName: true,
                    lastName: true,
                    organizationName: true,
                },
            },

            providerProfile: {
                select: {
                    partner: {
                        select: {
                            firstName: true,
                            lastName: true,
                            organizationName: true,
                        },
                    },
                },
            },

            templateVersion: {
                select: {
                    template: {
                        select: {
                            name: true,
                        },
                    },
                    sections: {
                        orderBy: { order: "asc" },
                        select: {
                            id: true,
                            title: true,
                            order: true,
                            fields: {
                                orderBy: { order: "asc" },
                                select: {
                                    id: true,
                                    label: true,
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
                    option: {
                        select: {
                            label: true,
                        },
                    },
                    options: {
                        select: {
                            option: {
                                select: {
                                    label: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!preventiveCase) return notFound();

    const valueMap = new Map(
        preventiveCase.values.map((v) => [v.fieldId, v])
    );

    function statusLabel(status: PreventiveCaseStatus) {
        switch (status) {
            case PreventiveCaseStatus.OPEN:
                return "Ouvert";
            case PreventiveCaseStatus.IN_PROGRESS:
                return "En cours";
            case PreventiveCaseStatus.COMPLETED:
                return "Complété";
            case PreventiveCaseStatus.CANCELLED:
                return "Annulé";
            default:
                return status;
        }
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            Cas {preventiveCase.code}
                        </h1>

                        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                            {statusLabel(preventiveCase.status)}
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {preventiveCase.templateVersion.template.name}
                    </p>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <Link
                        href="/medical-record/health-promotion/cases"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Retour à la liste
                    </Link>

                    <Link
                        href={`/medical-record/health-promotion/cases/${id}/edit`}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                        Modifier
                    </Link>
                </div>
            </section>

            {/* META INFO */}
            <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-3">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Patient
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {getPartnerName(preventiveCase.patient)}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Professionnel
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {preventiveCase.providerProfile
                            ? getPartnerName(preventiveCase.providerProfile.partner)
                            : "—"}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Date d’ouverture
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {new Intl.DateTimeFormat("fr-BE").format(preventiveCase.openedAt)}
                    </p>
                </div>
            </section>

            {/* SECTIONS */}
            {preventiveCase.templateVersion.sections.map((section) => (
                <section
                    key={section.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {section.title}
                    </h2>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {section.fields.map((field) => {
                            const value = valueMap.get(field.id);

                            return (
                                <div key={field.id}>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {field.label}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                                        {formatValue(value)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            {/* NOTES */}
            {preventiveCase.notes && (
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Notes
                    </h2>

                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                        {preventiveCase.notes}
                    </p>
                </section>
            )}
        </div>
    );
}