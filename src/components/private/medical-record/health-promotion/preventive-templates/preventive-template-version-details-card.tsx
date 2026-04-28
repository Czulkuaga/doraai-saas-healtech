import { PreventiveTemplateVersionStatusBadge } from "./preventive-template-version-status-badge";

type PreventiveTemplateVersionDetails = {
    id: string;
    tenantId: string;
    templateId: string;
    version: number;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    rules: unknown | null;
    publishedAt: Date | null;
    createdAt: Date;
    isCurrentlyPublished: boolean;
    template: {
        id: string;
        code: string;
        name: string;
        status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
        isActive: boolean;
        publishedVersionId: string | null;
    };
    totalSections: number;
    totalCases: number;
};

function formatDate(value?: Date | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fr-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
}

function formatRules(value: unknown) {
    if (value == null) return "—";

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return "—";
    }
}

type Props = {
    item: PreventiveTemplateVersionDetails;
};

export function PreventiveTemplateVersionDetailsCard({ item }: Props) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-medium text-cyan-600 dark:text-cyan-300">
                        {item.template.code}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {item.template.name} · v{item.version}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Version clinique du modèle préventif.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <PreventiveTemplateVersionStatusBadge status={item.status} />
                    {item.isCurrentlyPublished ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            Version active
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Version" value={`v${item.version}`} />
                <Field label="Statut" value={item.status} />
                <Field
                    label="Publication active"
                    value={item.isCurrentlyPublished ? "Oui" : "Non"}
                />
                <Field label="Sections" value={String(item.totalSections)} />
                <Field label="Cas liés" value={String(item.totalCases)} />
                <Field label="Publiée le" value={formatDate(item.publishedAt)} />
                <Field label="Créée le" value={formatDate(item.createdAt)} />
            </div>

            <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Règles
                </p>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <pre className="whitespace-pre-wrap wrap-break-word text-sm text-slate-700 dark:text-slate-300">
                        {formatRules(item.rules)}
                    </pre>
                </div>
            </div>
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