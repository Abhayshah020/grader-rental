
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { accountTransactions } from "@/lib/db/schema";

import {
    SESSION_COOKIE_NAME,
    getAuthenticatedAdmin,
} from "@/lib/auth/session";

import {
    isRentalPurpose,
    validateTransaction,
} from "@/lib/validations/account-transaction";

export const runtime = "nodejs";

async function authenticateAdmin(request: NextRequest) {
    const token = request.cookies.get(
        SESSION_COOKIE_NAME
    )?.value;

    if (!token) return null;

    return await getAuthenticatedAdmin(token);
}

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// PATCH: Update transaction
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await authenticateAdmin(request);

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid transaction ID." },
                { status: 400 }
            );
        }

        const body = await request.json();

        const validationError = validateTransaction(body);

        if (validationError) {
            return NextResponse.json(
                { success: false, message: validationError },
                { status: 400 }
            );
        }

        const rental = isRentalPurpose(body.purpose);

        const [transaction] = await db
            .update(accountTransactions)
            .set({
                transactionType: body.transactionType,
                purpose: body.purpose,
                transactionDate: body.transactionDate,

                rentalFromDate: rental
                    ? body.rentalFromDate
                    : null,

                rentalToDate: rental
                    ? body.rentalToDate
                    : null,

                amount: String(body.amount),
                remarks: body.remarks?.trim() || null,

                updatedByAdminId: admin.adminId,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(accountTransactions.id, id),
                    isNull(accountTransactions.deletedAt)
                )
            )
            .returning();

        if (!transaction) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Transaction not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Transaction updated successfully.",
            transaction,
        });

    } catch (error) {
        console.error("Update transaction error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to update transaction.",
            },
            { status: 500 }
        );
    }
}

// DELETE: Soft delete transaction
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await authenticateAdmin(request);

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid transaction ID." },
                { status: 400 }
            );
        }

        const [transaction] = await db
            .update(accountTransactions)
            .set({
                deletedAt: new Date(),
                deletedByAdminId: admin.adminId,
                updatedAt: new Date(),
                updatedByAdminId: admin.adminId,
            })
            .where(
                and(
                    eq(accountTransactions.id, id),
                    isNull(accountTransactions.deletedAt)
                )
            )
            .returning({
                id: accountTransactions.id,
            });

        if (!transaction) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Transaction not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Transaction deleted successfully.",
        });

    } catch (error) {
        console.error("Delete transaction error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to delete transaction.",
            },
            { status: 500 }
        );
    }
}
