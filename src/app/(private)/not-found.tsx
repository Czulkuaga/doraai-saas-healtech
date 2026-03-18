"use client";

import { useRouter } from "next/navigation";

export default function PrivateNotFound() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-200 max-w-md w-full text-center">

                {/* Código */}
                <p className="text-5xl font-bold text-teal-400">404</p>

                {/* Título */}
                <h2 className="mt-4 text-lg font-semibold">
                    Page introuvable
                </h2>

                {/* Descripción */}
                <p className="mt-2 text-sm text-slate-400">
                    La page que vous recherchez n’existe pas ou a été déplacée.
                </p>

                {/* Acciones */}
                <div className="mt-6 flex gap-3 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
                    >
                        Retour
                    </button>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-400 transition"
                    >
                        Tableau de bord
                    </button>
                </div>
            </div>
        </div>
    );
}