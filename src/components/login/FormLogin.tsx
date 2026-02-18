"use client";

import React, { useMemo, useState } from "react";
import { FiLock } from "react-icons/fi";
import { LuMailCheck } from "react-icons/lu";
import { FaArrowLeft } from "react-icons/fa";
import { loginSchema, type LoginInput } from "@/lib/zod/auth";
import type { z } from "zod";
import Link from "next/link";

type FieldErrors = Partial<Record<keyof LoginInput, string>>;

function zodFieldErrors(err: z.ZodError): FieldErrors {
    const out: FieldErrors = {};
    for (const issue of err.issues) {
        const key = issue.path?.[0] as keyof LoginInput | undefined;
        if (!key) continue;
        // solo tomamos el primero por campo
        if (!out[key]) out[key] = issue.message;
    }
    return out;
}

export const FormLogin = () => {
    const [values, setValues] = useState<LoginInput>({
        email: "",
        password: "",
        remember: true,
    });

    const [touched, setTouched] = useState<Partial<Record<keyof LoginInput, boolean>>>({});
    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);

    const [isAuthing, setIsAuthing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isDirty = useMemo(() => {
        return values.email.trim() !== "" || values.password !== "" || values.remember !== true;
    }, [values]);

    function validateAll(next: LoginInput) {
        const parsed = loginSchema.safeParse(next);
        if (parsed.success) {
            setErrors({});
            return { ok: true as const, data: parsed.data };
        }
        const fieldErrors = zodFieldErrors(parsed.error);
        setErrors(fieldErrors);
        return { ok: false as const, error: parsed.error };
    }

    function validateField<K extends keyof LoginInput>(key: K, next: LoginInput) {
        // Validación por campo: valida todo, pero muestra solo ese campo (y respeta el schema)
        const parsed = loginSchema.safeParse(next);
        if (parsed.success) {
            setErrors((prev) => ({ ...prev, [key]: undefined }));
            return;
        }
        const fe = zodFieldErrors(parsed.error);
        setErrors((prev) => ({ ...prev, [key]: fe[key] }));
    }

    const onChange =
        <K extends keyof LoginInput>(key: K) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setFormError(null);

                const next: LoginInput = {
                    ...values,
                    [key]: key === "remember" ? e.target.checked : e.target.value,
                } as LoginInput;

                setValues(next);

                // si ya fue tocado, validamos mientras escribe
                if (touched[key]) validateField(key, next);
            };

    const onBlur =
        <K extends keyof LoginInput>(key: K) =>
            () => {
                setTouched((prev) => ({ ...prev, [key]: true }));
                validateField(key, values);
            };

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);

        // marcar todo como touched
        setTouched({ email: true, password: true, remember: true });

        const parsed = validateAll(values);
        if (!parsed.ok) return;

        try {
            setIsAuthing(true);

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: values.email.trim().toLowerCase(),
                    password: values.password,
                    remember: values.remember,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                setFormError(data.message ?? "Invalid credentials.");
                return;
            }

            // 👇 ya estamos en subdominio correcto
            window.location.href = data.redirectTo ?? "/dashboard";

        } catch (err: any) {
            setFormError("Network error. Please try again.");
        } finally {
            setIsAuthing(false);
        }
    }

    const emailError = touched.email ? errors.email : undefined;
    const passwordError = touched.password ? errors.password : undefined;

    const canSubmit =
        !isAuthing &&
        // botón solo habilitado si tiene algo y no hay errores visibles en campos críticos
        values.email.trim().length > 0 &&
        values.password.length > 0 &&
        !errors.email &&
        !errors.password;

    return (
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
            {/* Error global */}
            {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                    {formError}
                </div>
            )}

            {/* EMAIL */}
            <div>
                <label
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                    htmlFor="email"
                >
                    Email Address
                </label>

                <div className="relative">
                    <LuMailCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        value={values.email}
                        onChange={onChange("email")}
                        onBlur={onBlur("email")}
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? "email-error" : undefined}
                        className={[
                            "w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border rounded-lg outline-none transition-all dark:text-white placeholder:text-slate-400",
                            "focus:ring-2 focus:ring-[#13ecda]/50 focus:border-[#13ecda]",
                            emailError
                                ? "border-rose-300 dark:border-rose-900/60 focus:ring-rose-400/40 focus:border-rose-400"
                                : "border-slate-200 dark:border-slate-700",
                        ].join(" ")}
                        id="email"
                        name="email"
                        placeholder="doctor@clinic.com"
                        type="email"
                        autoComplete="email"
                        disabled={isAuthing}
                    />
                </div>

                <div className="mt-2 min-h-4.5">
                    {emailError ? (
                        <p id="email-error" className="text-xs font-semibold text-rose-600 dark:text-rose-300">
                            {emailError}
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Use the email you registered with.
                        </p>
                    )}
                </div>
            </div>

            {/* PASSWORD */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                        Password
                    </label>
                    <button
                        type="button"
                        className="text-xs font-semibold text-[#13ecda] hover:text-[#13ecda]/80 transition-colors disabled:opacity-50"
                        onClick={() => setFormError("Password reset UI pending.")}
                        disabled={isAuthing}
                    >
                        Forgot Password?
                    </button>
                </div>

                <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        value={values.password}
                        onChange={onChange("password")}
                        onBlur={onBlur("password")}
                        aria-invalid={!!passwordError}
                        aria-describedby={passwordError ? "password-error" : undefined}
                        className={[
                            "w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-800 border rounded-lg outline-none transition-all dark:text-white placeholder:text-slate-400",
                            "focus:ring-2 focus:ring-[#13ecda]/50 focus:border-[#13ecda]",
                            passwordError
                                ? "border-rose-300 dark:border-rose-900/60 focus:ring-rose-400/40 focus:border-rose-400"
                                : "border-slate-200 dark:border-slate-700",
                        ].join(" ")}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        disabled={isAuthing}
                    />

                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        disabled={isAuthing}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {showPassword ? "visibility_off" : "visibility"}
                        </span>
                    </button>
                </div>

                <div className="mt-2 min-h-4.5">
                    {passwordError ? (
                        <p id="password-error" className="text-xs font-semibold text-rose-600 dark:text-rose-300">
                            {passwordError}
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Minimum 8 characters.
                        </p>
                    )}
                </div>
            </div>

            {/* REMEMBER */}
            <div className="flex items-center">
                <input
                    className="w-4 h-4 text-[#13ecda] bg-slate-100 border-slate-300 rounded focus:ring-[#13ecda] dark:focus:ring-[#13ecda] dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 disabled:opacity-60"
                    id="remember"
                    type="checkbox"
                    checked={values.remember}
                    onChange={onChange("remember")}
                    disabled={isAuthing}
                />
                <label className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400" htmlFor="remember">
                    Remember me for 30 days
                </label>
            </div>

            {/* SUBMIT */}
            <button
                className={[
                    "w-full bg-[#13ecda] text-slate-900 font-bold py-3.5 rounded-lg transition-all transform shadow-lg shadow-[#13ecda]/20",
                    "hover:bg-[#13ecda]/90 hover:scale-[1.01] active:scale-95",
                    "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100",
                ].join(" ")}
                type="submit"
                disabled={!canSubmit}
            >
                <span className="inline-flex items-center justify-center gap-2">
                    {isAuthing && (
                        <span
                            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900"
                            aria-hidden="true"
                        />
                    )}
                    {isAuthing ? "Signing in..." : "Sign In to Dashboard"}
                </span>
            </button>

            {/* Helper UX: aviso si no hay cambios */}
            {!isDirty && (
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Enter your credentials to continue.
                </p>
            )}

            <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link href={"/tenant"} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer">
                    <FaArrowLeft size={16} className="text-lg" />
                    Back to Search Tenant
                </Link>
                {/* <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <span>Can't find it?</span>
                    <a className="font-semibold text-primary hover:underline" href="#">Contact Support</a>
                </div> */}
            </div>
        </form>
    );
};