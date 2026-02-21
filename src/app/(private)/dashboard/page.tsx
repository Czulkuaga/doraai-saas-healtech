import { Suspense } from "react";
import { getAuthStatusCached } from "@/lib/auth/auth-cache";

// Types
import type { AlertItem } from "@/components/private/dashboard/ClinicalAlerts";

//Components
import { DashboardHeader, LastAccessSection, LastAccessTableSkeleton } from "@/components";
import { KpiGrid } from "@/components/";
import { ClinicalAlerts } from "@/components";

//Icons
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa";
import { RiMoneyEuroBoxFill } from "react-icons/ri";
import { FaStopwatch } from "react-icons/fa";

import { PiJarLabel } from "react-icons/pi";
import { MdDescription } from "react-icons/md";
import { MdOutlinePriorityHigh } from "react-icons/md";
import { RiCalendarScheduleLine } from "react-icons/ri";




export default async function DashboardPage() {
  const st = await getAuthStatusCached();
  if (!st.ok) return null;

  const { userId, tenantId } = st.session;

  const kpis = [
    {
      title: "Citas de Hoy",
      value: "24",
      note: "Próxima cita en 15 min",
      icon: <FaRegCalendarAlt size={20} />,
      iconClass: "text-[#13ecda] dark:text-[#0ab9c1]",
      iconWrapClass: "bg-[#13ecda]/10",
      badge: { text: "+12.5%", icon: "trending_up", className: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
    },
    {
      title: "Pacientes Atendidos",
      value: "142",
      icon: <FaUserCheck size={20} />,
      iconClass: "text-blue-500",
      iconWrapClass: "bg-blue-500/10",
      progress: { value: 65, barClass: "bg-blue-500" },
    },
    {
      title: "Ingresos del Mes",
      value: "$12,450",
      note: "Meta: $15,000",
      icon: <RiMoneyEuroBoxFill size={20} />,
      iconClass: "text-emerald-500",
      iconWrapClass: "bg-emerald-500/10",
      badge: { text: "+8%", className: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" },
    },
    {
      title: "Pacientes en Espera",
      value: "8",
      note: "Tiempo medio: 12 min",
      noteClassName: "text-amber-600 font-medium",
      icon: <FaStopwatch size={20} />,
      iconClass: "text-amber-500",
      iconWrapClass: "bg-amber-500/10",
    },
  ];

  const alerts: AlertItem[] = [
    { tone: "amber", icon: <PiJarLabel size={20} />, title: "Resultados Listos", desc: "Resultados de laboratorio disponibles para Carlos Slim.", time: "Hace 5 min" },
    { tone: "primary", icon: <MdDescription size={20} />, title: "Reporte Firmado", desc: "Dr. Smith ha firmado el reporte post-operatorio.", time: "Hace 45 min" },
    { tone: "red", icon: <MdOutlinePriorityHigh size={20} />, title: "Cita Cancelada", desc: "Paciente Laura Mena canceló su cita de las 4 PM.", time: "Hace 2 horas" },
    { tone: "blue", icon: <RiCalendarScheduleLine size={20} />, title: "Nueva Cita", desc: "Agendada cita de control para Juan Perez el 24/10.", time: "Hace 3 horas" },
  ];

  return (

    <div className="p-8">
      <DashboardHeader
        title="Panel de Control General"
        subtitle="Bienvenido de nuevo, aquí tienes el resumen del día de hoy."
      />

      <KpiGrid items={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Suspense fallback={<LastAccessTableSkeleton />}>
          <LastAccessSection userId={userId} tenantId={tenantId} />
        </Suspense>
        <ClinicalAlerts count={5} items={alerts} />
      </div>
    </div>

  );
}