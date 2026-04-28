import { PreventiveTemplateStatusBadge } from "./preventive-template-status-badge";
import { PreventiveTemplateActiveBadge } from "./preventive-template-active-badge";

type PreventiveTemplateDetails = {
    id: string;
    code: string;
    name: string;
    serviceTypeId: string | null;
    specialtyId: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    serviceTypeName: string | null;
    specialtyName: string | null;
    publishedVersionId: string | null;
    publishedVersionNumber: number | null;
    versions: Array<{
        id: string;
        version: number;
        status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
        publishedAt: Date | null;
        createdAt: Date;
    }>;
};

function formatDate(value?: Date | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fr-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
}

type Props = {
    item: PreventiveTemplateDetails;
};

export function PreventiveTemplateDetailsCard({ item }: Props) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-medium text-cyan-600 dark:text-cyan-300">
                        {item.code}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Modèle préventif principal du module santé.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <PreventiveTemplateStatusBadge status={item.status} />
                    <PreventiveTemplateActiveBadge isActive={item.isActive} />
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Code" value={item.code} />
                <Field label="Nom" value={item.name} />
                <Field label="Type de service" value={item.serviceTypeName || "—"} />
                <Field label="Spécialité" value={item.specialtyName || "—"} />
                <Field
                    label="Version publiée"
                    value={
                        item.publishedVersionNumber
                            ? `v${item.publishedVersionNumber}`
                            : "Aucune"
                    }
                />
                <Field label="Versions totales" value={String(item.versions.length)} />
                <Field label="Créé le" value={formatDate(item.createdAt)} />
                <Field label="Mis à jour le" value={formatDate(item.updatedAt)} />
            </div>

            {/* <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Description
                </p>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                        {item.description || "—"}
                    </p>
                </div>
            </div> */}
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {value}
            </p>
        </div>
    );
}