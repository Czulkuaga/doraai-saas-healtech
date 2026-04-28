import { notFound } from "next/navigation";
import { getPreventiveTemplateById } from "@/action/health-promotion/preventive-template/get-preventive-template-by-id";
import { getPreventiveTemplateFormOptions } from "@/action/health-promotion/preventive-template/get-preventive-template-form-options";
import { PreventiveTemplateForm } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-form";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditPreventiveTemplatePage({ params }: Props) {
    const { id } = await params;

    const [item, options] = await Promise.all([
        getPreventiveTemplateById(id),
        getPreventiveTemplateFormOptions(),
    ]);

    if (!item) notFound();

    return (
        <PreventiveTemplateForm
            mode="edit"
            templateId={item.id}
            initialValues={{
                code: item.code,
                name: item.name,
                serviceTypeId: item.serviceTypeId ?? "",
                specialtyId: item.specialtyId ?? "",
                status: item.status,
                isActive: item.isActive,
            }}
            serviceTypeOptions={options.serviceTypes}
            specialtyOptions={options.specialties}
        />
    );
}