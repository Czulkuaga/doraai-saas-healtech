import { Suspense } from "react";
import { getAuthStatusCached } from "@/lib/auth/auth-cache";

// Actions
import { getDashboardKpis } from "@/action/dashboard/getDashboardKpis";
import { getPreventivePipeline } from "@/action/dashboard/getPreventivePipeline";
import { getRecentActivity } from "@/action/dashboard/getRecentActivity";

// Components
import {
  DashboardHeader,
  LastAccessSection,
  LastAccessTableSkeleton,
} from "@/components";

// Icons
import { FaUserCheck } from "react-icons/fa";
import { RiHeartPulseFill } from "react-icons/ri";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";

import Link from "next/link";
import { FaUserPlus } from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";

export default async function DashboardPage() {
  const st = await getAuthStatusCached();
  if (!st.ok) return null;

  const { userId, tenantId } = st.session;

  // 🔥 Carga paralela de datos reales
  const [kpis, pipeline, activity] = await Promise.all([
    getDashboardKpis(),
    getPreventivePipeline(),
    getRecentActivity(),
  ]);

  // 📊 KPIs dinámicos
  const kpiItems = [
    {
      title: "Patients suivis",
      value: kpis.totalPatients.toLocaleString("fr-BE"),
      note: "Population active",
      icon: <FaUserCheck size={20} />,
      iconClass: "text-primary",
      iconWrapClass: "bg-primary/10",
    },
    {
      title: "Couverture préventive",
      value: `${kpis.coverage}%`,
      note: "Patients avec dossier",
      icon: <RiHeartPulseFill size={20} />,
      iconClass: "text-emerald-500",
      iconWrapClass: "bg-emerald-500/10",
    },
    {
      title: "Dossiers ce mois",
      value: kpis.casesThisMonth,
      note: "Activité récente",
      icon: <MdOutlineAssignmentTurnedIn size={20} />,
      iconClass: "text-blue-500",
      iconWrapClass: "bg-blue-500/10",
    },
    {
      title: "Dossiers ouverts",
      value: kpis.openCases,
      note: "En cours de traitement",
      icon: <IoWarningOutline size={20} />,
      iconClass: "text-amber-500",
      iconWrapClass: "bg-amber-500/10",
    },
  ];

  return (
    <div className="p-4 md:p-6 xl:p-8 space-y-6">
      <DashboardHeader
        title="Tableau de bord préventif"
        subtitle="Vue d’ensemble des patients, dossiers et activité clinique."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.title} item={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* MAIN */}
        <div className="space-y-6 xl:col-span-2">
          <PreventivePipeline data={pipeline} />

          <Suspense fallback={<LastAccessTableSkeleton />}>
            <LastAccessSection userId={userId} tenantId={tenantId} />
          </Suspense>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <QuickActions />
          <RecentActivity items={activity} />
        </aside>
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////
// 🧠 PIPELINE COMPONENT
////////////////////////////////////////////////////////////

function PreventivePipeline({ data }: { data: any }) {
  const items = [
    { label: "Ouverts", value: data.open, color: "bg-primary" },
    { label: "Terminés", value: data.completed, color: "bg-emerald-500" },
    { label: "Annulés", value: data.cancelled, color: "bg-red-500" },
  ];

  return (
    <section className="rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#111518] dark:text-gray-100">
            Flux préventif
          </h2>
          <p className="text-xs text-[#5f7586]">
            État global des dossiers préventifs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-[#f8fafb] p-4 dark:bg-gray-700/50"
          >
            <div className={`mb-3 h-1 w-10 rounded-full ${item.color}`} />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5f7586]">
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#111518] dark:text-gray-100">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

////////////////////////////////////////////////////////////
// 🕘 ACTIVITY COMPONENT
////////////////////////////////////////////////////////////

function formatTime(date: Date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;

  if (diff < 60) return "À l’instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;

  return new Date(date).toLocaleDateString("fr-BE");
}

function RecentActivity({ items }: { items: any[] }) {
  return (
    <section className="rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#5f7586]">
        Activité récente
      </h2>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              •
            </div>

            <div>
              <p className="text-sm font-bold text-[#111518] dark:text-gray-100">
                {item.title}
              </p>

              <p className="text-xs text-[#5f7586]">
                {item.description}
              </p>

              <p className="text-[10px] text-[#9aa6b2]">
                {formatTime(item.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function KpiCard({
  item,
}: {
  item: {
    title: string;
    value: string | number;
    note?: string;
    icon: React.ReactNode;
    iconClass: string;
    iconWrapClass: string;
  };
}) {
  return (
    <section className="rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#5f7586]">
            {item.title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-[#111518] dark:text-gray-100">
            {item.value}
          </p>

          {item.note && (
            <p className="mt-2 text-xs font-medium text-[#5f7586]">
              {item.note}
            </p>
          )}
        </div>

        <div
          className={`flex size-11 items-center justify-center rounded-xl ${item.iconWrapClass}`}
        >
          <span className={item.iconClass}>{item.icon}</span>
        </div>
      </div>
    </section>
  );
}

function QuickActions() {
  const actions = [
    {
      label: "Nouveau patient",
      href: "/medical-record/patients/new",
      icon: <FaUserPlus />,
      primary: true,
    },
    {
      label: "Nouveau professionnel",
      href: "/medical-record/professionals/new",
      icon: <MdMedicalServices />,
    },
    {
      label: "Dossier préventif",
      href: "/medical-record/health-promotion/cases",
      icon: <RiHeartPulseFill />,
    },
  ];

  return (
    <section className="rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#5f7586]">
        Actions rapides
      </h2>

      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`flex h-11 items-center justify-between rounded-xl px-4 text-sm font-bold transition ${
              action.primary
                ? "bg-slate-600 text-white hover:brightness-110"
                : "bg-[#f0f2f4] text-[#111518] hover:bg-[#e6eaee] dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span>{action.label}</span>
            <span className="text-lg">{action.icon}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}