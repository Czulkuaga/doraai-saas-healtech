import { notFound } from "next/navigation";

import { getPatientByIdAction } from "@/action/patients/get-patient";
import { getPatientProviderAssignmentsByPatientId } from "@/action/patient-provider-assignment/get-patient-provider-assignments-by-patient-id";
import { getPatientPreventiveCasesAction } from "@/action/health-promotion/case/get-patient-preventive-cases";

import { PatientDetailsCard } from "@/components/private/medical-record/patients/patient-details-card";
import { PatientAssignedProvidersCard } from "@/components/private/medical-record/patients/patient-assigned-providers-card";

// import { patientEditPath, patientListPath } from "@/lib/types/patients/patients.routes";

import { PatientClinicalHeader } from "@/components/private/medical-record/patients/patient-clinical-header";
import { PatientClinicalTimeline } from "@/components/private/medical-record/patients/patient-clinical-timeline";
import { PatientClinicalSummaryGrid } from "@/components/private/medical-record/patients/patient-clinical-summary-grid";
import { PatientQuickActionsBar } from "@/components/private/medical-record/patients/patient-quick-actions-bar";
import { PatientPreventiveCasesCard } from "@/components/private/medical-record/patients/patient-preventive-cases-card";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PatientDetailsPage({ params }: Props) {
    const { id } = await params;

    const [item, assignments, preventiveCases] = await Promise.all([
        getPatientByIdAction(id),
        getPatientProviderAssignmentsByPatientId(id),
        getPatientPreventiveCasesAction(id),
    ]);

    if (!item) notFound();

    return (
        <div className="space-y-6">

            <PatientClinicalHeader
                patient={item}
                assignments={assignments.map((a) => ({
                    providerName: a.provider
                        ? a.provider.label
                        : null,
                    isPrimary: a.isPrimary,
                    isActive: a.isActive,
                }))}
            />

            <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
                <PatientClinicalTimeline items={preventiveCases.slice(0, 6)} />

                <div className="space-y-6">
                    <PatientDetailsCard item={item} />

                    <PatientAssignedProvidersCard
                        patientId={item.id}
                        items={assignments}
                    />

                    {/* <PatientClinicalSummaryGrid
                        preventiveCasesCount={preventiveCases.length}
                        activeProvidersCount={assignments.filter((a) => a.isActive).length}
                    /> */}

                    <PatientPreventiveCasesCard items={preventiveCases} />
                </div>
            </div>

            <PatientQuickActionsBar patientId={item.id} />

        </div>
    );
}