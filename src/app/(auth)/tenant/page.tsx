import { MdDomain } from "react-icons/md";

import { FaArrowLeft } from "react-icons/fa";
import { SiAdguard } from "react-icons/si";
import { IoLockClosed } from "react-icons/io5";
import { FormTenant } from "@/components";

export default function page() {
    return (
        <section className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-40 dark:opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#13ecda]/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#13ecda]/10 rounded-full blur-[80px]"></div>
            </div>
            <div className="w-full max-w-xl">

                <div className="mb-8 text-center">
                    <div className="inline-block relative mb-6">
                        <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                            <img alt="Medical Workspace" className="w-full h-full object-cover" data-alt="A clean modern medical clinic workspace illustration" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI9a2OviQEYIEZSWKptNVmZaRun0r5jiR540opBumBZLUkr3-Ux_7ZJ5I8JHyGKuywnJ4ATYYmVfCPqZ4xJp5d1wnuNaV-jbHoChI8P1x8Anfw2crpbK44n70FKqaHWX-o--fPV3p8fU1GpTHrey47rjN3lqMbvnztZfFxDCsS6Hfl_aeAMSo4mgv4zKzF_wQER9AaHUBU5qq5KuCTgHQZ56N3UHePaw7XMT6PnrP4_vrHw8l7XsL8V8s-bNnjDxBwJzqSb-Q-qEFB" />
                        </div>
                        <div className="absolute -bottom-4 -right-4 bg-[#13ecda] text-[#102220] p-3 rounded-xl shadow-lg">
                            <MdDomain size={20} className="text-3xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-8">
                        <div className="mb-6">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Find your workspace</h1>
                            <p className="text-slate-600 dark:text-slate-400">Enter the unique URL or clinic name provided to your organization to continue to sign in.</p>
                        </div>
                        <FormTenant />
                    </div>

                    {/* <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#13ecda] dark:hover:text-[#13ecda] transition-colors flex items-center gap-1.5">
                            <FaArrowLeft size={16} className="text-lg" />
                            Back to Login
                        </button>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                            <span>Can't find it?</span>
                            <a className="font-semibold text-[#13ecda] hover:underline" href="#">Contact Support</a>
                        </div>
                    </div> */}
                </div>

                <div className="mt-8 flex justify-center items-center gap-8 grayscale opacity-50 dark:invert">
                    <div className="flex items-center gap-2">
                        <SiAdguard size={20} className="text-slate-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-600">HIPAA Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <IoLockClosed size={20} className="text-slate-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-600">256-bit Encryption</span>
                    </div>
                </div>
            </div>
        </section>
    )
}