// import { Suspense } from "react";
import { getAuthStatusCached } from "@/lib/auth/auth-cache";

// Actions
import { getDashboardKpis } from "@/action/dashboard/getDashboardKpis";
import { getPreventivePipeline } from "@/action/dashboard/getPreventivePipeline";
import { getRecentActivity } from "@/action/dashboard/getRecentActivity";

// Components
import {
  DashboardHeader,
  // LastAccessSection,
  // LastAccessTableSkeleton,
} from "@/components";

// Icons
import { FaUserCheck } from "react-icons/fa";
import { RiHeartPulseFill } from "react-icons/ri";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";

import Link from "next/link";
import { FaUserPlus } from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";

import {
  FaTint,
  FaHeartbeat,
  FaDna,
  FaBaby,
  FaSyringe,
} from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";



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
      title: "Suivi Préventif à jour",
      value: `${kpis.coverage}%`,
      note: "Patients conformes au suivi",
      icon: <RiHeartPulseFill size={20} />,
      iconClass: "text-emerald-500",
      iconWrapClass: "bg-emerald-500/10",
    },
    {
      title: "Réponses aux campagnes",
      value: kpis.casesThisMonth,
      note: "Interactions ce mois-ci",
      icon: <MdOutlineAssignmentTurnedIn size={20} />,
      iconClass: "text-blue-500",
      iconWrapClass: "bg-blue-500/10",
    },
    {
      title: "Patients en retard de contrôle",
      value: kpis.openCases,
      note: "Action médicale require",
      icon: <IoWarningOutline size={20} />,
      iconClass: "text-amber-500",
      iconWrapClass: "bg-amber-500/10",
    },
  ];

  return (
    <div className="p-4 md:p-6 xl:p-8 w-full">
      <DashboardHeader
        title="Tableau de bord préventif"
        subtitle="Vue d’ensemble des patients, dossiers et activité clinique."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.title} item={item} />
        ))}
      </div>

      <div className="grid grid-rows-1 mt-5">
        {/* MAIN */}

        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 space-y-5 space-x-4">
          <PreventivePipeline data={pipeline} />
          <MonthActivity
            data={{}}
          />
          <QuickActions />
        </div>

        {/* <Suspense fallback={<LastAccessTableSkeleton />}>
            <LastAccessSection userId={userId} tenantId={tenantId} />
          </Suspense> */}
      </div>

      <div className="grid grid-rows-1 mt-5">
        <div className="grid grid-cols-1 space-x-4">
          <ActiveCampaignsTable />
        </div>
      </div>

      <div className="grid grid-rows-1 mt-5">
        <div className="grid grid-cols-1 xl:grid-cols-3 space-x-4">
          <FollowedPathologies />
          <RecentActivity items={activity} />
        </div>
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////
// 🧠 PIPELINE COMPONENT
////////////////////////////////////////////////////////////

function PreventivePipeline({ data }: { data: any }) {
  const items = [
    { label: "À réaliser", value: data.open, color: "bg-primary" },
    { label: "Réalisés", value: data.completed, color: "bg-emerald-500" },
    { label: "En retard", value: data.cancelled, color: "bg-red-500" },
  ];

  return (
    <section className="rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800 col-span-2">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#111518] dark:text-gray-100">
            Suivis préventifs
          </h2>
          <p className="text-xs text-[#5f7586]">
            État global des suivis et contrôles.
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
    <section className="rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800 col-span-2">
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
    <section className="rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800 col-span-1">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#5f7586]">
        Actions rapides
      </h2>

      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`flex h-11 items-center justify-between rounded-xl px-4 text-sm font-bold transition ${action.primary
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

////////////////////////////////////////////////////////////
// 🕘 ACTIVITY COMPONENT
////////////////////////////////////////////////////////////

function MonthActivity({ data }: { data: any }) {
  const items = [
    { label: "Rappels envoyés", value: 3256, color: "bg-blue-500" },
    { label: "Contrôles réalisés", value: 1842, color: "bg-emerald-500" },
    { label: "Nouveaux suivis", value: 256, color: "bg-red-500" },
    { label: "Retards de contrôle", value: 42, color: "bg-red-500" },
  ];

  return (
    <section className="rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800 col-span-2">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#111518] dark:text-gray-100">
            Activité du mois
          </h2>
          <p className="text-xs text-[#5f7586]">
            Aperçu rapide de l'activité.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
// 📣 CAMPAIGNS PLACEHOLDER COMPONENT
////////////////////////////////////////////////////////////

function ActiveCampaignsTable() {
  const campaigns: CampaignItem[] = [
    {
      campagne: "Prise de sang – Diabète",
      cible: "Patients à risque",
      envoyes: 842,
      reponses: 318,
      taux: "37,8%",
      statut: "En cours",
      tone: "primary",
    },
    {
      campagne: "Contrôle tensionnel",
      cible: "Hypertension",
      envoyes: 624,
      reponses: 271,
      taux: "43,4%",
      statut: "Active",
      tone: "emerald",
    },
    {
      campagne: "Vaccination grippe",
      cible: "65 ans et plus",
      envoyes: 1205,
      reponses: 489,
      taux: "40,6%",
      statut: "Planifiée",
      tone: "amber",
    },
  ];

  type CampaignTone = "primary" | "emerald" | "amber";

  type CampaignItem = {
    campagne: string;
    cible: string;
    envoyes: number;
    reponses: number;
    taux: string;
    statut: string;
    tone: CampaignTone;
  };

  const statusClass: Record<CampaignTone, string> = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
  };


  return (
    <section className="col-span-2 rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#111518] dark:text-gray-100">
            Campagnes en cours
          </h2>
          <p className="text-xs text-[#5f7586]">
            Suivi des campagnes de prévention et des réponses patients.
          </p>
        </div>

        <button className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">
          Voir tout
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#eaedf0] dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-225 w-full text-left">
            <thead className="bg-[#f8fafb] dark:bg-gray-700/50">
              <tr>
                {[
                  "Campagne",
                  "Cible",
                  "Envoyés",
                  "Réponses",
                  "Taux de réponse",
                  "Statut",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#5f7586]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eaedf0] dark:divide-gray-700">
              {campaigns.map((item) => (
                <tr
                  key={item.campagne}
                  className="bg-white transition hover:bg-[#f8fafb] dark:bg-slate-800 dark:hover:bg-gray-700/40"
                >
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-[#111518] dark:text-gray-100">
                      {item.campagne}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-sm text-[#5f7586]">
                    {item.cible}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-[#111518] dark:text-gray-100">
                    {item.envoyes.toLocaleString("fr-BE")}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-[#111518] dark:text-gray-100">
                    {item.reponses.toLocaleString("fr-BE")}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#111518] dark:text-gray-100">
                        {item.taux}
                      </span>
                      <div className="h-2 w-20 rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: item.taux }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${statusClass[item.tone]}`}
                    >
                      {item.statut}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <button className="rounded-lg border border-[#eaedf0] px-3 py-1.5 text-xs font-bold text-[#111518] hover:bg-[#f8fafb] dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700">
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

////////////////////////////////////////////////////////////
// 🧬 PATHOLOGIES COMPONENT
////////////////////////////////////////////////////////////


function FollowedPathologies() {

  type PathologyTone =
    | "red"
    | "emerald"
    | "purple"
    | "amber"
    | "green"
    | "rose"
    | "slate";

  type PathologyItem = {
    label: string;
    percentage: number;
    icon: React.ReactNode;
    tone: PathologyTone;
  };

  const PATHOLOGY_TONE_CLASS: Record<
    PathologyTone,
    {
      text: string;
      bar: string;
    }
  > = {
    red: {
      text: "text-red-500",
      bar: "bg-red-500",
    },
    emerald: {
      text: "text-emerald-400",
      bar: "bg-emerald-400",
    },
    purple: {
      text: "text-purple-400",
      bar: "bg-purple-400",
    },
    amber: {
      text: "text-amber-400",
      bar: "bg-amber-400",
    },
    green: {
      text: "text-green-400",
      bar: "bg-green-400",
    },
    rose: {
      text: "text-rose-400",
      bar: "bg-rose-400",
    },
    slate: {
      text: "text-slate-300",
      bar: "bg-slate-300",
    },
  };

  const items: PathologyItem[] = [
    {
      label: "Diabète",
      percentage: 32,
      icon: <FaTint />,
      tone: "red",
    },
    {
      label: "Hypertension artérielle",
      percentage: 24,
      icon: <FaHeartbeat />,
      tone: "emerald",
    },
    {
      label: "Dyslipidémie",
      percentage: 16,
      icon: <FaDna />,
      tone: "purple",
    },
    {
      label: "Thyroïde",
      percentage: 10,
      icon: <MdHealthAndSafety />,
      tone: "amber",
    },
    {
      label: "Suivi grossesse",
      percentage: 8,
      icon: <FaBaby />,
      tone: "green",
    },
    {
      label: "Vaccination",
      percentage: 6,
      icon: <FaSyringe />,
      tone: "rose",
    },
    {
      label: "Autres",
      percentage: 4,
      icon: <BsThreeDots />,
      tone: "slate",
    },
  ];

  return (
    <section className="rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800 col-span-1">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#111518] dark:text-gray-100">
            Pathologies les plus suivies
          </h2>
          <p className="mt-1 text-xs text-[#5f7586] dark:text-gray-400">
            Répartition des suivis par pathologie.
          </p>
        </div>

        <button className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
          Voir toutes <span>→</span>
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const tone = PATHOLOGY_TONE_CLASS[item.tone];

          return (
            <div
              key={item.label}
              className="grid grid-cols-[150px_1fr_40px] items-center gap-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className={`text-sm ${tone.text}`}>
                  {item.icon}
                </span>
                <span className="truncate text-sm font-medium text-[#111518] dark:text-gray-100">
                  {item.label}
                </span>
              </div>

              <div className="truncate text-sm font-medium text-[#111518] dark:text-gray-100">
                <div
                  className={`h-2 rounded-full ${tone.bar}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <p className="text-right text-sm font-bold text-[#111518] dark:text-gray-100">
                {item.percentage}%
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}