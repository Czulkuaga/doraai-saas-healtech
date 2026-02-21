import React from "react";
import { FaTools } from "react-icons/fa";

type Props = {
    title?: string;
    description?: string;
    module?: string;
};

export function PageUnderConstruction({
    title = "Página en construcción",
    description = "Estamos trabajando en este módulo. Muy pronto estará disponible.",
    module,
}: Props) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-24 px-6">
            {/* Icon */}
            <div className="mb-6 size-20 rounded-full bg-primary/10 flex items-center justify-center">
                <FaTools size={32} className="text-primary" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {title}
            </h1>

            {/* Optional Module Name */}
            {module ? (
                <p className="mt-2 text-sm text-primary font-semibold uppercase tracking-wide">
                    {module}
                </p>
            ) : null}

            {/* Description */}
            <p className="mt-4 max-w-md text-slate-500 dark:text-slate-400 text-sm">
                {description}
            </p>

            {/* Decorative Divider */}
            <div className="mt-8 w-24 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
    );
}
