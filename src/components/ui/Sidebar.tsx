import React from "react";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { ActiveNavLink } from "./ActiveNavLink";
import { SidebarGroup } from "./SidebarGroup";

// Icons
import { MdOutlineDashboard } from "react-icons/md";
import { FaRegCalendarAlt, FaUserInjured, FaUser } from "react-icons/fa";
import { LuFileSliders } from "react-icons/lu";
import { RiAdminFill } from "react-icons/ri";
import { GrHost } from "react-icons/gr";
import { IoMdSettings } from "react-icons/io";

// Medical Record Icons
import { FaUserMd, FaFileMedicalAlt, FaStethoscope } from "react-icons/fa";
import { MdMonitorHeart, MdMedication } from "react-icons/md";
import { LuClipboardList } from "react-icons/lu";
import { RiTestTubeFill } from "react-icons/ri";
import { GiSyringe } from "react-icons/gi";
import { IoDocumentText } from "react-icons/io5";
import { BsShieldExclamation } from "react-icons/bs";

export type SidebarClinic = { name: string; slug?: string | null };
export type SidebarUser = { name: string; email: string };

type NavItem = { key: string; href: string; icon: React.ReactNode; label: string };

const MAIN: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: <MdOutlineDashboard size={20} />, label: "Dashboard" },
  { key: "appointments", href: "/appointments", icon: <FaRegCalendarAlt size={20} />, label: "Appointments" },
  // Medical Records ahora es Group (no va aquí)
];

const SESSIONS: NavItem[] = [
  { key: "my_sessions", href: "/profile/sessions", icon: <FaUser size={20} />, label: "My Sessions" },
  { key: "tenant_sessions", href: "/settings/sessions", icon: <RiAdminFill size={20} />, label: "Tenant Sessions" },
];

const MEDICAL_RECORD_SECTIONS = [
  {
    title: "Base",
    items: [
      { key: "mr_patients", href: "/medical-record/patients", label: "Pacientes", icon: <FaUserInjured size={18} /> },
      { key: "mr_professionals", href: "/medical-record/professionals", label: "Profesionales", icon: <FaUserMd size={18} /> },
      { key: "mr_ps", href: "/medical-record/healt-promotion", label: "Promoción de la salud", icon: <FaFileMedicalAlt size={18} /> },
    ],
  },
  // {
  //   title: "Atención",
  //   items: [
  //     { key: "mr_encounters", href: "/medical-record/encounters", label: "Consultas / Encuentros", icon: <FaStethoscope size={18} /> },
  //     { key: "mr_vitals", href: "/medical-record/vitals", label: "Signos vitales", icon: <MdMonitorHeart size={18} /> },
  //     { key: "mr_diagnoses", href: "/medical-record/diagnoses", label: "Diagnósticos", icon: <LuClipboardList size={18} /> },
  //     { key: "mr_plan", href: "/medical-record/treatments", label: "Tratamientos / Plan", icon: <MdMedication size={18} /> },
  //   ],
  // },
  // {
  //   title: "Órdenes y resultados",
  //   items: [
  //     { key: "mr_orders", href: "/medical-record/orders", label: "Órdenes", icon: <RiTestTubeFill size={18} /> },
  //     { key: "mr_results", href: "/medical-record/results", label: "Resultados", icon: <RiTestTubeFill size={18} /> },
  //     { key: "mr_prescriptions", href: "/medical-record/prescriptions", label: "Recetas", icon: <IoDocumentText size={18} /> },
  //     { key: "mr_documents", href: "/medical-record/documents", label: "Documentos", icon: <IoDocumentText size={18} /> },
  //   ],
  // },
  // {
  //   title: "Seguimiento",
  //   items: [
  //     { key: "mr_allergies", href: "/medical-record/allergies", label: "Alergias", icon: <BsShieldExclamation size={18} /> },
  //     { key: "mr_history", href: "/medical-record/history", label: "Antecedentes", icon: <LuClipboardList size={18} /> },
  //     { key: "mr_problem_list", href: "/medical-record/problem-list", label: "Problemas activos", icon: <LuClipboardList size={18} /> },
  //     { key: "mr_vaccines", href: "/medical-record/vaccines", label: "Vacunas", icon: <GiSyringe size={18} /> },
  //   ],
  // },
  // {
  //   title: "Especialidades",
  //   items: [
  //     { key: "mr_physiotherapy", href: "/medical-record/physiotherapy", label: "Fisioterapia", icon: <FaUserMd size={18} /> },
  //     { key: "mr_psychology", href: "/medical-record/psychology", label: "Psicología", icon: <FaUserMd size={18} /> },
  //     { key: "mr_midwife", href: "/medical-record/midwife", label: "Matrona", icon: <FaUserMd size={18} /> },
  //     { key: "mr_nursing", href: "/medical-record/nursing", label: "Enfermería", icon: <FaUserMd size={18} /> },
  //   ],
  // },
];

export function Sidebar({ clinic, user }: { clinic: SidebarClinic; user: SidebarUser }) {
  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col fixed h-full z-50">
      {/* Tenant */}
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
          <GrHost size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">{clinic.name}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{clinic.slug ?? "—"}</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
          Menú Principal
        </p>

        {MAIN.map((it) => (
          <ActiveNavLink
            key={it.key}
            href={it.href}
            icon={it.icon}
            label={it.label}
            exact={it.href === "/dashboard"}
          />
        ))}

        {/* Group: Medical Records */}
        <SidebarGroup
          groupKey="medicalRecord"
          href="/medical-record"
          label="Historia Clínica"
          icon={<LuFileSliders size={20} />}
          sections={MEDICAL_RECORD_SECTIONS}
        />

        <div className="pt-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Sesiones
          </p>

          {SESSIONS.map((it) => (
            <ActiveNavLink key={it.key} href={it.href} icon={it.icon} label={it.label} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <ActiveNavLink href="/settings" icon={<IoMdSettings size={20} />} label="Settings" />

        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{user.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
