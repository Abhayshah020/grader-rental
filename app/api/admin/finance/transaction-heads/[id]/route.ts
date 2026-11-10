
import { and, eq, ne } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { accountTransactions, transactionHeads } from "@/lib/db/schema";
import { requireFinanceAdmin } from "@/lib/finance/auth";
import { updateHeadSchema } from "@/lib/finance/validation";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: Context) {
  const { response } = await requireFinanceAdmin();
  if (response) return response;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateHeadSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(transactionHeads)
      .where(eq(transactionHeads.id, id))
      .limit(1);

    if (!existing) {
      return Response.json(
        { success: false, message: "Transaction head not found." },
        { status: 404 }
      );
    }

    if (parsed.data.name) {
      const [duplicate] = await db
        .select({ id: transactionHeads.id })
        .from(transactionHeads)
        .where(
          and(
            eq(transactionHeads.name, parsed.data.name),
            ne(transactionHeads.id, id)
          )
        )
        .limit(1);

      if (duplicate) {
        return Response.json(
          { success: false, message: "This head name already exists." },
          { status: 409 }
        );
      }
    }

    const [updated] = await db
      .update(transactionHeads)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(transactionHeads.id, id))
      .returning();

    return Response.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH transaction head:", error);

    return Response.json(
      { success: false, message: "Failed to update transaction head." },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: Context) {
  const { response } = await requireFinanceAdmin();
  if (response) return response;

  try {
    const { id } = await context.params;

    const [existing] = await db
      .select({ id: transactionHeads.id })
      .from(transactionHeads)
      .where(eq(transactionHeads.id, id))
      .limit(1);

    if (!existing) {
      return Response.json(
        { success: false, message: "Transaction head not found." },
        { status: 404 }
      );
    }

    const [usage] = await db
      .select({ id: accountTransactions.id })
      .from(accountTransactions)
      .where(eq(accountTransactions.transactionHeadId, id))
      .limit(1);

    if (usage) {
      return Response.json(
        {
          success: false,
          message: "This head is already used. Deactivate it instead.",
        },
        { status: 409 }
      );
    }

    await db
      .delete(transactionHeads)
      .where(eq(transactionHeads.id, id));

    return Response.json({
      success: true,
      message: "Transaction head deleted.",
    });
  } catch (error) {
    console.error("DELETE transaction head:", error);

    return Response.json(
      { success: false, message: "Failed to delete transaction head." },
      { status: 500 }
    );
  }
}
