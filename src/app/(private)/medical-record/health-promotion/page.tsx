import Link from "next/link";
import {
    FiClipboard,
    FiFileText,
    FiLayers,
    FiArrowRight,
    FiUsers,
    FiActivity,
} from "react-icons/fi";

function StatCard({
    title,
    description,
    href,
    icon,
    badge,
}: {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
}) {
    return (
        <Link
            href={href}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
        >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/4 via-cyan-500/3 to-transparent opacity-100" />

            <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/15 to-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                        {icon}
                    </div>

                    {badge ? (
                        <span className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                            {badge}
                        </span>
                    ) : null}
                </div>

                <div className="mt-5">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition group-hover:translate-x-0.5 dark:text-cyan-300">
                    Accéder
                    <FiArrowRight className="h-4 w-4" />
                </div>
            </div>
        </Link>
    );
}

function MiniInfoCard({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/15 to-cyan-500/15 text-cyan-600 dark:text-cyan-300">
                    {icon}
                </div>

                <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default async function HealthPromotionPage() {
    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-cyan-500/4 to-transparent" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            Promotion de la santé
                        </div>

                        <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100 md:text-3xl">
                            Tableau de pilotage préventif
                        </h1>

                        <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400 md:text-base">
                            Gérez les modèles préventifs, préparez les campagnes de prévention
                            et structurez l’exécution clinique pour un ou plusieurs patients.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:w-full sm:max-w-sm">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Module
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                Prévention
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                État
                            </p>
                            <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                                En construction
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <StatCard
                    title="Modèles préventifs"
                    description="Créez et gérez les modèles, leurs versions, les sections et les champs qui serviront de base aux fiches et campagnes préventives."
                    href="/medical-record/health-promotion/templates"
                    icon={<FiLayers className="h-6 w-6" />}
                    badge="CRUD"
                />

                <StatCard
                    title="Cas préventifs"
                    description="Gérez les cas préventifs, suivez leur progression et structurez l'exécution clinique pour un ou plusieurs patients."
                    href="/medical-record/health-promotion/cases"
                    icon={<FiLayers className="h-6 w-6" />}
                    badge="CRUD"
                />

                <StatCard
                    title="Campagnes et cas"
                    description="Organisez les campagnes de médecine préventive, ciblez un ou plusieurs patients et pilotez ensuite les cas générés individuellement."
                    href="/medical-record/health-promotion/campaigns"
                    icon={<FiClipboard className="h-6 w-6" />}
                    badge="Bientôt"
                />
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <MiniInfoCard
                    title="Versions maîtrisées"
                    description="Chaque modèle pourra évoluer via des versions distinctes pour garantir la stabilité clinique et la traçabilité."
                    icon={<FiFileText className="h-5 w-5" />}
                />

                <MiniInfoCard
                    title="Campagnes multi-patients"
                    description="Une campagne préventive pourra être préparée pour plusieurs patients, tout en conservant des cas individuels par patient."
                    icon={<FiUsers className="h-5 w-5" />}
                />

                <MiniInfoCard
                    title="Exécution clinique"
                    description="Les cas permettront ensuite de capturer les réponses, suivre les statuts et historiser le parcours préventif."
                    icon={<FiActivity className="h-5 w-5" />}
                />
            </section>
        </div>
    );
}