import { notFound } from "next/navigation";

import { getPatientByIdAction } from "@/action/patients/get-patient";
import { getPatientProviderAssignmentsByPatientId } from "@/action/patient-provider-assignment/get-patient-provider-assignments-by-patient-id";
import { getPatientPreventiveCasesAction } from "@/action/health-promotion/case/get-patient-preventive-cases";

import { PatientDetailsCard } from "@/components/private/medical-record/patients/patient-details-card";
import { PatientAssignedProvidersCard } from "@/components/private/medical-record/patients/patient-assigned-providers-card";

import { PatientClinicalHeader } from "@/components/private/medical-record/patients/patient-clinical-header";
import { PatientClinicalTimeline } from "@/components/private/medical-record/patients/patient-clinical-timeline";
import { PatientQuickActionsBar } from "@/components/private/medical-record/patients/patient-quick-actions-bar";
import { PatientPreventiveCasesCard } from "@/components/private/medical-record/patients/patient-preventive-cases-card";

import { getPatientPathologiesAction } from "@/action/patients/get-patient-pathologies";
import { getAvailablePathologiesAction } from "@/action/patients/get-available-pathologies";

import { getSimplyBookPatientLinkAction } from "@/action/integrations/simplybook/get-simplybook-patient-link.action";
import { PatientSimplyBookSyncCard } from "@/components/private/medical-record/patients/patient-simplybook-sync-card";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PatientDetailsPage({
    params,
}: Props) {
    const { id } = await params;

    const [
        item,
        assignments,
        preventiveCases,
        pathologies,
        availablePathologies,
        simplyBookLinkResult,
    ] = await Promise.all([
        getPatientByIdAction(id),
        getPatientProviderAssignmentsByPatientId(id),
        getPatientPreventiveCasesAction(id),
        getPatientPathologiesAction(id),
        getAvailablePathologiesAction(),

        // Solo consulta nuestra BD.
        // No hace llamadas a SimplyBook todavía.
        getSimplyBookPatientLinkAction(id),
    ]);

    if (!item) {
        notFound();
    }

    const simplyBookLink =
        simplyBookLinkResult.success
            ? simplyBookLinkResult.link
            : {
                status: "NOT_LINKED" as const,
                externalId: null,
                lastMatchedAt: null,
            };

    return (
        <div className="w-full max-w-full space-y-6 overflow-x-hidden pb-24">
            <PatientClinicalHeader
                patient={item}
                pathologies={pathologies}
                availablePathologies={
                    availablePathologies
                }
                assignments={assignments.map((a) => ({
                    providerName: a.provider
                        ? a.provider.label
                        : null,
                    isPrimary: a.isPrimary,
                    isActive: a.isActive,
                }))}
            />

            <div className="grid w-full max-w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <div className="min-w-0">
                    <PatientClinicalTimeline
                        items={preventiveCases.slice(
                            0,
                            6
                        )}
                    />
                </div>

                <div className="min-w-0 space-y-6">
                    {/* Integración SimplyBook */}
                    <PatientSimplyBookSyncCard
                        partnerId={item.id}
                        initialStatus={
                            simplyBookLink.status
                        }
                        externalId={
                            simplyBookLink.externalId
                        }
                        lastMatchedAt={
                            simplyBookLink.lastMatchedAt
                        }
                    />

                    <PatientDetailsCard item={item} />

                    <PatientAssignedProvidersCard
                        patientId={item.id}
                        items={assignments}
                    />

                    <PatientPreventiveCasesCard
                        items={preventiveCases}
                    />
                </div>
            </div>

            <PatientQuickActionsBar
                patientId={item.id}
            />
        </div>
    );
}