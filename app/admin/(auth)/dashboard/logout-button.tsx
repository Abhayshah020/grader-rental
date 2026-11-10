
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useAppDialog } from "@/components/app-dialog";

export default function LogoutButton() {
    const router = useRouter();
    const { alert } = useAppDialog();

    const [loading, setLoading] = useState(false);

    async function handleLogout() {
        if (loading) return;

        setLoading(true);

        try {
            const response = await fetch("/api/admin/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Unable to log out. Please try again.");
            }

            router.replace("/admin/login");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
            alert("Logout failed. Please try again.");
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <LogOut size={16} />
            )}

            {loading ? "Logging out..." : "Logout"}
        </button>
    );
}
