
export const TRANSACTION_TYPES = [
    "CREDIT",
    "DEBIT",
] as const;

export const TRANSACTION_PURPOSES = [
    "GRADER_RENT",
    "ROLLER_RENT",
    "EXCAVATOR_RENT",
    "SALARY_PAYING",
    "LOAN_PAYMENT",
    "BUSINESS_EXPENSE",
    "GENERAL_EXPENSE",
] as const;

export type TransactionType =
    (typeof TRANSACTION_TYPES)[number];

export type TransactionPurpose =
    (typeof TRANSACTION_PURPOSES)[number];

export const isRentalPurpose = (
    purpose: string
): boolean => {
    return [
        "GRADER_RENT",
        "ROLLER_RENT",
        "EXCAVATOR_RENT",
    ].includes(purpose);
};

export function isValidDate(value: unknown): value is string {
    if (typeof value !== "string") return false;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}

export function validateTransaction(data: any) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return "Invalid request body.";
    }

    if (!TRANSACTION_TYPES.includes(data.transactionType)) {
        return "Invalid transaction type.";
    }

    if (!TRANSACTION_PURPOSES.includes(data.purpose)) {
        return "Invalid transaction purpose.";
    }

    if (!isValidDate(data.transactionDate)) {
        return "Invalid transaction date.";
    }

    if (
        typeof data.amount !== "string" &&
        typeof data.amount !== "number"
    ) {
        return "Invalid transaction amount.";
    }

    const amount = String(data.amount);

    if (!/^\d{1,10}(\.\d{1,2})?$/.test(amount)) {
        return "Amount must be positive and have at most 2 decimal places.";
    }

    if (Number(amount) <= 0) {
        return "Amount must be greater than zero.";
    }

    if (isRentalPurpose(data.purpose)) {
        if (
            !isValidDate(data.rentalFromDate) ||
            !isValidDate(data.rentalToDate)
        ) {
            return "Valid rental start and end dates are required.";
        }

        if (data.rentalFromDate > data.rentalToDate) {
            return "Rental end date must be after start date.";
        }
    }

    if (
        data.remarks !== undefined &&
        data.remarks !== null &&
        typeof data.remarks !== "string"
    ) {
        return "Invalid remarks.";
    }

    return null;
}
