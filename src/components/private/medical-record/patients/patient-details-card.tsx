import {
    getPatientDisplayName,
    getPatientTypeLabel,
} from "@/lib/types/patients/patients.helpers";
import type { PatientDetails } from "@/lib/types/patients/patients.types";
import { PatientStatusBadge } from "./patient-status-badge";

function formatDate(value?: Date | null) {
    if (!value) return "—";

    return new Intl.DateTimeFormat("fr-BE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(value));
}

function getPrimaryAddress(item: PatientDetails) {
    return item.addresses.find((address) => address.isPrimary) || item.addresses[0] || null;
}

function getPrimaryIdentity(item: PatientDetails) {
    return item.identities[0] || null;
}

function getPrimaryCoverage(item: PatientDetails) {
    return item.insuranceCoverages[0] || null;
}

function formatAddress(item: PatientDetails) {
    const address = getPrimaryAddress(item);

    if (!address) return "—";

    const line1 = [
        address.street,
        address.houseNumber,
        address.box ? `Boîte ${address.box}` : null,
    ]
        .filter(Boolean)
        .join(" ");

    const line2 = [address.postalCode, address.city].filter(Boolean).join(" ");

    const fullAddress = [line1, line2, address.countryCode]
        .filter(Boolean)
        .join(", ");

    return fullAddress || address.rawAddress || "—";
}

function formatGender(value: PatientDetails["gender"]) {
    if (!value) return "—";

    const labels: Record<string, string> = {
        MALE: "Homme",
        FEMALE: "Femme",
        OTHER: "Autre",
        UNKNOWN: "Non renseigné",
    };

    return labels[value] || value;
}

function formatCoverageStatus(value?: string | null) {
    if (!value) return "—";

    const labels: Record<string, string> = {
        UNKNOWN: "Inconnu",
        VERIFIED: "Vérifiée",
        ACTIVE: "Active",
        INACTIVE: "Inactive",
        EXPIRED: "Expirée",
        REJECTED: "Rejetée",
        ERROR: "Erreur",
    };

    return labels[value] || value;
}

type Props = {
    item: PatientDetails;
};

export function PatientDetailsCard({ item }: Props) {
    const identity = getPrimaryIdentity(item);
    const coverage = getPrimaryCoverage(item);

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-medium text-cyan-600 dark:text-cyan-300">
                        {getPatientTypeLabel(item.type)}
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {getPatientDisplayName(item)}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Informations administratives, identité et couverture du patient.
                    </p>
                </div>

                <PatientStatusBadge isActive={item.isActive} />
            </div>

            <Section title="Informations personnelles">
                <Field label="Prénom" value={item.firstName || "—"} />
                <Field label="Nom" value={item.lastName || "—"} />
                <Field label="Genre" value={formatGender(item.gender)} />
                <Field label="Date de naissance" value={formatDate(item.birthDate)} />
                <Field
                    label="Nationalité"
                    value={item.nationality?.name || item.nationalityCode || "—"}
                />
                <Field
                    label="Langue préférée"
                    value={item.preferredLanguage?.name || item.preferredLanguageCode || "—"}
                />
            </Section>

            <Section title="Contact et adresse">
                <Field label="E-mail" value={item.email || "—"} />
                <Field label="Téléphone" value={item.phone || "—"} />
                <Field label="Adresse principale" value={formatAddress(item)} wide />
            </Section>

            <Section title="Identité">
                <Field
                    label="N° national"
                    value={identity?.nationalNumber || "—"}
                />
                <Field
                    label="Carte d’identité"
                    value={identity?.cardNumber || "—"}
                />
                <Field
                    label="Pays d’émission"
                    value={identity?.issuingCountryCode || "—"}
                />
                <Field
                    label="Expiration"
                    value={formatDate(identity?.expiresAt)}
                />
            </Section>

            <Section title="Couverture">
                <Field
                    label="Statut"
                    value={formatCoverageStatus(coverage?.status)}
                />
                <Field
                    label="Assureur"
                    value={coverage?.insurerName || coverage?.mutualityName || "—"}
                />
                <Field
                    label="Code assureur"
                    value={coverage?.insurerCode || coverage?.mutualityCode || "—"}
                />
                <Field
                    label="Vérifié le"
                    value={formatDate(coverage?.verifiedAt)}
                />
                <Field
                    label="Valable du"
                    value={formatDate(coverage?.validFrom)}
                />
                <Field
                    label="Valable jusqu’au"
                    value={formatDate(coverage?.validUntil)}
                />
            </Section>

            <Section title="Système">
                <Field label="Code interne" value={item.code || "—"} />
                <Field label="Créé le" value={formatDate(item.createdAt)} />
                <Field label="Mis à jour le" value={formatDate(item.updatedAt)} />
            </Section>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {title}
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {children}
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    wide = false,
}: {
    label: string;
    value: string;
    wide?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40 ${wide ? "md:col-span-2 xl:col-span-3" : ""
                }`}
        >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
            </p>

            <p className="mt-1 wrap-break-word text-sm font-medium text-slate-900 dark:text-slate-100">
                {value}
            </p>
        </div>
    );
}