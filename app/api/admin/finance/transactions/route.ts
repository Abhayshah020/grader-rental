
import { NextRequest } from "next/server";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/lib/db";
import {
  accountTransactions,
  transactionHeads,
} from "@/lib/db/schema";

import { requireFinanceAdmin } from "@/lib/finance/auth";
import {
  createTransactionSchema,
  validateTransactionRules,
} from "@/lib/finance/validation";

const relatedTransaction = alias(
  accountTransactions,
  "related_transaction"
);

const relatedHead = alias(
  transactionHeads,
  "related_head"
);

export async function GET(request: NextRequest) {
  const { response } = await requireFinanceAdmin();
  if (response) return response;

  try {
    const params = request.nextUrl.searchParams;

    const type = params.get("type");
    const from = params.get("from");
    const to = params.get("to");
    const search = params.get("search")?.trim();

    const includeRelated =
      params.get("includeRelated") === "true";

    const headId = params.get("headId");

    const page = Math.max(
      1,
      Number(params.get("page")) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(params.get("limit")) || 20)
    );

    const conditions = [];

    if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      return Response.json(
        { success: false, message: "Invalid from date." },
        { status: 400 }
      );
    }

    if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return Response.json(
        { success: false, message: "Invalid to date." },
        { status: 400 }
      );
    }

    if (from && to && from > to) {
      return Response.json(
        {
          success: false,
          message: "From date cannot be after to date.",
        },
        { status: 400 }
      );
    }

    if (headId && headId !== "ALL" &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(headId)) {
      return Response.json(
        { success: false, message: "Invalid transaction head." },
        { status: 400 }
      );
    }

    if (type === "CREDIT" || type === "DEBIT") {
      conditions.push(
        eq(accountTransactions.transactionType, type)
      );
    }

    if (from) {
      conditions.push(
        gte(accountTransactions.transactionDate, from)
      );
    }

    if (to) {
      conditions.push(
        lte(accountTransactions.transactionDate, to)
      );
    }

    if (search) {
      conditions.push(
        or(
          ilike(transactionHeads.name, `%${search}%`),
          ilike(accountTransactions.remarks, `%${search}%`)
        )
      );
    }

    const headCondition =
      headId && headId !== "ALL"
        ? includeRelated
          ? or(
            // Transaction's own head matches the selected head
            eq(accountTransactions.transactionHeadId, headId),

            // Its linked earning transaction has the selected head
            eq(relatedHead.id, headId)
          )
          : eq(accountTransactions.transactionHeadId, headId)
        : undefined;

    const where = and(
      ...conditions,
      ...(headCondition ? [headCondition] : [])
    );

    const relatedJoinCondition = includeRelated
      ? and(
        eq(
          accountTransactions.relatedToTransactionId,
          relatedTransaction.id
        ),
        eq(accountTransactions.transactionType, "DEBIT"),
        eq(relatedTransaction.transactionType, "CREDIT")
      )
      : sql`false`;

    const rows = await db
      .select({
        id: accountTransactions.id,
        transactionType: accountTransactions.transactionType,
        transactionHeadId: accountTransactions.transactionHeadId,
        transactionHeadName: transactionHeads.name,
        transactionDate: accountTransactions.transactionDate,
        rentalFromDate: accountTransactions.rentalFromDate,
        rentalToDate: accountTransactions.rentalToDate,
        amount: accountTransactions.amount,
        remarks: accountTransactions.remarks,
        relatedToTransactionId:
          accountTransactions.relatedToTransactionId,
        createdAt: accountTransactions.createdAt,
        updatedAt: accountTransactions.updatedAt,

        relatedTransaction: {
          id: relatedTransaction.id,
          transactionDate: relatedTransaction.transactionDate,
          amount: relatedTransaction.amount,
          transactionHeadId: relatedTransaction.transactionHeadId,
          transactionHeadName: relatedHead.name,
        },
      })
      .from(accountTransactions)
      .innerJoin(
        transactionHeads,
        eq(
          accountTransactions.transactionHeadId,
          transactionHeads.id
        )
      )
      .leftJoin(
        relatedTransaction,
        relatedJoinCondition
      )
      .leftJoin(
        relatedHead,
        eq(
          relatedTransaction.transactionHeadId,
          relatedHead.id
        )
      )
      .where(where)
      .orderBy(
        desc(accountTransactions.transactionDate),
        desc(accountTransactions.createdAt)
      )
      .limit(limit)
      .offset((page - 1) * limit);

    const [countResult] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(accountTransactions)
      .innerJoin(
        transactionHeads,
        eq(
          accountTransactions.transactionHeadId,
          transactionHeads.id
        )
      )
      .leftJoin(
        relatedTransaction,
        relatedJoinCondition
      )
      .leftJoin(
        relatedHead,
        eq(
          relatedTransaction.transactionHeadId,
          relatedHead.id
        )
      )
      .where(where);

    const normalizedRows = rows.map((row) => ({
      ...row,
      relatedTransaction: row.relatedTransaction?.id
        ? row.relatedTransaction
        : null,
    }));

    return Response.json({
      success: true,
      data: normalizedRows,
      pagination: {
        page,
        limit,
        total: countResult?.count ?? 0,
        totalPages: Math.ceil(
          (countResult?.count ?? 0) / limit
        ),
      },
    });
  } catch (error) {
    console.error("GET finance transactions:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch transactions.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { admin, response } = await requireFinanceAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const parsed = createTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid transaction data.",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const [head] = await db
      .select()
      .from(transactionHeads)
      .where(
        and(
          eq(transactionHeads.id, data.transactionHeadId),
          eq(transactionHeads.isActive, true)
        )
      )
      .limit(1);

    if (!head) {
      return Response.json(
        {
          success: false,
          message: "Transaction head not found or inactive.",
        },
        { status: 404 }
      );
    }

    const validationError = validateTransactionRules(data, head);

    if (validationError) {
      return Response.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    if (
      data.transactionType === "CREDIT" &&
      data.relatedToTransactionId
    ) {
      return Response.json(
        {
          success: false,
          message: "Credit transactions cannot be linked to another earning.",
        },
        { status: 400 }
      );
    }

    if (data.relatedToTransactionId) {
      const [related] = await db
        .select({
          id: accountTransactions.id,
          transactionType: accountTransactions.transactionType,
        })
        .from(accountTransactions)
        .where(
          eq(
            accountTransactions.id,
            data.relatedToTransactionId
          )
        )
        .limit(1);

      if (!related || related.transactionType !== "CREDIT") {
        return Response.json(
          {
            success: false,
            message: "Related transaction must be an existing credit.",
          },
          { status: 400 }
        );
      }
    }

    const [created] = await db
      .insert(accountTransactions)
      .values({
        transactionType: data.transactionType,
        transactionHeadId: data.transactionHeadId,
        transactionDate: data.transactionDate,

        rentalFromDate:
          data.transactionType === "CREDIT"
            ? data.rentalFromDate ?? null
            : null,

        rentalToDate:
          data.transactionType === "CREDIT"
            ? data.rentalToDate ?? null
            : null,

        amount: data.amount,
        remarks: data.remarks || null,
        relatedToTransactionId:
          data.transactionType === "DEBIT"
            ? data.relatedToTransactionId ?? null
            : null,

        createdByAdminId: admin!.adminId,
        updatedByAdminId: admin!.adminId,
      })
      .returning();

    return Response.json(
      {
        success: true,
        message: "Transaction created successfully.",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST finance transaction:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to create transaction.",
      },
      { status: 500 }
    );
  }
}
