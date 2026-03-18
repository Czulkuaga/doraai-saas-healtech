"use client"

import { FaSearch, FaBell } from "react-icons/fa";
import { MdExpandMore } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { useShellStore } from "@/store/ui/shell-store";

export function Topbar() {
  const toggleMobileSidebar = useShellStore((s) => s.toggleMobileSidebar);
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/70 px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/70">
      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="lg:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-indigo-300"
        aria-label="Abrir menú"
      >
        <GiHamburgerMenu size={20} />
      </button>
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <FaSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm"
            placeholder="Rechercher des patients, des rendez-vous ou des dossiers..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-primary transition-colors" type="button">
          <FaBell size={22}/>
          <span className="absolute top-0 -right-1 size-2.5 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full" />
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-transparent">
            <div className="w-full h-full" />
          </div>
          <MdExpandMore size={22} className="text-slate-400"/>
        </div>
      </div>
    </header>
  );
}