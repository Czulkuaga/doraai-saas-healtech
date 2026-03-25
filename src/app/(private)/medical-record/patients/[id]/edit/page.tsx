import { notFound } from "next/navigation";
import { getPatientByIdAction } from "@/action/patients/get-patient";
import { getPatientFormDefaults } from "@/lib/types/patients/patients.form.mapper";
import { PatientForm } from "@/components/private/medical-record/patients/patient-form";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PatientEditPage({ params }: Props) {
    const { id } = await params;
    const item = await getPatientByIdAction(id);

    if (!item) notFound();

    return (
        <PatientForm
            mode="edit"
            defaultValues={getPatientFormDefaults(item)}
        />
    );
}