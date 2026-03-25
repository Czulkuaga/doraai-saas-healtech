import { notFound } from "next/navigation";
import { getPatientProviderAssignmentById } from "@/action/patient-provider-assignment/get-patient-provider-assignment-by-id";
import { getPatientProviderAssignmentFormOptions } from "@/action/patient-provider-assignment/get-patient-provider-assignment-form-options";
import { PatientProviderAssignmentForm } from "@/components/private/patient-provider-assignment/patient-provider-assignment-form";

export default async function EditPatientAssignmentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [item, options] = await Promise.all([
        getPatientProviderAssignmentById(id),
        getPatientProviderAssignmentFormOptions(),
    ]);

    if (!item) {
        notFound();
    }

    return (
        <PatientProviderAssignmentForm
            mode="edit"
            assignmentId={item.id}
            initialValues={{
                patientId: item.patientId,
                providerProfileId: item.providerProfileId,
                assignmentType: item.assignmentType,
                isPrimary: item.isPrimary,
                isActive: item.isActive,
                startDate: item.startDate
                    ? item.startDate.toISOString().slice(0, 10)
                    : "",
                endDate: item.endDate
                    ? item.endDate.toISOString().slice(0, 10)
                    : "",
                notes: item.notes ?? "",
            }}
            patientOptions={options.patients}
            providerOptions={options.providers}
        />
    );
}