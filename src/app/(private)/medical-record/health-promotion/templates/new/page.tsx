import { getPreventiveTemplateFormOptions } from "@/action/health-promotion/preventive-template/get-preventive-template-form-options";
import { PreventiveTemplateForm } from "@/components/private/medical-record/health-promotion/preventive-templates/preventive-template-form";

export default async function NewPreventiveTemplatePage() {
    const options = await getPreventiveTemplateFormOptions();

    return (
        <PreventiveTemplateForm
            mode="create"
            serviceTypeOptions={options.serviceTypes}
            specialtyOptions={options.specialties}
        />
    );
}