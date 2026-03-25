import Link from "next/link";
import { notFound } from "next/navigation";
import { FiEdit2 } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa6";

import { getPatientByIdAction } from "@/action/patients/get-patient";
import { getPatientProviderAssignmentsByPatientId } from "@/action/patient-provider-assignment/get-patient-provider-assignments-by-patient-id";

import { PatientDetailsCard } from "@/components/private/medical-record/patients/patient-details-card";
import { PatientAssignedProvidersCard } from "@/components/private/medical-record/patients/patient-assigned-providers-card";

import { patientEditPath, patientListPath } from "@/lib/types/patients/patients.routes";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PatientDetailsPage({ params }: Props) {
    const { id } = await params;

    const [item, assignments] = await Promise.all([
        getPatientByIdAction(id),
        getPatientProviderAssignmentsByPatientId(id),
    ]);

    if (!item) notFound();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        Détails du patient
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Consultez les informations principales de ce patient.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link
                        href={patientListPath()}
                        className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        <FaArrowLeft className="h-4 w-4" />
                        Back
                    </Link>

                    <Link
                        href={patientEditPath(item.id)}
                        className="inline-flex items-center gap-2 self-start rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <FiEdit2 className="h-4 w-4" />
                        Modifier
                    </Link>
                </div>
            </div>

            <PatientDetailsCard item={item} />

            <PatientAssignedProvidersCard
                patientId={item.id}
                items={assignments}
            />
        </div>
    );
}