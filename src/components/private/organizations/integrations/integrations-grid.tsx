import type { SimplyBookConnectionSummary } from "@/lib/integrations/simplybook/simplybook.types";

import { SimplyBookIntegrationCard } from "./simplybook-integration-card";

type Props = {
    simplyBookConnection:
    | SimplyBookConnectionSummary
    | null;
};

export function IntegrationsGrid({
    simplyBookConnection,
}: Props) {
    return (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <SimplyBookIntegrationCard
                initialConnection={simplyBookConnection}
            />

            <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-950">
                <p className="text-sm font-medium text-slate-500">
                    Bientôt disponible
                </p>

                <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    MyCareNet
                </h2>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Vérification de l’assurabilité et échanges
                    administratifs.
                </p>
            </article>
        </section>
    );
}