import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";

import {
    SESSION_COOKIE_NAME,
    getAuthenticatedAdmin,
} from "@/lib/auth/session";

import { eq } from "drizzle-orm";


import { hashPassword } from "@/lib/auth/password";



export const runtime = "nodejs";

async function authenticateAdmin(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    return getAuthenticatedAdmin(token);
}

export async function GET(request: NextRequest) {
    try {
        const admin = await authenticateAdmin(request);

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        if (admin.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                { success: false, message: "Forbidden. Super Admin access required." },
                { status: 403 }
            );
        }

        const users = await db
            .select({
                id: admins.id,
                fullName: admins.fullName,
                phone: admins.phone,
                email: admins.email,
                role: admins.role,
                isActive: admins.isActive,
                createdAt: admins.createdAt,
                updatedAt: admins.updatedAt,
            })
            .from(admins)
            .orderBy(desc(admins.createdAt));

        return NextResponse.json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("Fetch admin users error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to fetch admin users." },
            { status: 500 }
        );
    }
}

// POST: Create a new admin account
export async function POST(request: NextRequest) {
    try {
        const admin = await authenticateAdmin(request);

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        if (admin.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Super Admin access required.",
                },
                { status: 403 }
            );
        }

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid request body." },
                { status: 400 }
            );
        }

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json(
                { success: false, message: "Invalid request body." },
                { status: 400 }
            );
        }

        const data = body as Record<string, unknown>;

        const allowedFields = [
            "fullName",
            "phone",
            "email",
            "password",
            "role",
        ];

        if (
            Object.keys(data).some(field => !allowedFields.includes(field)) ||
            Object.keys(data).length !== allowedFields.length
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Provide full name, phone, email, password, and role.",
                },
                { status: 400 }
            );
        }

        if (
            typeof data.fullName !== "string" ||
            !data.fullName.trim() ||
            data.fullName.trim().length > 150
        ) {
            return NextResponse.json(
                { success: false, message: "Enter a valid full name." },
                { status: 400 }
            );
        }

        if (
            data.phone !== null &&
            (typeof data.phone !== "string" || data.phone.trim().length > 30)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid phone number." },
                { status: 400 }
            );
        }

        if (
            typeof data.email !== "string" ||
            data.email.trim().length > 255 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
        ) {
            return NextResponse.json(
                { success: false, message: "Enter a valid email address." },
                { status: 400 }
            );
        }

        if (
            typeof data.password !== "string" ||
            data.password.length < 12 ||
            data.password.length > 128
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password must contain between 12 and 128 characters.",
                },
                { status: 400 }
            );
        }

        if (
            data.role !== "ADMIN" &&
            data.role !== "SUPER_ADMIN"
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid admin role." },
                { status: 400 }
            );
        }

        const email = data.email.trim().toLowerCase();

        const [existingAdmin] = await db
            .select({ id: admins.id })
            .from(admins)
            .where(eq(admins.email, email))
            .limit(1);

        if (existingAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "An account with this email already exists.",
                },
                { status: 409 }
            );
        }

        const passwordHash = await hashPassword(data.password);

        const [newAdmin] = await db
            .insert(admins)
            .values({
                fullName: data.fullName.trim(),
                phone:
                    typeof data.phone === "string"
                        ? data.phone.trim() || null
                        : null,
                email,
                passwordHash,
                role: data.role,
                isActive: true,
            })
            .returning({
                id: admins.id,
                fullName: admins.fullName,
                phone: admins.phone,
                email: admins.email,
                role: admins.role,
                isActive: admins.isActive,
                createdAt: admins.createdAt,
                updatedAt: admins.updatedAt,
            });

        return NextResponse.json(
            {
                success: true,
                message: "Admin account created successfully.",
                user: newAdmin,
            },
            { status: 201 }
        );
    } catch (error) {
        // PostgreSQL unique constraint violation (e.g. concurrent email creation).
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "An account with this email already exists.",
                },
                { status: 409 }
            );
        }

        console.error("Create admin error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to create admin account.",
            },
            { status: 500 }
        );
    }
}