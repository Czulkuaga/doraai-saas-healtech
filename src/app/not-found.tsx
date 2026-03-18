"use client";

import { useRouter } from "next/navigation";

export default function GlobalNotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 px-4">
            <div className="max-w-md w-full text-center">

                {/* Código */}
                <p className="text-6xl font-bold text-teal-400">404</p>

                {/* Título */}
                <h1 className="mt-4 text-xl font-semibold">
                    Page introuvable
                </h1>

                {/* Descripción */}
                <p className="mt-2 text-sm text-slate-400">
                    La page que vous recherchez n’existe pas ou a été déplacée.
                </p>

                {/* Acciones */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
                    >
                        Retour
                    </button>

                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-400 transition"
                    >
                        Accueil
                    </button>
                </div>
            </div>
        </div>
    );
}