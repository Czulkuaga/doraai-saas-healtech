import { notFound } from "next/navigation";
import { getPatientProviderAssignmentById } from "@/action/patient-provider-assignment/get-patient-provider-assignment-by-id";
import { PatientProviderAssignmentDetailsCard } from "@/components/private/patient-provider-assignment/patient-provider-assignment-details-card";
import { PatientProviderAssignmentDetailsHeader } from "@/components/private/patient-provider-assignment/patient-provider-assignment-details-header";

export default async function PatientAssignmentDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const item = await getPatientProviderAssignmentById(id);

    if (!item) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <PatientProviderAssignmentDetailsHeader id={item.id} />
            <PatientProviderAssignmentDetailsCard item={item} />
        </div>
    );
}