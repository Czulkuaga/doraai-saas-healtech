import { notFound } from "next/navigation";
import { getPreventiveTemplateSectionById } from "@/action/health-promotion/preventive-template/get-preventive-template-section-by-id";
import { PreventiveTemplateSectionForm } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-section-form";

type Props = {
    params: Promise<{ id: string; versionId: string; sectionId: string }>;
};

export default async function EditPreventiveTemplateSectionPage({
    params,
}: Props) {
    const { id, versionId, sectionId } = await params;

    const section = await getPreventiveTemplateSectionById(
        id,
        versionId,
        sectionId
    );

    if (!section) notFound();

    return (
        <PreventiveTemplateSectionForm
            mode="edit"
            templateId={id}
            versionId={versionId}
            sectionId={section.id}
            templateName={section.version.template.name}
            versionNumber={section.version.version}
            initialValues={{
                key: section.key,
                title: section.title,
                order: section.order,
            }}
        />
    );
}