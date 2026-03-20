"use client";

import { useToastContext } from "./toast-provider";

export function useToast() {
    const { showToast } = useToastContext();

    return {
        success: (title: string, description?: string) =>
            showToast({ type: "success", title, description }),

        error: (title: string, description?: string) =>
            showToast({ type: "danger", title, description }),

        warning: (title: string, description?: string) =>
            showToast({ type: "warning", title, description }),

        info: (title: string, description?: string) =>
            showToast({ type: "info", title, description }),
    };
}