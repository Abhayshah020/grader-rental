import "server-only";

import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

import {
    SESSION_COOKIE_NAME,
    getAuthenticatedAdmin,
} from "@/lib/auth/session";

export async function getCurrentPageAdmin() {
    const cookieStore = await cookies();

    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    return getAuthenticatedAdmin(token);
}

export async function requirePageAdmin() {
    const admin = await getCurrentPageAdmin();

    if (!admin) {
        notFound();
    }

    return admin;
}

export async function redirectAuthenticatedAdmin() {
    const admin = await getCurrentPageAdmin();

    if (admin) {
        redirect("/admin/transactions");
    }
}
