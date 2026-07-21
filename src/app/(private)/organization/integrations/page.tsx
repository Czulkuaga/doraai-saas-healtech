import { getSimplyBookConnectionAction } from "../../../../action/integrations/simplybook/get-simplybook-connection.action";

import { IntegrationsGrid } from "../../../../components/private/organizations/integrations/integrations-grid";

export default async function IntegrationsPage() {
    const simplyBookResult =
        await getSimplyBookConnectionAction();

    const simplyBookConnection =
        simplyBookResult.success
            ? simplyBookResult.connection
            : null;

    return (
        <main className="space-y-8">
            <header>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Configuration
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    Intégrations
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                    Connectez Medicloud à vos services externes
                    afin de synchroniser les patients, les rendez-vous
                    et les données administratives.
                </p>
            </header>

            <IntegrationsGrid
                simplyBookConnection={simplyBookConnection}
            />
        </main>
    );
}