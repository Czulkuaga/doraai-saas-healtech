"use client";

import {
    FormEvent,
    useEffect,
    useState,
    useTransition,
} from "react";

import {
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    LockKeyhole,
    ShieldCheck,
    X,
} from "lucide-react";

import { connectSimplyBookAction } from "../../../../action/integrations/simplybook/connect-simplybook.action";
import { getSimplyBookConnectionAction } from "../../../../action/integrations/simplybook/get-simplybook-connection.action";
import { verifySimplyBookTwoFactorAction } from "../../../../action/integrations/simplybook/verify-simplybook-2fa.action";

import type { SimplyBookConnectionSummary, SimplyBookAuthenticationMethod } from "@/lib/integrations/simplybook/simplybook.types";

type Props = {
    open: boolean;
    initialConnection: SimplyBookConnectionSummary;
    onClose: () => void;
    onConnected: (
        connection: SimplyBookConnectionSummary
    ) => void;
};

type ModalStep = "CREDENTIALS" | "TWO_FACTOR";

type AuthenticationMethodSelectorProps = {
    value: SimplyBookAuthenticationMethod;
    onChange: (
        method: SimplyBookAuthenticationMethod
    ) => void;
};

type FieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
};

type SecretFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    showSecret: boolean;
    onToggleVisibility: () => void;
    placeholder?: string;
    required?: boolean;
    helpText?: string;
};

export function SimplyBookConnectionModal({
    open,
    initialConnection,
    onClose,
    onConnected,
}: Props) {
    const [step, setStep] =
        useState<ModalStep>("CREDENTIALS");

    const [displayName, setDisplayName] =
        useState("");

    const [company, setCompany] = useState("");
    const [login, setLogin] = useState("");
    const [apiUserKey, setApiUserKey] =
        useState("");

    const [apiBaseUrl, setApiBaseUrl] = useState(
        "https://user-api-v2.simplybook.me"
    );

    const [twoFactorType, setTwoFactorType] =
        useState("");

    const [twoFactorCode, setTwoFactorCode] =
        useState("");

    const [allowedProviders, setAllowedProviders] =
        useState<string[]>([]);

    const [showSecret, setShowSecret] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [isPending, startTransition] =
        useTransition();

    const [authMethod, setAuthMethod] =
        useState<SimplyBookAuthenticationMethod>(
            "API_USER_KEY"
        );

    const [password, setPassword] = useState("");

    useEffect(() => {
        if (!open) {
            return;
        }

        setStep(
            initialConnection.status ===
                "TWO_FACTOR_REQUIRED"
                ? "TWO_FACTOR"
                : "CREDENTIALS"
        );

        setDisplayName(
            initialConnection.displayName ?? ""
        );

        setCompany(
            initialConnection.companyLogin ?? ""
        );

        setLogin(
            initialConnection.userLogin ?? ""
        );

        setApiBaseUrl(
            initialConnection.apiBaseUrl ??
            "https://user-api-v2.simplybook.me"
        );

        setApiUserKey("");
        setTwoFactorCode("");
        setAllowedProviders(
            initialConnection.allowed2faProviders
        );

        setTwoFactorType(
            initialConnection
                .allowed2faProviders[0] ?? ""
        );

        setAuthMethod(
            initialConnection.authMethod ?? "API_USER_KEY"
        );

        setApiUserKey("");
        setPassword("");
        setShowSecret(false);

        setError(null);
    }, [open, initialConnection]);

    if (!open) {
        return null;
    }

    async function reloadConnection() {
        const connectionResult =
            await getSimplyBookConnectionAction();

        if (!connectionResult.success) {
            throw new Error(
                connectionResult.error
            );
        }

        return connectionResult.connection;
    }

    function handleCredentialsSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
            const result = await connectSimplyBookAction({
                displayName:
                    displayName.trim() || undefined,

                apiBaseUrl: apiBaseUrl.trim(),
                company: company.trim(),
                login: login.trim(),

                authMethod,

                apiUserKey:
                    authMethod === "API_USER_KEY"
                        ? apiUserKey.trim() || undefined
                        : undefined,

                password:
                    authMethod === "USER_PASSWORD"
                        ? password || undefined
                        : undefined,
            });

            if (!result.success) {
                setError(result.error);
                return;
            }

            if (
                result.status ===
                "TWO_FACTOR_REQUIRED"
            ) {
                setAllowedProviders(
                    result.allowedProviders
                );

                setTwoFactorType(
                    result.allowedProviders[0] ?? ""
                );

                setStep("TWO_FACTOR");
                return;
            }

            try {
                const connection =
                    await reloadConnection();

                onConnected(connection);
            } catch (reloadError) {
                setError(
                    reloadError instanceof Error
                        ? reloadError.message
                        : "La connexion a été créée, mais son état n’a pas pu être rechargé."
                );
            }
        });
    }

    function handleTwoFactorSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
            const result =
                await verifySimplyBookTwoFactorAction(
                    {
                        type: twoFactorType,
                        code: twoFactorCode,
                    }
                );

            if (!result.success) {
                setError(result.error);
                return;
            }

            try {
                const connection =
                    await reloadConnection();

                onConnected(connection);
            } catch (reloadError) {
                setError(
                    reloadError instanceof Error
                        ? reloadError.message
                        : "La connexion a été validée, mais son état n’a pas pu être rechargé."
                );
            }
        });
    }

    const isExistingSelectedCredential =
        authMethod === "API_USER_KEY"
            ? initialConnection.authMethod ===
            "API_USER_KEY" &&
            initialConnection.hasApiUserKey
            : initialConnection.authMethod ===
            "USER_PASSWORD" &&
            initialConnection.hasPassword;

    const hasEnteredCredential =
        authMethod === "API_USER_KEY"
            ? Boolean(apiUserKey.trim())
            : Boolean(password);

    const canSubmitCredentials =
        Boolean(company.trim()) &&
        Boolean(login.trim()) &&
        Boolean(apiBaseUrl.trim()) &&
        (isExistingSelectedCredential ||
            hasEnteredCredential);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
            <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
                <div className="my-4 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:my-8">
                    <header className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                                Connecter SimplyBook.me
                            </h2>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {step === "CREDENTIALS"
                                    ? "Saisissez les identifiants API de votre entreprise."
                                    : "Confirmez le second facteur demandé par SimplyBook.me."}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                        >
                            <X className="size-5" />
                        </button>
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {step === "CREDENTIALS" ? (
                            <form
                                onSubmit={
                                    handleCredentialsSubmit
                                }
                                className="space-y-5 p-6"
                            >
                                <Field
                                    label="Nom de la connexion"
                                    value={displayName}
                                    onChange={setDisplayName}
                                    placeholder="SimplyBook Clinique Centrale"
                                />

                                <Field
                                    label="Company login"
                                    value={company}
                                    onChange={setCompany}
                                    placeholder="clinique-centrale"
                                    required
                                />

                                <Field
                                    label="Utilisateur"
                                    value={login}
                                    onChange={setLogin}
                                    placeholder="medicloud-integration"
                                    required
                                />

                                <AuthenticationMethodSelector
                                    value={authMethod}
                                    onChange={(method) => {
                                        setAuthMethod(method);
                                        setShowSecret(false);
                                        setError(null);
                                    }}
                                />

                                {authMethod === "API_USER_KEY" ? (
                                    <SecretField
                                        label="API User Key"
                                        value={apiUserKey}
                                        onChange={setApiUserKey}
                                        showSecret={showSecret}
                                        onToggleVisibility={() =>
                                            setShowSecret((current) => !current)
                                        }
                                        placeholder="api_user_key_..."
                                        required={
                                            !initialConnection.hasApiUserKey ||
                                            initialConnection.authMethod !==
                                            "API_USER_KEY"
                                        }
                                        helpText={
                                            initialConnection.authMethod ===
                                                "API_USER_KEY" &&
                                                initialConnection.hasApiUserKey
                                                ? "Laissez ce champ vide pour conserver la clé enregistrée."
                                                : "Générez une API User Key depuis SimplyBook.me → Settings → API User Keys."
                                        }
                                    />
                                ) : (
                                    <SecretField
                                        label="Mot de passe"
                                        value={password}
                                        onChange={setPassword}
                                        showSecret={showSecret}
                                        onToggleVisibility={() =>
                                            setShowSecret((current) => !current)
                                        }
                                        placeholder="Saisissez le mot de passe"
                                        required={
                                            !initialConnection.hasPassword ||
                                            initialConnection.authMethod !==
                                            "USER_PASSWORD"
                                        }
                                        helpText={
                                            initialConnection.authMethod ===
                                                "USER_PASSWORD" &&
                                                initialConnection.hasPassword
                                                ? "Laissez ce champ vide pour conserver le mot de passe enregistré."
                                                : "Le mot de passe sera chiffré avant d’être enregistré dans Medicloud."
                                        }
                                    />
                                )}
                                {authMethod === "USER_PASSWORD" && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                                        <p className="font-medium">
                                            Authentification par mot de passe
                                        </p>

                                        <p className="mt-1 text-xs leading-5">
                                            Medicloud conservera ce mot de passe
                                            sous forme chiffrée afin de renouveler
                                            automatiquement la connexion lorsque
                                            les jetons SimplyBook.me expirent.
                                        </p>
                                    </div>
                                )}

                                <Field
                                    label="Serveur API"
                                    value={apiBaseUrl}
                                    onChange={setApiBaseUrl}
                                    required
                                />

                                <ModalError message={error} />

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isPending}
                                        className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            isPending || !canSubmitCredentials
                                        }
                                        className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isPending && (
                                            <Loader2 className="size-4 animate-spin" />
                                        )}

                                        Tester et connecter
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form
                                onSubmit={
                                    handleTwoFactorSubmit
                                }
                                className="space-y-5 p-6"
                            >
                                <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                    <ShieldCheck className="size-5 shrink-0" />

                                    <p className="text-sm">
                                        SimplyBook.me exige une
                                        validation supplémentaire.
                                    </p>
                                </div>

                                {allowedProviders.length > 0 && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Méthode
                                        </label>

                                        <select
                                            value={twoFactorType}
                                            onChange={(event) =>
                                                setTwoFactorType(
                                                    event.target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            {allowedProviders.map(
                                                (provider) => (
                                                    <option
                                                        key={
                                                            provider
                                                        }
                                                        value={
                                                            provider
                                                        }
                                                    >
                                                        {provider}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                )}

                                <Field
                                    label="Code de vérification"
                                    value={twoFactorCode}
                                    onChange={setTwoFactorCode}
                                    placeholder="123456"
                                    required
                                />

                                <ModalError message={error} />

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setStep(
                                                "CREDENTIALS"
                                            )
                                        }
                                        disabled={isPending}
                                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700"
                                    >
                                        Retour
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            isPending ||
                                            !twoFactorCode.trim()
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
                                    >
                                        {isPending && (
                                            <Loader2 className="size-4 animate-spin" />
                                        )}

                                        Vérifier
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    required,
}: FieldProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </label>

            <input
                type="text"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                required={required}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-white"
            />
        </div>
    );
}

function SecretField({
    label,
    value,
    onChange,
    showSecret,
    onToggleVisibility,
    placeholder,
    required = false,
    helpText,
}: SecretFieldProps) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>

                {!required && (
                    <span className="text-xs text-slate-400">
                        Déjà configuré
                    </span>
                )}
            </div>

            <div className="relative">
                <input
                    type={
                        showSecret ? "text" : "password"
                    }
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    required={required}
                    autoComplete="new-password"
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-11 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />

                <button
                    type="button"
                    onClick={onToggleVisibility}
                    aria-label={
                        showSecret
                            ? "Masquer la valeur"
                            : "Afficher la valeur"
                    }
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
                >
                    {showSecret ? (
                        <EyeOff className="size-4" />
                    ) : (
                        <Eye className="size-4" />
                    )}
                </button>
            </div>

            {helpText && (
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {helpText}
                </p>
            )}
        </div>
    );
}

function ModalError({
    message,
}: {
    message: string | null;
}) {
    if (!message) {
        return null;
    }

    return (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {message}
        </p>
    );
}


function AuthenticationMethodSelector({
    value,
    onChange,
}: AuthenticationMethodSelectorProps) {
    return (
        <fieldset>
            <legend className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Méthode d&apos;authentification
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    aria-pressed={
                        value === "API_USER_KEY"
                    }
                    onClick={() =>
                        onChange("API_USER_KEY")
                    }
                    className={
                        value === "API_USER_KEY"
                            ? "rounded-xl border border-emerald-500 bg-emerald-50 p-4 text-left ring-1 ring-emerald-500 dark:bg-emerald-950/40"
                            : "rounded-xl border border-slate-300 p-4 text-left transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                    }
                >
                    <div className="flex items-center gap-2">
                        <KeyRound
                            className={
                                value ===
                                    "API_USER_KEY"
                                    ? "size-4 text-emerald-600 dark:text-emerald-300"
                                    : "size-4 text-slate-500"
                            }
                        />

                        <span className="text-sm font-semibold text-slate-950 dark:text-white">
                            API User Key
                        </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Recommandé pour une connexion
                        technique permanente.
                    </p>
                </button>

                <button
                    type="button"
                    aria-pressed={
                        value === "USER_PASSWORD"
                    }
                    onClick={() =>
                        onChange("USER_PASSWORD")
                    }
                    className={
                        value === "USER_PASSWORD"
                            ? "rounded-xl border border-emerald-500 bg-emerald-50 p-4 text-left ring-1 ring-emerald-500 dark:bg-emerald-950/40"
                            : "rounded-xl border border-slate-300 p-4 text-left transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                    }
                >
                    <div className="flex items-center gap-2">
                        <LockKeyhole
                            className={
                                value ===
                                    "USER_PASSWORD"
                                    ? "size-4 text-emerald-600 dark:text-emerald-300"
                                    : "size-4 text-slate-500"
                            }
                        />

                        <span className="text-sm font-semibold text-slate-950 dark:text-white">
                            Mot de passe
                        </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Utilise le mot de passe du
                        compte SimplyBook.me.
                    </p>
                </button>
            </div>
        </fieldset>
    );
}