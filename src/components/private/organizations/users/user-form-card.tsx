import type { ReactNode } from "react";

type UserFormCardProps = {
    title: string;
    description?: string;
    children: ReactNode;
};

export function UserFormCard({ title, description, children }: UserFormCardProps) {
    return (
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 md:px-6">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {title}
                </h1>
                {description ? (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {description}
                    </p>
                ) : null}
            </div>

            <div className="p-5 md:p-6">
                {children}
            </div>
        </section>
    );
}