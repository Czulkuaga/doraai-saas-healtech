import { getPatientProviderAssignmentTypeLabel } from "@/lib/types/patient-provider-assignment/patient-provider-assignment.helpers";
import type { PatientProviderAssignmentTypeValue } from "@/lib/types/patient-provider-assignment/patient-provider-assignment.types";

type Props = {
    type: PatientProviderAssignmentTypeValue;
};

export function PatientProviderAssignmentTypeBadge({ type }: Props) {
    return (
        <span className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[11px] font-medium text-cyan-700 dark:text-cyan-300">
            {getPatientProviderAssignmentTypeLabel(type)}
        </span>
    );
}