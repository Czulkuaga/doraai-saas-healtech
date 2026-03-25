import { notFound } from "next/navigation";
import { getProfessionalByIdAction } from "@/action/professionals/get-professional";
import { getProfessionalFormDefaults } from "@/lib/types/professionals/professionals.form.mapper";
import { ProfessionalForm } from "@/components/private/medical-record/professionals/professional-form";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ProfessionalEditPage({ params }: Props) {
    const { id } = await params;
    const item = await getProfessionalByIdAction(id);

    if (!item) notFound();

    return (
        <ProfessionalForm
            mode="edit"
            defaultValues={getProfessionalFormDefaults(item)}
        />
    );
}