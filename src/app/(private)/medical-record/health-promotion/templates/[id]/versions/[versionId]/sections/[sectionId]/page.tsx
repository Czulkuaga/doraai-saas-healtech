import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiEdit2, FiPlus } from "react-icons/fi";
import { getPreventiveTemplateSectionDetail } from "@/action/health-promotion/preventive-template/get-preventive-template-section-detail";

type Props = {
    params: Promise<{ id: string; versionId: string; sectionId: string }>;
};

export default async function PreventiveTemplateSectionDetailsPage({
    params,
}: Props) {
    const { id, versionId, sectionId } = await params;

    const section = await getPreventiveTemplateSectionDetail(id, versionId, sectionId);

    if (!section) notFound();

    const basePath = `/medical-record/health-promotion/templates/${id}/versions/${versionId}/sections/${sectionId}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {section.title}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {section.version.template.name} · version {section.version.version} · {section.key}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href={`/medical-record/health-promotion/templates/${id}/versions/${versionId}`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        <FiArrowLeft className="h-4 w-4" />
                        Retour
                    </Link>

                    <Link
                        href={`${basePath}/edit`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        <FiEdit2 className="h-4 w-4" />
                        Modifier
                    </Link>

                    <Link
                        href={`${basePath}/fields/new`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
                    >
                        <FiPlus className="h-4 w-4" />
                        Nouveau champ
                    </Link>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                {section.fields.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Aucun champ n’est encore défini pour cette section.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/70">
                                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    <th className="px-5 py-4">Ordre</th>
                                    <th className="px-5 py-4">Clé</th>
                                    <th className="px-5 py-4">Libellé</th>
                                    <th className="px-5 py-4">Type</th>
                                    <th className="px-5 py-4">Obligatoire</th>
                                    <th className="px-5 py-4">Options</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {section.fields.map((field) => (
                                    <tr
                                        key={field.id}
                                        className="border-t border-slate-200 dark:border-slate-800"
                                    >
                                        <td className="px-5 py-4">{field.order}</td>
                                        <td className="px-5 py-4">{field.key}</td>
                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            {field.label}
                                        </td>
                                        <td className="px-5 py-4">{field.type}</td>
                                        <td className="px-5 py-4">
                                            {field.required ? "Oui" : "Non"}
                                        </td>
                                        <td className="px-5 py-4">{field.optionsCount}</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`${basePath}/fields/${field.id}`}
                                                    className="inline-flex items-center rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                                                >
                                                    Voir
                                                </Link>

                                                <Link
                                                    href={`${basePath}/fields/${field.id}/edit`}
                                                    className="inline-flex items-center rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                                                >
                                                    Modifier
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}