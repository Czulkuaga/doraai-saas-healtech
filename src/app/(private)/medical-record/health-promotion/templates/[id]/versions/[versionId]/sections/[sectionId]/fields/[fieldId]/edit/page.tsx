import { notFound } from "next/navigation";
import { PreventiveFieldType } from "../../../../../../../../../../../../../../generated/prisma/enums";
import { getPreventiveTemplateFieldById } from "@/action/health-promotion/preventive-template/get-preventive-template-field-by-id";
import { PreventiveTemplateFieldForm } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-field-form";

type Props = {
    params: Promise<{
        id: string;
        versionId: string;
        sectionId: string;
        fieldId: string;
    }>;
};

function getFieldTypeLabel(type: PreventiveFieldType) {
    return String(type);
}

export default async function EditPreventiveTemplateFieldPage({ params }: Props) {
    const { id, versionId, sectionId, fieldId } = await params;

    const field = await getPreventiveTemplateFieldById(
        id,
        versionId,
        sectionId,
        fieldId
    );

    if (!field) notFound();

    const fieldTypeOptions = Object.values(PreventiveFieldType).map((type) => ({
        value: type,
        label: getFieldTypeLabel(type),
    }));

    return (
        <PreventiveTemplateFieldForm
            mode="edit"
            templateId={id}
            versionId={versionId}
            sectionId={sectionId}
            fieldId={field.id}
            templateName={field.version.template.name}
            versionNumber={field.version.version}
            sectionTitle={field.section?.title ?? "Section"}
            fieldTypeOptions={fieldTypeOptions}
            initialValues={{
                key: field.key,
                label: field.label,
                type: field.type,
                required: field.required,
                order: field.order,
                configText: field.configText,
            }}
        />
    );
}