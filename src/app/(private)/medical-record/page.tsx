import Link from "next/link";
import { FaUserInjured } from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import { RiHeartPulseFill } from "react-icons/ri";
import { IoDocumentTextOutline } from "react-icons/io5";

export default function MedicalRecordPage() {
  return (
    <div className="p-4 md:p-6 xl:p-8 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#111518] dark:text-white">
          Module médical
        </h1>
        <p className="text-sm text-[#5f7586]">
          Gestion des patients, professionnels et dossiers préventifs.
        </p>
      </div>

      {/* QUICK ACTIONS */}
      <QuickActions />

      {/* MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ModuleCard
          title="Patients"
          description="Gestion des patients et profils médicaux."
          href="/medical-record/patients"
          icon={<FaUserInjured />}
        />

        <ModuleCard
          title="Professionnels"
          description="Réseau médical et profils des prestataires."
          href="/medical-record/providers"
          icon={<MdMedicalServices />}
        />

        <ModuleCard
          title="Médecine préventive"
          description="Templates et dossiers préventifs."
          href="/medical-record/health-promotion"
          icon={<RiHeartPulseFill />}
        />

        <ModuleCard
          title="Templates"
          description="Modèles cliniques configurables."
          href="/medical-record/health-promotion/templates"
          icon={<IoDocumentTextOutline />}
        />
      </div>

      {/* MINI ACTIVIDAD */}
      <MiniActivity />
    </div>
  );
}

////////////////////////////////////////////////////////////
// 🧠 QUICK ACTIONS
////////////////////////////////////////////////////////////

function QuickActions() {
  const actions = [
    {
      label: "Nouveau patient",
      href: "/medical-record/patients?sort=recent&page=1&pageSize=5",
    },
    {
      label: "Nouveau professionnel",
      href: "/medical-record/professionals?sort=recent&page=1&pageSize=5",
    },
    {
      label: "Nouveau dossier",
      href: "/medical-record/health-promotion/cases/new",
    },
  ];

  return (
    <section className="rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#5f7586]">
        Actions rapides
      </h2>

      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:brightness-110 dark:bg-slate-700"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

////////////////////////////////////////////////////////////
// 🧱 MODULE CARD
////////////////////////////////////////////////////////////

function ModuleCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#eaedf0] bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-slate-800"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-[#111518] dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-[#5f7586]">
        {description}
      </p>

      <span className="mt-4 inline-block text-xs font-bold text-primary group-hover:underline">
        Accéder →
      </span>
    </Link>
  );
}

////////////////////////////////////////////////////////////
// 🕘 MINI ACTIVIDAD (simple demo)
////////////////////////////////////////////////////////////

function MiniActivity() {
  const items = [
    "Nouveau patient ajouté",
    "Dossier préventif créé",
    "Template mis à jour",
  ];

  return (
    <section className="rounded-2xl border border-[#eaedf0] bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-slate-800">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#5f7586]">
        Activité récente
      </h2>

      <ul className="space-y-2 text-sm text-[#111518] dark:text-gray-100">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary"></span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}