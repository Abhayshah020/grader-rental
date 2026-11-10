
import { NextRequest } from "next/server";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
    accountTransactions,
    transactionHeads,
} from "@/lib/db/schema";

import { requireFinanceAdmin } from "@/lib/finance/auth";

export async function GET(request: NextRequest) {
    const { response } = await requireFinanceAdmin();
    if (response) return response;

    try {
        const params = request.nextUrl.searchParams;
        const search = params.get("search")?.trim() ?? "";

        if (search.length > 100) {
            return Response.json(
                {
                    success: false,
                    message: "Search query is too long.",
                },
                { status: 400 }
            );
        }

        const conditions = [
            eq(accountTransactions.transactionType, "CREDIT"),
        ];

        if (search) {
            const searchPattern = `%${search}%`;

            conditions.push(
                or(
                    ilike(transactionHeads.name, searchPattern),

                    ilike(
                        sql`${accountTransactions.transactionDate}::text`,
                        searchPattern
                    ),

                    ilike(
                        sql`${accountTransactions.amount}::text`,
                        searchPattern
                    ),

                    ilike(
                        accountTransactions.remarks,
                        searchPattern
                    )
                )!
            );
        }

        const rows = await db
            .select({
                id: accountTransactions.id,
                transactionHeadName: transactionHeads.name,
                transactionDate: accountTransactions.transactionDate,
                amount: accountTransactions.amount,
                remarks: accountTransactions.remarks,
            })
            .from(accountTransactions)
            .innerJoin(
                transactionHeads,
                eq(
                    accountTransactions.transactionHeadId,
                    transactionHeads.id
                )
            )
            .where(and(...conditions))
            .orderBy(
                desc(accountTransactions.transactionDate),
                desc(accountTransactions.createdAt)
            )
            .limit(10);

        return Response.json({
            success: true,
            data: rows,
            count: rows.length,
        });
    } catch (error) {
        console.error("GET related transactions:", error);

        return Response.json(
            {
                success: false,
                message: "Failed to fetch related transactions.",
            },
            { status: 500 }
        );
    }
}
