"use client";

type ConfirmDialogVariant = "danger" | "warning" | "info";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmDialogVariant;
    pending?: boolean;
    onConfirm: () => void | Promise<void>;
    onClose: () => void;
};

function getVariantStyles(variant: ConfirmDialogVariant) {
    switch (variant) {
        case "danger":
            return {
                iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                button:
                    "bg-rose-500 hover:bg-rose-600 text-white",
            };
        case "warning":
            return {
                iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                button:
                    "bg-amber-500 hover:bg-amber-600 text-white",
            };
        case "info":
        default:
            return {
                iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
                button:
                    "bg-cyan-500 hover:bg-cyan-600 text-white",
            };
    }
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    variant = "info",
    pending = false,
    onConfirm,
    onClose,
}: ConfirmDialogProps) {
    const styles = getVariantStyles(variant);

    if (!open) return null;

    async function handleConfirm() {
        await onConfirm();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.iconBg}`}
                    >
                        ⚠️
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            {title}
                        </h3>
                        {description ? (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={pending}
                        className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={pending}
                        className={`h-10 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-50 cursor-pointer ${styles.button}`}
                    >
                        {pending ? "Traitement..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}