import {
    and,
    count,
    eq,
    isNull,
} from "drizzle-orm";

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { admins, adminSessions } from "@/lib/db/schema";

import {
    SESSION_COOKIE_NAME,
    getAuthenticatedAdmin,
} from "@/lib/auth/session";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{ id: string }>;
};

async function authenticateAdmin(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    return getAuthenticatedAdmin(token);
}

function isValidUUID(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value
    );
}

function isUniqueViolation(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
    );
}

// ========================================
// PATCH: Update admin account
// ========================================

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const currentAdmin = await authenticateAdmin(request);

        if (!currentAdmin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        if (currentAdmin.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Super Admin access required.",
                },
                { status: 403 }
            );
        }

        const { id } = await context.params;

        if (!isValidUUID(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid admin ID." },
                { status: 400 }
            );
        }

        if (id === currentAdmin.adminId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Use the profile section to update your own account.",
                },
                { status: 400 }
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
            "role",
            "isActive",
        ];

        const fields = Object.keys(data);

        if (
            fields.length === 0 ||
            fields.some(field => !allowedFields.includes(field))
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid or unsupported fields.",
                },
                { status: 400 }
            );
        }

        const updates: {
            fullName?: string | null;
            phone?: string | null;
            email?: string;
            role?: string;
            isActive?: boolean;
            updatedAt: Date;
        } = {
            updatedAt: new Date(),
        };

        // Validate full name
        if ("fullName" in data) {
            if (
                data.fullName !== null &&
                (
                    typeof data.fullName !== "string" ||
                    data.fullName.trim().length > 150
                )
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid full name." },
                    { status: 400 }
                );
            }

            updates.fullName =
                typeof data.fullName === "string"
                    ? data.fullName.trim() || null
                    : null;
        }

        // Validate phone
        if ("phone" in data) {
            if (
                data.phone !== null &&
                (
                    typeof data.phone !== "string" ||
                    data.phone.trim().length > 30
                )
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid phone number." },
                    { status: 400 }
                );
            }

            updates.phone =
                typeof data.phone === "string"
                    ? data.phone.trim() || null
                    : null;
        }

        // Validate email
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

            updates.email = data.email.trim().toLowerCase();
        }

        // Validate role
        if ("role" in data) {
            if (
                data.role !== "ADMIN" &&
                data.role !== "SUPER_ADMIN"
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid admin role." },
                    { status: 400 }
                );
            }

            updates.role = data.role;
        }

        // Validate active status
        if ("isActive" in data) {
            if (typeof data.isActive !== "boolean") {
                return NextResponse.json(
                    { success: false, message: "Invalid account status." },
                    { status: 400 }
                );
            }

            updates.isActive = data.isActive;
        }

        // ------------------------------------
        // 1. Fetch target admin
        // ------------------------------------

        const [target] = await db
            .select({
                id: admins.id,
                email: admins.email,
                role: admins.role,
                isActive: admins.isActive,
            })
            .from(admins)
            .where(eq(admins.id, id))
            .limit(1);

        if (!target) {
            return NextResponse.json(
                { success: false, message: "Admin account not found." },
                { status: 404 }
            );
        }

        // ------------------------------------
        // 2. Check duplicate email
        // ------------------------------------

        if (updates.email && updates.email !== target.email) {
            const [existing] = await db
                .select({ id: admins.id })
                .from(admins)
                .where(eq(admins.email, updates.email))
                .limit(1);

            if (existing) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "This email address is already in use.",
                    },
                    { status: 409 }
                );
            }
        }

        // ------------------------------------
        // 3. Protect last active Super Admin
        // ------------------------------------

        const willRemoveSuperAdmin =
            target.role === "SUPER_ADMIN" &&
            target.isActive &&
            (
                updates.role === "ADMIN" ||
                updates.isActive === false
            );

        if (willRemoveSuperAdmin) {
            const [result] = await db
                .select({ total: count() })
                .from(admins)
                .where(
                    and(
                        eq(admins.role, "SUPER_ADMIN"),
                        eq(admins.isActive, true)
                    )
                );

            if (Number(result.total) <= 1) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "You cannot deactivate or demote the last active Super Admin.",
                    },
                    { status: 400 }
                );
            }
        }

        // ------------------------------------
        // 4. Update admin
        // ------------------------------------

        const [updatedUser] = await db
            .update(admins)
            .set(updates)
            .where(eq(admins.id, id))
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

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "Admin account not found." },
                { status: 404 }
            );
        }

        // ------------------------------------
        // 5. Revoke sessions if deactivated
        // ------------------------------------

        if (updates.isActive === false) {
            await db
                .update(adminSessions)
                .set({ revokedAt: new Date() })
                .where(
                    and(
                        eq(adminSessions.adminId, id),
                        isNull(adminSessions.revokedAt)
                    )
                );
        }

        return NextResponse.json({
            success: true,
            message: "Admin account updated successfully.",
            user: updatedUser,
        });

    } catch (error) {
        console.error("Update admin error:", error);

        if (isUniqueViolation(error)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This email address is already in use.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Unable to update admin account.",
            },
            { status: 500 }
        );
    }
}

// ========================================
// DELETE: Permanently delete admin account
// ========================================

export async function DELETE(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const currentAdmin = await authenticateAdmin(request);

        if (!currentAdmin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        if (currentAdmin.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Super Admin access required.",
                },
                { status: 403 }
            );
        }

        const { id } = await context.params;

        if (!isValidUUID(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid admin ID." },
                { status: 400 }
            );
        }

        if (id === currentAdmin.adminId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot delete your own account.",
                },
                { status: 400 }
            );
        }

        // ------------------------------------
        // 1. Fetch target admin
        // ------------------------------------

        const [target] = await db
            .select({
                id: admins.id,
                role: admins.role,
                isActive: admins.isActive,
            })
            .from(admins)
            .where(eq(admins.id, id))
            .limit(1);

        if (!target) {
            return NextResponse.json(
                { success: false, message: "Admin account not found." },
                { status: 404 }
            );
        }

        // ------------------------------------
        // 2. Protect last active Super Admin
        // ------------------------------------

        if (
            target.role === "SUPER_ADMIN" &&
            target.isActive
        ) {
            const [result] = await db
                .select({ total: count() })
                .from(admins)
                .where(
                    and(
                        eq(admins.role, "SUPER_ADMIN"),
                        eq(admins.isActive, true)
                    )
                );

            if (Number(result.total) <= 1) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "You cannot delete the last active Super Admin.",
                    },
                    { status: 400 }
                );
            }
        }

        // ------------------------------------
        // 3. Delete admin
        // ------------------------------------

        const [deletedAdmin] = await db
            .delete(admins)
            .where(eq(admins.id, id))
            .returning({
                id: admins.id,
            });

        if (!deletedAdmin) {
            return NextResponse.json(
                { success: false, message: "Admin account not found." },
                { status: 404 }
            );
        }

        // admin_sessions are configured with ON DELETE CASCADE,
        // so their records are automatically deleted.

        return NextResponse.json({
            success: true,
            message: "Admin account deleted successfully.",
        });

    } catch (error) {
        console.error("Delete admin error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to delete admin account.",
            },
            { status: 500 }
        );
    }
}