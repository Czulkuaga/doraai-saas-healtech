type Props = {
    isActive: boolean;
};

export default function RoleStatusBadge({ isActive }: Props) {
    return (
        <span
            className={
                isActive
                    ? "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                    : "inline-flex rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
            }
        >
            {isActive ? "Actif" : "Inactif"}
        </span>
    );
}