
import { desc, isNull } from "drizzle-orm";
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

// GET: Fetch active transactions
export async function GET(request: NextRequest) {
    try {
        const admin = await authenticateAdmin(request);

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const transactions = await db
            .select()
            .from(accountTransactions)
            .where(isNull(accountTransactions.deletedAt))
            .orderBy(
                desc(accountTransactions.transactionDate),
                desc(accountTransactions.createdAt)
            );

        return NextResponse.json({
            success: true,
            transactions,
        });

    } catch (error) {
        console.error("Fetch transactions error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to fetch transactions.",
            },
            { status: 500 }
        );
    }
}

// POST: Create transaction
export async function POST(request: NextRequest) {
    try {
        const admin = await authenticateAdmin(request);

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        const body = await request.json();

        const validationError = validateTransaction(body);

        if (validationError) {
            return NextResponse.json(
                {
                    success: false,
                    message: validationError,
                },
                { status: 400 }
            );
        }

        const rental = isRentalPurpose(body.purpose);

        const [transaction] = await db
            .insert(accountTransactions)
            .values({
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

                createdByAdminId: admin.adminId,
                updatedByAdminId: admin.adminId,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                message: "Transaction created successfully.",
                transaction,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create transaction error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to create transaction.",
            },
            { status: 500 }
        );
    }
}
