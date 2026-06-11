// src/app/(private)/medical-record/pathologies/page.tsx

import { listPathologiesAction } from "@/action/pathologies/pathology-actions";
import { PathologiesManager } from "@/components/private/medical-record/pathologies/pathologies-manager";

export default async function PathologiesPage() {
    const items = await listPathologiesAction();

    return (
        <div className="space-y-6 p-4 md:p-6 xl:p-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Pathologies
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Gérez le catalogue des pathologies disponibles pour les patients.
                </p>
            </div>

            <PathologiesManager items={items} />
        </div>
    );
}