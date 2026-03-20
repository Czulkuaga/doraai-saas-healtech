"use client";

import * as React from "react";
import {
    evaluatePasswordRules,
    getPasswordStrength,
} from "./password-rules";

type Props = {
    password: string;
    confirmPassword: string;
    mode: "create" | "edit";
};

function ruleTextClass(valid: boolean) {
    return valid
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-slate-500 dark:text-slate-400";
}

function ruleDotClass(valid: boolean) {
    return valid
        ? "bg-emerald-500"
        : "bg-slate-300 dark:bg-slate-700";
}

function strengthBarClass(index: number, score: number) {
    const active = index < Math.min(score, 5);

    if (!active) return "bg-slate-200 dark:bg-slate-800";
    if (score <= 2) return "bg-rose-500";
    if (score <= 4) return "bg-amber-500";
    return "bg-emerald-500";
}

export function PasswordStrengthHint({
    password,
    confirmPassword,
    mode,
}: Props) {
    const safePassword = password ?? "";
    const safeConfirmPassword = confirmPassword ?? "";

    const rules = React.useMemo(
        () => evaluatePasswordRules(safePassword, safeConfirmPassword),
        [safePassword, safeConfirmPassword]
    );

    const strength = React.useMemo(
        () => getPasswordStrength(safePassword),
        [safePassword]
    );

    const showContent =
        safePassword.length > 0 ||
        safeConfirmPassword.length > 0 ||
        mode === "create";

    if (!showContent) return null;

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Sécurité du mot de passe
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {mode === "edit"
                            ? "Laissez vide pour conserver le mot de passe actuel."
                            : "Le mot de passe doit respecter toutes les conditions ci-dessous."}
                    </p>
                </div>

                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {safePassword.length > 0 ? strength.label : "—"}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition ${strengthBarClass(i, strength.score)}`}
                    />
                ))}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {rules.map((rule) => (
                    <div key={rule.key} className="flex items-center gap-2">
                        <span
                            className={`h-2 w-2 rounded-full transition ${ruleDotClass(rule.valid)}`}
                        />
                        <span className={`text-xs ${ruleTextClass(rule.valid)}`}>
                            {rule.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}