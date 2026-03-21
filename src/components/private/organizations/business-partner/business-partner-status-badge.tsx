type Props = {
    isActive: boolean;
};

export function BusinessPartnerStatusBadge({ isActive }: Props) {
    return (
        <span
            className={[
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                isActive
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : "border-slate-500/20 bg-slate-500/10 text-slate-500 dark:text-slate-300",
            ].join(" ")}
        >
            {isActive ? "Actif" : "Inactif"}
        </span>
    );
}