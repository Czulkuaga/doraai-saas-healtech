import { BiPlus } from "react-icons/bi";

type Props = {
    onCreate: () => void;
};

export default function RoleEmptyState({ onCreate }: Props) {
    return (
        <div className="rounded-3xl border border-dashed border-emerald-500/20 bg-white p-8 text-center shadow-sm dark:bg-slate-950">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Aucun rôle enregistré
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Ajoutez le premier rôle pour commencer.
            </p>
            <button
                type="button"
                onClick={onCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white"
            >
                <BiPlus className="h-4 w-4" />
                Créer un rôle
            </button>
        </div>
    );
}