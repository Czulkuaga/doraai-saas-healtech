import { getPreventiveTemplateStatusLabel } from "@/lib/types/health-promotion/preventive-template/preventive-template.helpers";
import type { PreventiveTemplateStatusValue } from "@/lib/types/health-promotion/preventive-template/preventive-template.types";

type Props = {
    status: PreventiveTemplateStatusValue;
};

export function PreventiveTemplateStatusBadge({ status }: Props) {
    const className =
        status === "PUBLISHED"
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
            : status === "ARCHIVED"
                ? "border-slate-500/20 bg-slate-500/10 text-slate-500 dark:text-slate-300"
                : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";

    return (
        <span
            className={[
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                className,
            ].join(" ")}
        >
            {getPreventiveTemplateStatusLabel(status)}
        </span>
    );
}