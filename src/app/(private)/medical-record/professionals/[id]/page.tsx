import Link from "next/link";
import { notFound } from "next/navigation";
import { FiEdit2 } from "react-icons/fi";
import { getProfessionalByIdAction } from "@/action/professionals/get-professional";
import { ProfessionalDetailsCard } from "@/components/private/medical-record/professionals/professional-details-card";
import { professionalEditPath, professionalListPath } from "@/lib/types/professionals/professionals.routes";
import { FaArrowLeft } from "react-icons/fa";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ProfessionalDetailsPage({ params }: Props) {
    const { id } = await params;
    const item = await getProfessionalByIdAction(id);

    if (!item) notFound();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        Détails du professionnel
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Consultez les informations principales de ce professionnel.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link
                        href={professionalListPath()}
                        className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        <FaArrowLeft className="h-4 w-4"/>
                        Back
                    </Link>
                    <Link
                        href={professionalEditPath(item.id)}
                        className="inline-flex items-center gap-2 self-start rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <FiEdit2 className="h-4 w-4" />
                        Modifier
                    </Link>
                </div>
            </div>

            <ProfessionalDetailsCard item={item} />
        </div>
    );
}