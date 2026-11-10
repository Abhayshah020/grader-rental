
import { NextRequest } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { transactionHeads } from "@/lib/db/schema";
import { requireFinanceAdmin } from "@/lib/finance/auth";
import { createHeadSchema } from "@/lib/finance/validation";

export async function GET(request: NextRequest) {
    const { response } = await requireFinanceAdmin();
    if (response) return response;

    try {
        const type = request.nextUrl.searchParams.get("type");

        const includeInactive =
            request.nextUrl.searchParams.get("includeInactive") === "true";

        const heads = await db
            .select()
            .from(transactionHeads)
            .where(
                includeInactive
                    ? undefined
                    : eq(transactionHeads.isActive, true)
            )
            .orderBy(asc(transactionHeads.name));

        const filtered = heads.filter((head) => {
            if (!type) return true;

            return (
                head.allowedTransactionType === "BOTH" ||
                head.allowedTransactionType === type
            );
        });

        return Response.json({
            success: true,
            data: filtered,
        });
    } catch (error) {
        console.error("GET transaction heads:", error);

        return Response.json(
            { success: false, message: "Failed to fetch transaction heads." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const { admin, response } = await requireFinanceAdmin();
    if (response) return response;

    try {
        const body = await request.json();
        const parsed = createHeadSchema.safeParse(body);

        if (!parsed.success) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid transaction head.",
                    errors: parsed.error.flatten(),
                },
                { status: 400 }
            );
        }

        const [existing] = await db
            .select({ id: transactionHeads.id })
            .from(transactionHeads)
            .where(eq(transactionHeads.name, parsed.data.name))
            .limit(1);

        if (existing) {
            return Response.json(
                { success: false, message: "This transaction head already exists." },
                { status: 409 }
            );
        }

        const [head] = await db
            .insert(transactionHeads)
            .values(parsed.data)
            .returning();

        return Response.json(
            { success: true, data: head },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST transaction head:", error);

        return Response.json(
            { success: false, message: "Failed to create transaction head." },
            { status: 500 }
        );
    }
}
