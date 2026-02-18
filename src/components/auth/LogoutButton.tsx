"use client";

import { useState } from "react";

export function LogoutButton() {
    const [loading, setLoading] = useState(false);

    async function handleLogout() {
        try {
            setLoading(true);

            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });

            const data = await res.json();

            if (data.ok) {
                window.location.href = data.redirectTo ?? "/login";
            }
        } catch (err) {
            console.error("Logout error", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="bg-rose-400 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
        >
            {loading ? "Signing out..." : "Logout"}
        </button>
    );
}
