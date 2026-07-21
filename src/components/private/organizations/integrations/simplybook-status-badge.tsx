import type { SimplyBookConnectionSummary } from "@/lib/integrations/simplybook/simplybook.types";

type Status = SimplyBookConnectionSummary["status"];

type Props = {
    status: Status;
};

const statusConfiguration: Record<
    Status,
    {
        label: string;
        className: string;
    }
> = {
    NOT_CONFIGURED: {
        label: "Non configuré",
        className:
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },

    CONNECTING: {
        label: "Connexion",
        className:
            "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },

    CONNECTED: {
        label: "Connecté",
        className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },

    TWO_FACTOR_REQUIRED: {
        label: "Validation requise",
        className:
            "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },

    EXPIRED: {
        label: "Expiré",
        className:
            "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    },

    ERROR: {
        label: "Erreur",
        className:
            "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    },

    DISABLED: {
        label: "Désactivé",
        className:
            "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
};

export function SimplyBookStatusBadge({
    status,
}: Props) {
    const configuration =
        statusConfiguration[status];

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${configuration.className}`}
        >
            {configuration.label}
        </span>
    );
}