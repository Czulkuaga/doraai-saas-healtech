"use client";

import { Toast } from "./toast-types";

const styles = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    info: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    danger: "bg-rose-500/10 border-rose-500/20 text-rose-400",
};

export function ToastItem({
    toast,
    onClose,
}: {
    toast: Toast;
    onClose: () => void;
}) {
    return (
        <div
            className={`rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-xl transition-all animate-in slide-in-from-right ${styles[toast.type ?? "info"]}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    {toast.title && (
                        <p className="text-sm font-semibold">{toast.title}</p>
                    )}
                    {toast.description && (
                        <p className="text-sm opacity-80 mt-1">{toast.description}</p>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="text-xs opacity-60 hover:opacity-100"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}