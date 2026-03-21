import {
    getBusinessPartnerDisplayName,
    getPartnerTypeLabel,
} from "@/lib/types/business-partner/business-partner.helpers";
import type { BusinessPartnerDetails } from "@/lib/types/business-partner/business-partner.types";
import { BusinessPartnerRoleBadges } from "./business-partner-role-badges";
import { BusinessPartnerStatusBadge } from "./business-partner-status-badge";

function formatDate(value?: Date | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fr-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
}

type Props = {
    item: BusinessPartnerDetails;
};

export function BusinessPartnerDetailsCard({ item }: Props) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-medium text-cyan-600 dark:text-cyan-300">
                        {item.code}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {getBusinessPartnerDisplayName(item)}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {getPartnerTypeLabel(item.type)}
                    </p>
                </div>

                <BusinessPartnerStatusBadge isActive={item.isActive} />
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

            <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Rôles
                </p>
                <BusinessPartnerRoleBadges roles={item.roles} max={99} />
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