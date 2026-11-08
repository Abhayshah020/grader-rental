import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";

import {
    SESSION_COOKIE_NAME,
    getAuthenticatedAdmin,
} from "@/lib/auth/session";

import { and, ne, isNull } from "drizzle-orm";

import { adminSessions } from "@/lib/db/schema";

import {
    hashPassword,
    verifyPassword,
} from "@/lib/auth/password";

import { hashSessionToken } from "@/lib/auth/session";

export const runtime = "nodejs";

async function authenticateAdmin(request: NextRequest) {
    const token = request.cookies.get(
        SESSION_COOKIE_NAME
    )?.value;

    if (!token) return null;

    return getAuthenticatedAdmin(token);
}

// GET: Fetch the authenticated admin's profile
export async function GET(request: NextRequest) {
    try {
        const admin = await authenticateAdmin(request);

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const [profile] = await db
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
            .where(eq(admins.id, admin.adminId))
            .limit(1);

        if (!profile) {
            return NextResponse.json(
                { success: false, message: "Admin account not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error("Fetch admin profile error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to fetch profile." },
            { status: 500 }
        );
    }
}

// PATCH: Update the authenticated admin's own profile
export async function PATCH(request: NextRequest) {
    try {
        const admin = await authenticateAdmin(request);

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
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
            "currentPassword",
            "newPassword",
        ];
        const receivedFields = Object.keys(data);

        if (
            receivedFields.length === 0 ||
            receivedFields.some(field => !allowedFields.includes(field))
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only fullName, phone, currentPassword, newPassword, and email can be updated.",
                },
                { status: 400 }
            );
        }

        let newPasswordHash: string | undefined;

        if ("newPassword" in data || "currentPassword" in data) {
            if (
                typeof data.currentPassword !== "string" ||
                typeof data.newPassword !== "string"
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Current password and new password are required.",
                    },
                    { status: 400 }
                );
            }

            if (data.newPassword.length < 12) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "New password must contain at least 12 characters.",
                    },
                    { status: 400 }
                );
            }

            if (data.newPassword.length > 128) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "New password must not exceed 128 characters.",
                    },
                    { status: 400 }
                );
            }

            const [currentAdmin] = await db
                .select({
                    passwordHash: admins.passwordHash,
                })
                .from(admins)
                .where(eq(admins.id, admin.adminId))
                .limit(1);

            if (!currentAdmin) {
                return NextResponse.json(
                    { success: false, message: "Admin account not found." },
                    { status: 404 }
                );
            }

            const isCurrentPasswordValid = await verifyPassword(
                currentAdmin.passwordHash,
                data.currentPassword
            );

            if (!isCurrentPasswordValid) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Current password is incorrect.",
                    },
                    { status: 400 }
                );
            }

            if (data.currentPassword === data.newPassword) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "New password must be different from the current password.",
                    },
                    { status: 400 }
                );
            }

            newPasswordHash = await hashPassword(data.newPassword);
        }

        const updates: {
            fullName?: string | null;
            phone?: string | null;
            email?: string;
            passwordHash?: string;
            updatedAt: Date;
        } = {
            updatedAt: new Date(),
        };

        if ("fullName" in data) {
            if (
                data.fullName !== null &&
                (typeof data.fullName !== "string" ||
                    data.fullName.trim().length > 150)
            ) {
                return NextResponse.json(
                    { success: false, message: "Full name must be 150 characters or fewer." },
                    { status: 400 }
                );
            }

            updates.fullName =
                typeof data.fullName === "string"
                    ? data.fullName.trim() || null
                    : null;
        }

        if ("phone" in data) {
            if (
                data.phone !== null &&
                (typeof data.phone !== "string" ||
                    data.phone.trim().length > 30)
            ) {
                return NextResponse.json(
                    { success: false, message: "Phone number must be 30 characters or fewer." },
                    { status: 400 }
                );
            }

            updates.phone =
                typeof data.phone === "string"
                    ? data.phone.trim() || null
                    : null;
        }

        if ("email" in data) {
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

            const email = data.email.trim().toLowerCase();

            const [existingAdmin] = await db
                .select({ id: admins.id })
                .from(admins)
                .where(eq(admins.email, email))
                .limit(1);

            if (existingAdmin && existingAdmin.id !== admin.adminId) {
                return NextResponse.json(
                    { success: false, message: "This email address is already in use." },
                    { status: 409 }
                );
            }

            updates.email = email;
        }

        if (newPasswordHash) {
            updates.passwordHash = newPasswordHash;
        }

        if (newPasswordHash) {
            const currentToken = request.cookies.get(
                SESSION_COOKIE_NAME
            )?.value;

            if (currentToken) {
                await db
                    .update(adminSessions)
                    .set({
                        revokedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(adminSessions.adminId, admin.adminId),
                            ne(
                                adminSessions.sessionTokenHash,
                                hashSessionToken(currentToken)
                            ),
                            isNull(adminSessions.revokedAt)
                        )
                    );
            }
        }

        const [updatedProfile] = await db
            .update(admins)
            .set(updates)
            .where(eq(admins.id, admin.adminId))
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

        if (!updatedProfile) {
            return NextResponse.json(
                { success: false, message: "Admin account not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully.",
            profile: updatedProfile,
        });
    } catch (error) {
        console.error("Update admin profile error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to update profile." },
            { status: 500 }
        );
    }
}