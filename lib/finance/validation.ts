
import { z } from "zod";

const dateSchema = z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Invalid date. Use YYYY-MM-DD."
);

export const createHeadSchema = z.object({
    name: z.string().trim().min(2).max(150),
    headType: z.enum([
        "INCOME_SOURCE",
        "PERSON",
        "COLLECTIVE",
        "EXPENSE",
        "OTHER",
    ]),
    allowedTransactionType: z.enum([
        "CREDIT",
        "DEBIT",
        "BOTH",
    ]),
    requiresRentalDates: z.boolean().default(false),
});

export const updateHeadSchema = createHeadSchema.partial().extend({
    isActive: z.boolean().optional(),
});

export const createTransactionSchema = z.object({
    transactionType: z.enum(["CREDIT", "DEBIT"]),
    transactionHeadId: z.string().uuid(),
    transactionDate: dateSchema,
    rentalFromDate: dateSchema.nullable().optional(),
    rentalToDate: dateSchema.nullable().optional(),
    amount: z.string().regex(
        /^\d+(\.\d{1,2})?$/,
        "Invalid amount."
    ),
    remarks: z.string().trim().max(2000).nullable().optional(),
    relatedToTransactionId: z.string().uuid().nullable().optional(),
});

export const updateTransactionSchema = createTransactionSchema;

export function validateTransactionRules(
    data: z.infer<typeof createTransactionSchema>,
    head: {
        allowedTransactionType: string;
        requiresRentalDates: boolean;
    }
) {
    if (Number(data.amount) <= 0) {
        return "Amount must be greater than zero.";
    }

    if (
        head.allowedTransactionType !== "BOTH" &&
        head.allowedTransactionType !== data.transactionType
    ) {
        return "This transaction head does not allow this transaction type.";
    }

    if (
        data.transactionType === "CREDIT" &&
        head.requiresRentalDates &&
        (!data.rentalFromDate || !data.rentalToDate)
    ) {
        return "Rental start and end dates are required.";
    }

    if (
        data.rentalFromDate &&
        data.rentalToDate &&
        data.rentalToDate < data.rentalFromDate
    ) {
        return "Rental end date cannot be before start date.";
    }

    if (
        data.transactionType === "CREDIT" &&
        data.relatedToTransactionId
    ) {
        return "Credit transactions cannot be linked to another transaction.";
    }

    return null;
}
