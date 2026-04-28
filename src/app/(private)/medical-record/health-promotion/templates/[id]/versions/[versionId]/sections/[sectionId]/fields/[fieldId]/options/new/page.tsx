import { notFound } from "next/navigation";
import { getPreventiveTemplateFieldDetail } from "@/action/health-promotion/preventive-template/get-preventive-template-field-detail";
import { PreventiveFieldOptionForm } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-field-option-form";
import { fieldTypeSupportsOptions } from "@/lib/types/health-promotion/preventive-template/preventive-field.helpers";

type Props = {
    params: Promise<{
        id: string;
        versionId: string;
        sectionId: string;
        fieldId: string;
    }>;
};

export default async function NewPreventiveFieldOptionPage({ params }: Props) {
    const { id, versionId, sectionId, fieldId } = await params;

    const field = await getPreventiveTemplateFieldDetail(
        id,
        versionId,
        sectionId,
        fieldId
    );

    if (!field) notFound();

    if (!fieldTypeSupportsOptions(field.type)) {
        notFound();
    }

    return (
        <PreventiveFieldOptionForm
            mode="create"
            templateId={id}
            versionId={versionId}
            sectionId={sectionId}
            fieldId={fieldId}
            fieldLabel={field.label}
            initialValues={{
                key: "",
                label: "",
                order: field.options.length + 1,
            }}
        />
    );
}