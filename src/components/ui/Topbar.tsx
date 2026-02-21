import { FaSearch } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { MdExpandMore } from "react-icons/md";

export function Topbar() {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <FaSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm"
            placeholder="Buscar pacientes, citas o expedientes..."
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