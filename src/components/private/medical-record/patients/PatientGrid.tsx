"use client";

import { PatientCard } from "./PatientCard";

type PatientItem = {
    id: string;

    firstName: string | null;
    lastName: string | null;

    email: string | null;
    phone: string | null;

    birthDate: Date | null;

    isActive: boolean;

    preventiveCasesCount?: number;

    providerName?: string | null;
};

type Props = {
    items: PatientItem[];

    page: number;
    totalPages: number;

    onEdit: (id: string) => void;
    onView: (id: string) => void;
};

export function PatientGrid({
    items,
    page,
    totalPages,
    onEdit,
    onView,
}: Props) {
    return (
        <div className="space-y-6">
            {/* GRID */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {items.map((patient) => (
                    <PatientCard
                        key={patient.id}
                        patient={patient}
                        onEdit={onEdit}
                        onView={onView}
                    />
                ))}
            </div>

            {/* PAGINATION */}
            {/* <div className="flex items-center justify-center">
                <div className="rounded-xl border border-[#eaedf0] bg-white px-4 py-2 text-sm dark:border-gray-800 dark:bg-[#1c2126]">
                    Page {page} / {totalPages}
                </div>
            </div> */}
        </div>
    );
}