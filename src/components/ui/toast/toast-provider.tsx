"use client";

import * as React from "react";
import { Toast } from "./toast-types";
import { ToastItem } from "./toast";

type ToastContextType = {
    showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    function showToast(toast: Omit<Toast, "id">) {
        const id = crypto.randomUUID();

        const newToast: Toast = {
            id,
            duration: 4000,
            type: "info",
            ...toast,
        };

        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, newToast.duration);
    }

    function remove(id: string) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Container */}
            <div className="fixed top-4 right-4 z-9999 flex flex-col gap-3 w-full max-w-sm">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => remove(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToastContext() {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error("useToastContext must be used inside ToastProvider");
    return ctx;
}