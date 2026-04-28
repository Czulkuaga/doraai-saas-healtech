import { notFound } from "next/navigation";
import { getPreventiveFieldOptionById } from "@/action/health-promotion/preventive-template/get-preventive-field-option-by-id";
import { PreventiveFieldOptionForm } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-field-option-form";
import { fieldTypeSupportsOptions } from "@/lib/types/health-promotion/preventive-template/preventive-field.helpers";

type Props = {
    params: Promise<{
        id: string;
        versionId: string;
        sectionId: string;
        fieldId: string;
        optionId: string;
    }>;
};

export default async function EditPreventiveFieldOptionPage({ params }: Props) {
    const { id, versionId, sectionId, fieldId, optionId } = await params;

    const option = await getPreventiveFieldOptionById(
        id,
        versionId,
        sectionId,
        fieldId,
        optionId
    );

    if (!option) notFound();

    if (!fieldTypeSupportsOptions(option.field.type)) {
        notFound();
    }

    return (
        <PreventiveFieldOptionForm
            mode="edit"
            templateId={id}
            versionId={versionId}
            sectionId={sectionId}
            fieldId={fieldId}
            optionId={option.id}
            fieldLabel={option.field.label}
            initialValues={{
                key: option.key,
                label: option.label,
                order: option.order,
            }}
        />
    );
}