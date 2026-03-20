export type ToastType = "success" | "info" | "warning" | "danger";

export type Toast = {
    id: string;
    title?: string;
    description?: string;
    type?: ToastType;
    duration?: number; // ms
};