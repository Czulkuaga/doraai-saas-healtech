import Link from "next/link";
import { notFound } from "next/navigation";
import { FiEdit2 } from "react-icons/fi";
import { getBusinessPartnerByIdAction } from "@/action/business-partner/get-business-partner";
import { BusinessPartnerDetailsCard } from "@/components/private/organizations/business-partner/business-partner-details-card";
import { FaArrowLeft } from "react-icons/fa";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function BusinessPartnerDetailsPage({ params }: Props) {
    const { id } = await params;
    const item = await getBusinessPartnerByIdAction(id);

    if (!item) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        Détails du tiers
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Consultez les informations principales de ce tiers.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Link
                        href={`/organization/business-partner`}
                        className="inline-flex items-center gap-2 self-start rounded-2xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <FaArrowLeft className="h-4 w-4"/>
                        Back
                    </Link>


                    <Link
                        href={`/organization/business-partner/${item.id}/edit`}
                        className="inline-flex items-center gap-2 self-start rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <FiEdit2 className="h-4 w-4" />
                        Modifier
                    </Link>
                </div>
            </div>

            <BusinessPartnerDetailsCard item={item} />
        </div>
    );
}