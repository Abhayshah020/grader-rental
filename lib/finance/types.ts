
export type TransactionType = "CREDIT" | "DEBIT";

export type AllowedTransactionType =
  | "CREDIT"
  | "DEBIT"
  | "BOTH";

export type TransactionHeadType =
  | "INCOME_SOURCE"
  | "PERSON"
  | "COLLECTIVE"
  | "EXPENSE"
  | "OTHER";

export interface TransactionHead {
  id: string;
  name: string;
  headType: TransactionHeadType;
  allowedTransactionType: AllowedTransactionType;
  requiresRentalDates: boolean;
  isActive: boolean;
}

export interface AccountTransaction {
  id: string;
  transactionType: TransactionType;
  transactionHeadId: string;
  transactionHeadName: string;
  transactionDate: string;
  rentalFromDate: string | null;
  rentalToDate: string | null;
  amount: string;
  remarks: string | null;
  relatedToTransactionId: string | null;
  relatedTransaction?: {
    id: string;
    transactionHeadName: string;
    transactionDate: string;
    amount: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSummary {
  totalCredit: string;
  totalDebit: string;
  balance: string;
}
