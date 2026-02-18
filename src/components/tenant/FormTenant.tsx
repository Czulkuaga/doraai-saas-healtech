"use client";

import { useEffect, useMemo, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { z } from "zod";
import { tenantSchema, type TenantInput } from "@/lib/zod/tenant";
import { slugifyTenant } from "@/lib/slug";

type FieldErrors = Partial<Record<keyof TenantInput, string>>;

function zodFieldErrors(err: z.ZodError): FieldErrors {
    const out: FieldErrors = {};
    for (const issue of err.issues) {
        const key = issue.path?.[0] as keyof TenantInput | undefined;
        if (!key) continue;
        if (!out[key]) out[key] = issue.message;
    }
    return out;
}

type TenantOption = { slug: string; name: string };

type ResolveResponse =
    | { ok: true; slug: string; name?: string }
    | { ok: true; options: TenantOption[] }
    | { ok: false; message: string };

function TenantPickerModal(props: {
    open: boolean;
    options: TenantOption[];
    domain: string;
    onClose: () => void;
    onSelect: (slug: string) => void;
}) {
    const { open, options, domain, onClose, onSelect } = props;

    const [q, setQ] = useState("");

    useEffect(() => {
        if (!open) return;
        setQ("");
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return options;
        return options.filter((o) => {
            return (
                o.name.toLowerCase().includes(needle) ||
                o.slug.toLowerCase().includes(needle)
            );
        });
    }, [q, options]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Select your clinic"
        >
            {/* overlay */}
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
                onClick={onClose}
                aria-label="Close"
            />

            {/* modal */}
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                Select your clinic
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                We found multiple clinics. Choose the correct one to continue.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-2 py-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    {/* search */}
                    <div className="mt-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                search
                            </span>
                            <input
                                autoFocus
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#13ecda] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                                placeholder="Search by clinic name or workspace..."
                            />
                        </div>
                    </div>
                </div>

                <div className="p-3 max-h-90 overflow-auto">
                    {filtered.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            No results. Try a different search.
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {filtered.map((o) => (
                                <li key={o.slug}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(o.slug)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50 hover:border-slate-300 transition dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {o.name}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    {o.slug}.{domain}
                                                </div>
                                            </div>

                                            <span className="material-symbols-outlined text-slate-400">
                                                chevron_right
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Tip: You can type the workspace URL too (slug).
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export const FormTenant = () => {
    const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "medicloud.com";

    const [values, setValues] = useState<TenantInput>({ workspace: "" });
    const [touched, setTouched] = useState<Partial<Record<keyof TenantInput, boolean>>>({});
    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);

    const [isResolving, setIsResolving] = useState(false);

    // modal state
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerOptions, setPickerOptions] = useState<TenantOption[]>([]);

    const previewSlug = useMemo(() => slugifyTenant(values.workspace), [values.workspace]);
    const workspaceError = touched.workspace ? errors.workspace : undefined;

    function validateAll(next: TenantInput) {
        const parsed = tenantSchema.safeParse(next);
        if (parsed.success) {
            setErrors({});
            return { ok: true as const, data: parsed.data };
        }
        setErrors(zodFieldErrors(parsed.error));
        return { ok: false as const };
    }

    function validateField(next: TenantInput) {
        const parsed = tenantSchema.safeParse(next);
        if (parsed.success) {
            setErrors((p) => ({ ...p, workspace: undefined }));
            return;
        }
        const fe = zodFieldErrors(parsed.error);
        setErrors((p) => ({ ...p, workspace: fe.workspace }));
    }

    function goToTenant(slug: string) {
        const url = ROOT_DOMAIN === "localhost:3000" ? `http://${slug}.${ROOT_DOMAIN}/login` : `https://${slug}.${ROOT_DOMAIN}/login`;
        window.location.assign(url);
    }

    const canSubmit =
        !isResolving &&
        values.workspace.trim().length > 0 &&
        !errors.workspace &&
        previewSlug.length >= 2;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setTouched({ workspace: true });

        const res = validateAll(values);
        if (!res.ok) return;

        const slugGuess = slugifyTenant(res.data.workspace);
        if (slugGuess.length < 2) {
            setErrors((p) => ({ ...p, workspace: "Please enter a valid clinic/workspace." }));
            return;
        }

        try {
            setIsResolving(true);

            const r = await fetch("/api/tenant/resolve", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    query: res.data.workspace,
                    slugGuess,
                }),
            });

            const data = (await r.json()) as ResolveResponse;

            if (!r.ok || !data.ok) {
                setFormError(!data.ok ? data.message : "Could not resolve clinic.");
                return;
            }

            if ("options" in data) {
                setPickerOptions(data.options);
                setPickerOpen(true);
                return;
            }

            // single tenant
            goToTenant(data.slug);
        } catch {
            setFormError("Network error. Please try again.");
        } finally {
            setIsResolving(false);
        }
    }

    return (
        <>
            <TenantPickerModal
                open={pickerOpen}
                options={pickerOptions}
                domain={ROOT_DOMAIN}
                onClose={() => setPickerOpen(false)}
                onSelect={(slug) => goToTenant(slug)}
            />

            <form className="space-y-6" onSubmit={onSubmit} noValidate>
                {formError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                        {formError}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="workspace-url">
                        Clinic Name or Workspace URL
                    </label>

                    <div className="relative group">
                        <div className="flex items-center">
                            <input
                                className={[
                                    "flex-1 block w-full px-4 py-4 rounded-lg rounded-r-none border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500",
                                    "focus:ring-2 focus:ring-[#13ecda] focus:border-transparent",
                                    workspaceError
                                        ? "border-rose-300 dark:border-rose-900/60 focus:ring-rose-400/40"
                                        : "border-slate-200 dark:border-slate-700",
                                ].join(" ")}
                                id="workspace-url"
                                name="workspace-url"
                                placeholder="e.g. City General Hospital"
                                type="text"
                                value={values.workspace}
                                disabled={isResolving}
                                onChange={(e) => {
                                    setFormError(null);
                                    const next = { workspace: e.target.value };
                                    setValues(next);
                                    if (touched.workspace) validateField(next);
                                }}
                                onBlur={() => {
                                    setTouched((p) => ({ ...p, workspace: true }));
                                    validateField(values);
                                }}
                                aria-invalid={!!workspaceError}
                                aria-describedby={workspaceError ? "workspace-error" : "workspace-help"}
                            />

                            <div className="bg-slate-100 dark:bg-slate-700 border border-l-0 border-slate-200 dark:border-slate-700 px-4 py-4 rounded-r-lg text-slate-500 dark:text-slate-400 font-medium select-none">
                                .{ROOT_DOMAIN}
                            </div>
                        </div>

                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Preview:{" "}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {previewSlug || "—"}
                            </span>
                            .{ROOT_DOMAIN}
                        </div>

                        <div className="mt-2 min-h-4.5">
                            {workspaceError ? (
                                <p id="workspace-error" className="text-xs font-semibold text-rose-600 dark:text-rose-300">
                                    {workspaceError}
                                </p>
                            ) : (
                                <p
                                    id="workspace-help"
                                    className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    Hint: type the clinic name; we’ll show options if multiple match.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    className={[
                        "w-full bg-[#13ecda] hover:bg-[#13ecda]/90 text-[#102220] font-bold py-4 rounded-lg shadow-lg shadow-[#13ecda]/20 transition-all flex items-center justify-center gap-2 group",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                    ].join(" ")}
                    type="submit"
                    disabled={!canSubmit}
                >
                    <span className="inline-flex items-center gap-2">
                        {isResolving && (
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#102220]/30 border-t-[#102220]" />
                        )}
                        {isResolving ? "Checking workspace..." : "Continue"}
                    </span>
                    <FaArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </form>
        </>
    );
};