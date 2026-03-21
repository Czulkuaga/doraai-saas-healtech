import { getBPRoleLabel } from "@/lib/types/business-partner/business-partner.helpers";
import type { BPRoleType } from "../../../../../generated/prisma/enums";

type Props = {
    roles: BPRoleType[];
    max?: number;
};

export function BusinessPartnerRoleBadges({ roles, max = 2 }: Props) {
    if (!roles.length) {
        return (
            <span className="text-xs text-slate-500 dark:text-slate-400">
                —
            </span>
        );
    }

    const visible = roles.slice(0, max);
    const remaining = roles.length - visible.length;

    return (
        <div className="flex flex-wrap gap-1.5">
            {visible.map((role) => (
                <span
                    key={role}
                    className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[11px] font-medium text-cyan-700 dark:text-cyan-300"
                >
                    {getBPRoleLabel(role)}
                </span>
            ))}

            {remaining > 0 ? (
                <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                    +{remaining}
                </span>
            ) : null}
        </div>
    );
}