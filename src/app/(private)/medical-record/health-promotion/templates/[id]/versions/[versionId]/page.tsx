import { notFound } from "next/navigation";
import { getPreventiveTemplateVersionById } from "@/action/health-promotion/preventive-template/get-preventive-template-version-by-id";
import { PreventiveTemplateVersionDetailsHeader } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-version-details-header";
import { PreventiveTemplateVersionDetailsCard } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-version-details-card";
import { PreventiveTemplateVersionPublishCard } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-version-publish-card";
import { PreventiveTemplateVersionSectionsCard } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-version-sections-card";

type Props = {
    params: Promise<{ id: string; versionId: string }>;
};

export default async function PreventiveTemplateVersionDetailsPage({
    params,
}: Props) {
    const { id, versionId } = await params;

    const item = await getPreventiveTemplateVersionById(id, versionId);

    if (!item) notFound();

    return (
        <div className="space-y-6">
            <PreventiveTemplateVersionDetailsHeader
                templateId={item.templateId}
                templateName={item.template.name}
                version={item.version}
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="space-y-6 xl:col-span-8">
                    <PreventiveTemplateVersionDetailsCard item={item} />
                    <PreventiveTemplateVersionSectionsCard
                        templateId={item.templateId}
                        versionId={item.id}
                        sections={item.sections}
                        versionStatus={item.status}
                    />
                </div>

                <div className="space-y-6 xl:col-span-4">
                    <PreventiveTemplateVersionPublishCard
                        templateId={item.templateId}
                        versionId={item.id}
                        version={item.version}
                        status={item.status}
                        isCurrentlyPublished={item.isCurrentlyPublished}
                        totalSections={item.totalSections}
                    />
                </div>
            </div>
        </div>
    );
}