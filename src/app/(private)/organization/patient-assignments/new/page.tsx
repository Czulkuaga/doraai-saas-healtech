import { getPatientProviderAssignmentFormOptions } from "@/action/patient-provider-assignment/get-patient-provider-assignment-form-options";
import { PatientProviderAssignmentForm } from "@/components/private/patient-provider-assignment/patient-provider-assignment-form";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingle(value: string | string[] | undefined) {
    return typeof value === "string" ? value : undefined;
}

export default async function NewPatientAssignmentPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const [options, sp] = await Promise.all([
        getPatientProviderAssignmentFormOptions(),
        searchParams,
    ]);

    const patientId = getSingle(sp.patientId);

    return (
        <PatientProviderAssignmentForm
            mode="create"
            initialValues={{
                patientId: patientId ?? "",
                providerProfileId: "",
                assignmentType: "PREVENTIVE_FOLLOWUP",
                isPrimary: false,
                isActive: true,
                startDate: "",
                endDate: "",
                notes: "",
            }}
            patientOptions={options.patients}
            providerOptions={options.providers}
        />
    );
}