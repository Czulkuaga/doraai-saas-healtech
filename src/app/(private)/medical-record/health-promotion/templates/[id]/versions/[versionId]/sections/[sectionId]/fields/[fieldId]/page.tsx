import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiEdit2, FiPlus } from "react-icons/fi";
import { getPreventiveTemplateFieldDetail } from "@/action/health-promotion/preventive-template/get-preventive-template-field-detail";
import { fieldTypeSupportsOptions } from "@/lib/types/health-promotion/preventive-template/preventive-field.helpers";

type Props = {
    params: Promise<{
        id: string;
        versionId: string;
        sectionId: string;
        fieldId: string;
    }>;
};

function formatDate(value?: Date | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fr-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
}

function formatConfig(value: unknown) {
    if (value == null) return "—";
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return "—";
    }
}

export default async function PreventiveTemplateFieldDetailsPage({
    params,
}: Props) {
    const { id, versionId, sectionId, fieldId } = await params;

    const field = await getPreventiveTemplateFieldDetail(
        id,
        versionId,
        sectionId,
        fieldId
    );

    if (!field) notFound();

    const sectionPath = `/medical-record/health-promotion/templates/${id}/versions/${versionId}/sections/${sectionId}`;
    const basePath = `${sectionPath}/fields/${fieldId}`;

    const supportsOptions = fieldTypeSupportsOptions(field.type);

    console.log(supportsOptions)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {field.label}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {field.version.template.name} · version {field.version.version} ·{" "}
                        {field.section?.title}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href={sectionPath}
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

                    {/* {supportsOptions ? (
                        <Link
                            href={`${basePath}/options/new`}
                            className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
                        >
                            <FiPlus className="h-4 w-4" />
                            Nouvelle option
                        </Link>
                    ) : null} */}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="space-y-6 xl:col-span-8">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <Field label="Clé" value={field.key} />
                            <Field label="Libellé" value={field.label} />
                            <Field label="Type" value={String(field.type)} />
                            <Field label="Ordre" value={String(field.order)} />
                            <Field
                                label="Obligatoire"
                                value={field.required ? "Oui" : "Non"}
                            />
                            <Field
                                label="Options"
                                value={String(field.options.length)}
                            />
                            <Field
                                label="Valeurs liées"
                                value={String(field.valuesCount)}
                            />
                            <Field
                                label="Créé le"
                                value={formatDate(field.createdAt)}
                            />
                            <Field
                                label="Mis à jour le"
                                value={formatDate(field.updatedAt)}
                            />
                        </div>

                        <div className="mt-6">
                            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                                Configuration JSON
                            </p>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                <pre className="whitespace-pre-wrap wrap-break-word text-sm text-slate-700 dark:text-slate-300">
                                    {formatConfig(field.config)}
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Options du champ
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Gérez les valeurs possibles pour les champs de sélection.
                                </p>
                            </div>

                            {supportsOptions ? (
                                <Link
                                    href={`${basePath}/options/new`}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-cyan-400"
                                >
                                    <FiPlus className="h-4 w-4" />
                                    Nouvelle option
                                </Link>
                            ) : null}

                        </div>

                        {supportsOptions ? (
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                                {/* tabla de options */}

                                {field.options.length === 0 ? (
                                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Aucune option n’est encore définie pour ce champ.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-6 overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-900/70">
                                                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                    <th className="px-5 py-4">Ordre</th>
                                                    <th className="px-5 py-4">Clé</th>
                                                    <th className="px-5 py-4">Libellé</th>
                                                    <th className="px-5 py-4">Créée le</th>
                                                    <th className="px-5 py-4 text-right">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {field.options.map((option) => (
                                                    <tr
                                                        key={option.id}
                                                        className="border-t border-slate-200 dark:border-slate-800"
                                                    >
                                                        <td className="px-5 py-4">
                                                            {option.order}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            {option.key}
                                                        </td>
                                                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                                                            {option.label}
                                                        </td>
                                                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                                                            {formatDate(option.createdAt)}
                                                        </td>
                                                        <td className="px-5 py-4 text-right">
                                                            <Link
                                                                href={`${basePath}/options/${option.id}/edit`}
                                                                className="inline-flex items-center rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                                                            >
                                                                Modifier
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5 dark:bg-cyan-500/10">
                                <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
                                    Options non requises
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-cyan-700 dark:text-cyan-300">
                                    Ce type de champ ne nécessite pas de liste d’options.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* <div className="space-y-6 xl:col-span-4">
                    <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5 dark:bg-cyan-500/10">
                        <h3 className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
                            Sélection simple ou multiple
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-cyan-700 dark:text-cyan-300">
                            Le comportement dépend du type du champ. Un champ de type
                            sélection simple stockera une option, tandis qu’un champ
                            multi-sélection utilisera plusieurs liens d’options.
                        </p>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                {value}
            </p>
        </div>
    );
}