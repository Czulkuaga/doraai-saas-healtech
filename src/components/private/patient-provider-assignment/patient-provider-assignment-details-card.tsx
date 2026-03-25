import { FiStar } from "react-icons/fi";
import { getPatientProviderAssignmentTypeLabel } from "@/lib/types/patient-provider-assignment/patient-provider-assignment.helpers";
import { PatientProviderAssignmentStatusBadge } from "./patient-provider-assignment-status-badge";

type AssignmentDetails = {
    id: string;
    tenantId: string;
    patientId: string;
    providerProfileId: string;
    assignmentType:
    | "PRIMARY_CARE"
    | "PREVENTIVE_FOLLOWUP"
    | "NURSING"
    | "SPECIALIST_SUPPORT"
    | "OTHER";
    isPrimary: boolean;
    isActive: boolean;
    startDate: Date | null;
    endDate: Date | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    patient: {
        id: string;
        code: string;
        label: string;
        email: string | null;
        phone: string | null;
    };
    provider: {
        id: string;
        partnerId: string;
        code: string;
        label: string;
        email: string | null;
        phone: string | null;
        licenseNumber: string | null;
    };
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
    item: AssignmentDetails;
};

export function PatientProviderAssignmentDetailsCard({ item }: Props) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-medium text-cyan-600 dark:text-cyan-300">
                        {item.patient.code} → {item.provider.code}
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {item.patient.label}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Professionnel assigné: {item.provider.label}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <PatientProviderAssignmentStatusBadge isActive={item.isActive} />

                    {item.isPrimary ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                            <FiStar className="h-3 w-3" />
                            Principal
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Patient" value={item.patient.label} />
                <Field label="Code patient" value={item.patient.code} />
                <Field label="E-mail patient" value={item.patient.email || "—"} />
                <Field label="Téléphone patient" value={item.patient.phone || "—"} />

                <Field label="Professionnel" value={item.provider.label} />
                <Field label="Code professionnel" value={item.provider.code} />
                <Field label="E-mail professionnel" value={item.provider.email || "—"} />
                <Field label="Téléphone professionnel" value={item.provider.phone || "—"} />
                <Field label="Numéro de licence" value={item.provider.licenseNumber || "—"} />

                <Field
                    label="Type d’affectation"
                    value={getPatientProviderAssignmentTypeLabel(item.assignmentType)}
                />
                <Field label="Date de début" value={formatDate(item.startDate)} />
                <Field label="Date de fin" value={formatDate(item.endDate)} />
                <Field label="Créé le" value={formatDate(item.createdAt)} />
                <Field label="Mis à jour le" value={formatDate(item.updatedAt)} />
            </div>

            <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Notes
                </p>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                        {item.notes || "—"}
                    </p>
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