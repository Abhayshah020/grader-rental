
import { and, eq, ne } from "drizzle-orm";
import { NextRequest } from "next/server";

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

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _: NextRequest,
  context: Context
) {
  const { response } = await requireFinanceAdmin();
  if (response) return response;

  try {
    const { id } = await context.params;

    const [result] = await db
      .select({
        transaction: accountTransactions,
        transactionHeadName: transactionHeads.name,
      })
      .from(accountTransactions)
      .innerJoin(
        transactionHeads,
        eq(
          accountTransactions.transactionHeadId,
          transactionHeads.id
        )
      )
      .where(eq(accountTransactions.id, id))
      .limit(1);

    if (!result) {
      return Response.json(
        { success: false, message: "Transaction not found." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET finance transaction:", error);

    return Response.json(
      { success: false, message: "Failed to fetch transaction." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: Context
) {
  const { admin, response } = await requireFinanceAdmin();
  if (response) return response;

  try {
    const { id } = await context.params;
    const body = await request.json();

    const [existing] = await db
      .select()
      .from(accountTransactions)
      .where(eq(accountTransactions.id, id))
      .limit(1);

    if (!existing) {
      return Response.json(
        { success: false, message: "Transaction not found." },
        { status: 404 }
      );
    }

    const parsed = createTransactionSchema.safeParse({
      transactionType:
        body.transactionType ?? existing.transactionType,
      transactionHeadId:
        body.transactionHeadId ?? existing.transactionHeadId,
      transactionDate:
        body.transactionDate ?? existing.transactionDate,
      rentalFromDate:
        body.rentalFromDate === undefined
          ? existing.rentalFromDate
          : body.rentalFromDate,
      rentalToDate:
        body.rentalToDate === undefined
          ? existing.rentalToDate
          : body.rentalToDate,
      amount: body.amount ?? existing.amount,
      remarks:
        body.remarks === undefined
          ? existing.remarks
          : body.remarks,
      relatedToTransactionId:
        body.relatedToTransactionId === undefined
          ? existing.relatedToTransactionId
          : body.relatedToTransactionId,
    });

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
        eq(transactionHeads.id, data.transactionHeadId)
      )
      .limit(1);

    if (!head) {
      return Response.json(
        { success: false, message: "Transaction head not found." },
        { status: 404 }
      );
    }

    if (!head.isActive &&
      head.id !== existing.transactionHeadId) {
      return Response.json(
        { success: false, message: "Cannot use an inactive head." },
        { status: 400 }
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
      if (data.relatedToTransactionId === id) {
        return Response.json(
          { success: false, message: "A transaction cannot relate to itself." },
          { status: 400 }
        );
      }

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
          { success: false, message: "Related transaction must be a credit." },
          { status: 400 }
        );
      }
    }

    const [updated] = await db
      .update(accountTransactions)
      .set({
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
        updatedByAdminId: admin!.adminId,
        updatedAt: new Date(),
      })
      .where(eq(accountTransactions.id, id))
      .returning();

    return Response.json({
      success: true,
      message: "Transaction updated.",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH finance transaction:", error);

    return Response.json(
      { success: false, message: "Failed to update transaction." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  context: Context
) {
  const { response } = await requireFinanceAdmin();
  if (response) return response;

  try {
    const { id } = await context.params;

    const [existing] = await db
      .select({ id: accountTransactions.id })
      .from(accountTransactions)
      .where(eq(accountTransactions.id, id))
      .limit(1);

    if (!existing) {
      return Response.json(
        { success: false, message: "Transaction not found." },
        { status: 404 }
      );
    }

    const [dependent] = await db
      .select({ id: accountTransactions.id })
      .from(accountTransactions)
      .where(
        and(
          eq(
            accountTransactions.relatedToTransactionId,
            id
          ),
          ne(accountTransactions.id, id)
        )
      )
      .limit(1);

    if (dependent) {
      return Response.json(
        {
          success: false,
          message: "This earning has linked expenses. Remove or reassign those links first.",
        },
        { status: 409 }
      );
    }

    await db
      .delete(accountTransactions)
      .where(eq(accountTransactions.id, id));

    return Response.json({
      success: true,
      message: "Transaction deleted.",
    });
  } catch (error) {
    console.error("DELETE finance transaction:", error);

    return Response.json(
      { success: false, message: "Failed to delete transaction." },
      { status: 500 }
    );
  }
}
