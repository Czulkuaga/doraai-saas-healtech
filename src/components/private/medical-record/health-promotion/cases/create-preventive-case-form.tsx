"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPreventiveCaseAction } from "@/action/health-promotion/case/preventive-case.actions";
import { useToast } from "@/components/ui/toast/use-toast";

type Option = {
    id: string;
    name: string;
};

type Props = {
    patients: Option[];
    templates: Option[];
    providers: Option[];
    orgUnits: Option[];
    locations: Option[];
};

type FieldErrors = Partial<{
    patientId: string[];
    templateId: string[];
    providerProfileId: string[];
    orgUnitId: string[];
    locationId: string[];
    notes: string[];
}>;

export function CreatePreventiveCaseForm({
    patients,
    templates,
    providers,
    orgUnits,
    locations,
}: Props) {
    const router = useRouter();
    const toast = useToast();

    const [patientId, setPatientId] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [providerProfileId, setProviderProfileId] = useState("");
    const [orgUnitId, setOrgUnitId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [notes, setNotes] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [isPending, setIsPending] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsPending(true);
        setFieldErrors({});

        const result = await createPreventiveCaseAction({
            patientId,
            templateId,
            providerProfileId,
            orgUnitId,
            locationId,
            notes,
        });

        setIsPending(false);

        if (!result.ok) {
            if ("fieldErrors" in result && result.fieldErrors) {
                setFieldErrors(result.fieldErrors);
            }

            toast.error("Erreur", result.message);
            return;
        }

        toast.success("Succès", result.message);

        router.push(`/medical-record/health-promotion/cases/${result.data.id}/edit`);
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Informations du cas
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Sélectionnez le patient, le modèle préventif publié et le professionnel assigné.
                    </p>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Patient <span className="text-rose-500">*</span>
                        </label>

                        <select
                            value={patientId}
                            onChange={(event) => setPatientId(event.target.value)}
                            disabled={isPending}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="">Sélectionner un patient...</option>
                            {patients.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.patientId?.[0] && (
                            <p className="text-xs text-rose-600 dark:text-rose-400">
                                {fieldErrors.patientId[0]}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Modèle préventif <span className="text-rose-500">*</span>
                        </label>

                        <select
                            value={templateId}
                            onChange={(event) => setTemplateId(event.target.value)}
                            disabled={isPending}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="">Sélectionner un modèle...</option>
                            {templates.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.templateId?.[0] && (
                            <p className="text-xs text-rose-600 dark:text-rose-400">
                                {fieldErrors.templateId[0]}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Professionnel assigné
                        </label>

                        <select
                            value={providerProfileId}
                            onChange={(event) => setProviderProfileId(event.target.value)}
                            disabled={isPending}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="">Non assigné</option>
                            {providers.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.providerProfileId?.[0] && (
                            <p className="text-xs text-rose-600 dark:text-rose-400">
                                {fieldErrors.providerProfileId[0]}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Unité organisationnelle
                        </label>

                        <select
                            value={orgUnitId}
                            onChange={(event) => setOrgUnitId(event.target.value)}
                            disabled={isPending}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="">Non assignée</option>
                            {orgUnits.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.orgUnitId?.[0] && (
                            <p className="text-xs text-rose-600 dark:text-rose-400">
                                {fieldErrors.orgUnitId[0]}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Lieu / site
                        </label>

                        <select
                            value={locationId}
                            onChange={(event) => setLocationId(event.target.value)}
                            disabled={isPending}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            <option value="">Non assigné</option>
                            {locations.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        {fieldErrors.locationId?.[0] && (
                            <p className="text-xs text-rose-600 dark:text-rose-400">
                                {fieldErrors.locationId[0]}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Notes internes
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Ces notes seront visibles dans le dossier préventif.
                    </p>
                </div>

                <div className="p-5">
                    <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        disabled={isPending}
                        rows={5}
                        placeholder="Ajouter une note..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />

                    <div className="mt-2 flex justify-between gap-3 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                            Optionnel
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                            {notes.length}/2000
                        </span>
                    </div>

                    {fieldErrors.notes?.[0] && (
                        <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                            {fieldErrors.notes[0]}
                        </p>
                    )}
                </div>
            </section>

            <div className="sticky bottom-0 z-10 -mx-1 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => router.push("/medical-record/health-promotion/cases")}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Annuler
                    </button>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPending ? "Création..." : "Créer et continuer"}
                    </button>
                </div>
            </div>
        </form>
    );
}