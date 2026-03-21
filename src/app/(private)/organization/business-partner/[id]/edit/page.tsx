import { notFound } from "next/navigation";
import { getBusinessPartnerByIdAction } from "@/action/business-partner/get-business-partner";
import { BusinessPartnerForm } from "@/components/private/organizations/business-partner/business-partner-form";
import { getBusinessPartnerFormDefaults } from "@/lib/types/business-partner/business-partner.form.mapper";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function BusinessPartnerEditPage({ params }: Props) {
    const { id } = await params;
    const item = await getBusinessPartnerByIdAction(id);

    if (!item) {
        notFound();
    }

    return (
        <BusinessPartnerForm
            mode="edit"
            defaultValues={getBusinessPartnerFormDefaults(item)}
        />
    );
}