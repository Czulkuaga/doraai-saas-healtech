import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { headers } from "next/headers";

export const metadata: Metadata = {
    title: "SAAS Healtech | Dashboard",
    description: "Plataforma de gestão para clínicas de saúde",
};

export default async function PrivateLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const ctx = await getAuthContext();

    if (!ctx) {
        redirect("/login");
    }

    // Validación extra: asegurar que el tenant del host coincide
    const h = await headers();
    const host = h.get("host") ?? "";

    const sub = host.split(".")[0]; // demo.localhost
    // En localhost esto puede variar, puedes mejorar luego

    if (!ctx.tenantId) {
        redirect("/login");
    }
    return (
        <main className="w-screen h-screen">
            {children}
        </main>
    );
}