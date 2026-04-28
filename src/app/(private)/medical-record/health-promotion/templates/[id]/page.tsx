import { notFound } from "next/navigation";
import { getPreventiveTemplateById } from "@/action/health-promotion/preventive-template/get-preventive-template-by-id";
import { PreventiveTemplateDetailsHeader } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-details-header";
import { PreventiveTemplateDetailsCard } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-details-card";
import { PreventiveTemplateVersionsCard } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-versions-card";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PreventiveTemplateDetailsPage({ params }: Props) {
    const { id } = await params;

    const item = await getPreventiveTemplateById(id);

    if (!item) notFound();

    return (
        <div className="space-y-6">
            <PreventiveTemplateDetailsHeader id={item.id} />
            <PreventiveTemplateDetailsCard item={item} />
            <PreventiveTemplateVersionsCard
                templateId={item.id}
                versions={item.versions}
                publishedVersionId={item.publishedVersionId}
            />
        </div>
    );
}