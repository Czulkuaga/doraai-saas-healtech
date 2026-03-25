import {
    getProfessionalDisplayName,
    getProfessionalTypeLabel,
} from "@/lib/types/professionals/professionals.helpers";
import type { ProfessionalDetails } from "@/lib/types/professionals/professionals.types";
import { ProfessionalStatusBadge } from "./professional-status-badge";

function formatDate(value?: Date | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fr-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
}

type Props = {
    item: ProfessionalDetails;
};

export function ProfessionalDetailsCard({ item }: Props) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-medium text-cyan-600 dark:text-cyan-300">
                        {item.code}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {getProfessionalDisplayName(item)}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {getProfessionalTypeLabel(item.type)}
                    </p>
                </div>

                <ProfessionalStatusBadge isActive={item.isActive} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Prénom" value={item.firstName || "—"} />
                <Field label="Nom" value={item.lastName || "—"} />
                <Field label="Organisation" value={item.organizationName || "—"} />
                <Field label="E-mail" value={item.email || "—"} />
                <Field label="Téléphone" value={item.phone || "—"} />
                <Field label="Date de naissance" value={formatDate(item.birthDate)} />
                <Field label="Créé le" value={formatDate(item.createdAt)} />
                <Field label="Mis à jour le" value={formatDate(item.updatedAt)} />
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Rôle système
                </p>
                <p className="mt-1 text-sm text-cyan-700 dark:text-cyan-300">
                    Professionnel de santé
                </p>
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