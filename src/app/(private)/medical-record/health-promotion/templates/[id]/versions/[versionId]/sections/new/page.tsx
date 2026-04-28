import { notFound } from "next/navigation";
import { getPreventiveTemplateVersionById } from "@/action/health-promotion/preventive-template/get-preventive-template-version-by-id";
import { PreventiveTemplateSectionForm } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-section-form";

type Props = {
    params: Promise<{ id: string; versionId: string }>;
};

export default async function NewPreventiveTemplateSectionPage({
    params,
}: Props) {
    const { id, versionId } = await params;

    const version = await getPreventiveTemplateVersionById(id, versionId);

    if (!version) notFound();

    return (
        <PreventiveTemplateSectionForm
            mode="create"
            templateId={id}
            versionId={versionId}
            templateName={version.template.name}
            versionNumber={version.version}
            initialValues={{
                key: "",
                title: "",
                order: version.totalSections + 1,
            }}
        />
    );
}