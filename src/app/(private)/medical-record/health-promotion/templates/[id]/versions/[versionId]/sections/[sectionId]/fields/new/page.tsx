import { notFound } from "next/navigation";
import { PreventiveFieldType } from "../../../../../../../../../../../../../generated/prisma/enums";
import { getPreventiveTemplateSectionDetail } from "@/action/health-promotion/preventive-template/get-preventive-template-section-detail";
import { PreventiveTemplateFieldForm } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-field-form";

type Props = {
    params: Promise<{ id: string; versionId: string; sectionId: string }>;
};

function getFieldTypeLabel(type: PreventiveFieldType) {
    return String(type);
}

export default async function NewPreventiveTemplateFieldPage({ params }: Props) {
    const { id, versionId, sectionId } = await params;

    const section = await getPreventiveTemplateSectionDetail(id, versionId, sectionId);

    if (!section) notFound();

    const fieldTypeOptions = Object.values(PreventiveFieldType).map((type) => ({
        value: type,
        label: getFieldTypeLabel(type),
    }));

    return (
        <PreventiveTemplateFieldForm
            mode="create"
            templateId={id}
            versionId={versionId}
            sectionId={sectionId}
            templateName={section.version.template.name}
            versionNumber={section.version.version}
            sectionTitle={section.title}
            fieldTypeOptions={fieldTypeOptions}
            initialValues={{
                key: "",
                label: "",
                type: fieldTypeOptions[0].value,
                required: false,
                order: section.fields.length + 1,
                configText: "",
            }}
        />
    );
}