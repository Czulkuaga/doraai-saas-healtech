import Link from "next/link";
import { FiUsers, FiBriefcase } from "react-icons/fi";

const items = [
    {
        href: "/organization/business-partner",
        title: "Liste des tiers",
        description:
            "Consultez, créez et gérez les tiers de votre organisation.",
        icon: FiBriefcase,
    },
    {
        href: "/organization/users",
        title: "Liste des utilisateurs",
        description:
            "Accédez à la gestion des utilisateurs et de leurs informations.",
        icon: FiUsers,
    },
];

export default function OrganizationDashboard() {
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-emerald-500/10 bg-white p-6 shadow-sm dark:bg-slate-950">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Organisation
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                    Accédez rapidement aux sections principales de gestion de
                    votre organisation.
                </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group rounded-3xl border border-emerald-500/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-500/30 hover:shadow-md dark:bg-slate-950"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r from-emerald-500/10 to-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-base font-semibold text-slate-900 transition group-hover:text-cyan-700 dark:text-slate-100 dark:group-hover:text-cyan-300">
                                        {item.title}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        {item.description}
                                    </p>

                                    <span className="mt-4 inline-flex items-center rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-3 py-2 text-xs font-semibold text-white">
                                        Ouvrir
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </section>
        </div>
    );
}