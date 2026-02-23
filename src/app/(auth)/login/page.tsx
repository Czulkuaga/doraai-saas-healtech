import { FormLogin } from "@/components";
import { SiBaremetrics } from "react-icons/si";

type LoginSearchParams = {
  reason?: string;
};

type Banner = {
  title: string;
  message: string;
  tone: "info" | "warning" | "danger";
};

const BANNERS: Record<string, Banner> = {
  session_expired: {
    title: "Sesión expirada",
    message: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
    tone: "warning",
  },
  session_revoked: {
    title: "Sesión revocada",
    message:
      "Tu sesión fue revocada (por ejemplo, porque iniciaste sesión en otro dispositivo). Inicia sesión de nuevo.",
    tone: "warning",
  },
  session_idle: {
    title: "Sesión cerrada por inactividad",
    message:
      "Por seguridad, tu sesión se cerró por inactividad. Inicia sesión para continuar.",
    tone: "warning",
  },
  not_authenticated: {
    title: "Acceso requerido",
    message: "Necesitas iniciar sesión para continuar.",
    tone: "info",
  },
  tenant_mismatch: {
    title: "Clínica incorrecta",
    message:
      "Estás intentando acceder a una clínica diferente a la de tu sesión. Verifica el subdominio e inicia sesión de nuevo.",
    tone: "danger",
  },
  user_inactive: {
    title: "Usuario inactivo",
    message:
      "Tu cuenta está deshabilitada. Contacta al administrador de la clínica para reactivación.",
    tone: "danger",
  },
};

function Alert({ reason }: { reason?: string }) {
  if (!reason) return null;

  const b = BANNERS[reason];
  if (!b) return null;

  const toneStyles: Record<Banner["tone"], string> = {
    info:
      "border-slate-200/70 bg-white/70 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
    warning:
      "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 dark:border-amber-500/30 dark:bg-amber-500/10",
    danger:
      "border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200 dark:border-rose-500/30 dark:bg-rose-500/10",
  };

  const iconByTone: Record<Banner["tone"], string> = {
    info: "info",
    warning: "warning",
    danger: "error",
  };

  return (
    <div className={`mb-4 rounded-xl border px-4 py-3 ${toneStyles[b.tone]}`}>
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined mt-0.5 text-base">
          {iconByTone[b.tone]}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5">{b.title}</p>
          <p className="mt-0.5 text-sm leading-5 opacity-90">{b.message}</p>
        </div>
      </div>
    </div>
  );
}

export default async function page({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const sp = await searchParams;
  const reason = sp?.reason;

  return (
    <section className="bg-[#f6f8f8] dark:bg-[#102220] min-h-screen flex items-center justify-center font-display transition-colors duration-300">
      <div className="flex w-full min-h-screen overflow-hidden">
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-16 lg:px-24 bg-[#f6f8f8] dark:bg-[#102220]">
          <div className="max-w-md w-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-[#13ecda] p-2 rounded-lg text-[#102220] shadow-lg shadow-[#13ecda]/20">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  ></path>
                  <path
                    clipRule="evenodd"
                    d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                MediCloud<span className="text-[#13ecda]">.</span>
              </span>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Please enter your details to access your clinic dashboard.
              </p>
            </div>

            {/* ✅ Nuevo banner unificado */}
            <Alert reason={reason} />

            <FormLogin />
          </div>
        </div>

        <div className="hidden lg:flex w-1/2 relative bg-[#102220] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-[#13ecda]/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-100 h-100 bg-[#13ecda]/5 rounded-full blur-[100px]"></div>
          </div>

          <div className="relative z-10 w-full h-full flex flex-col justify-between p-16">
            <div className="flex justify-end">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-sm font-medium flex items-center gap-2 border border-white/10">
                <span className="w-2 h-2 bg-[#13ecda] rounded-full animate-pulse"></span>
                System Online
              </span>
            </div>

            <div className="max-w-xl">
              <div className="inline-flex p-3 bg-[#13ecda]/20 backdrop-blur-sm rounded-xl mb-6">
                <SiBaremetrics size={30} className="text-[#13ecda] text-3xl" />
              </div>

              <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                Modern Care for <br />
                <span className="text-[#13ecda] italic">Modern Clinics.</span>
              </h2>

              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                Streamline your patient management with our intuitive interface.
                Access records, schedule appointments, and manage billing from one
                unified secure portal.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  <p className="text-[#13ecda] font-bold text-2xl mb-1">99.9%</p>
                  <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
                    Uptime SLA
                  </p>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  <p className="text-[#13ecda] font-bold text-2xl mb-1">HIPAA</p>
                  <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
                    Compliant Security
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-3">
                <img
                  alt="Doctor 1"
                  className="w-10 h-10 rounded-full border-2 border-[#102220]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_bb4IRnUEbHGc181MTDRMbg4qxfKtCdm8aS3pepKEMTCwZ1HmzYcdfBQyO37mHKA0muJkJDGuF3UA_OiAQkzF376KZrXlByAm3a82bP45n82mA4M1K-HVI1EGWN-9O-C3Pytdo7URjv5Phgzl1NQFqZmi3hz743qPUG5govObFIVEcrBp4endD120j8RUs74mbce0TcGknt20Geqko_oeQuymRvWci7s9ZEuu95zxsNTejPunuLp74yzGYtEkAY29STh7STjl1p2y"
                />
                <img
                  alt="Doctor 2"
                  className="w-10 h-10 rounded-full border-2 border-[#102220]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWpsQdOLXitkyk94dpHhawcGIZPFF7OUXCsLQIn32Kv7IkAWxBVFrF8QZj4UWlsM3VtohlSgOA3y6tUS7Cc3wl281ZPF0iqm3CpPcpSG-EhjPYJZqxb1HwWR9sZwyusOUUE3doZfl8Sn-897_P_njy8TKod0d-h1sHe058gs15cBktiujp5DJGGe9GSaasGP9SS2MZI8MzvnwVVKzgIEYsXzPCMvT5dgM_XtULPZmqXnv5RjgajktymSQDseSnP41LjgBXA6Q5TXKI"
                />
                <img
                  alt="Doctor 3"
                  className="w-10 h-10 rounded-full border-2 border-[#102220]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3lqkK4JGyJLvjaWdjqGjWqy9659li0I6Kfw4yvOX0SC4OvnF6Saxg8DI0oIEU9Y_67um5lpI8oH5_oUh12rcupVFCEgO-pjWSN2P9wF4Io5JIxtVrlyWV8b5HQ4oh7-H5yVMjnAiIIiJ-oRYhOKx6RRxFdAgdiLXc1-Yl4gFTVBCWUIBdB7o_y3gr9Qc-kEh1Y30dXherct4vG5O2Npcau-P97Ob79uUupxzxaGO9BP58VdRRTFWUEvlw3SUind2s8hCXj8-YmYyQ"
                />
                <div className="w-10 h-10 rounded-full border-2 border-[#102220] bg-[#13ecda] flex items-center justify-center text-xs font-bold text-slate-900">
                  +2k
                </div>
              </div>
              <p className="text-slate-400 text-sm">Trusted by clinics worldwide</p>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 w-full opacity-20 pointer-events-none">
            <svg
              className="w-full h-auto text-[#13ecda]"
              viewBox="0 0 1000 400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="opacity-50"
                d="M0 300 Q 250 150 500 300 T 1000 300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              ></path>
              <path
                className="opacity-30"
                d="M0 320 Q 250 170 500 320 T 1000 320"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              ></path>
              <path
                className="opacity-30"
                d="M0 280 Q 250 130 500 280 T 1000 280"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}