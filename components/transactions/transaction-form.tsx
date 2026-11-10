
"use client";

import {
    CalendarDays,
    Link2,
    Loader2,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

import type {
    AccountTransaction,
    TransactionHead,
    TransactionType,
} from "@/lib/finance/types";

import {
    Search,
} from "lucide-react";

interface RelatedCredit {
    id: string;
    transactionHeadName: string;
    transactionDate: string;
    amount: string;
    remarks: string | null;
}

interface Props {
    open: boolean;
    type: TransactionType | null;
    transaction: AccountTransaction | null;
    heads: TransactionHead[];
    onClose: () => void;
    onSaved: () => void;
}

const today = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .slice(0, 10);
};

export default function TransactionForm({
    open,
    type,
    transaction,
    heads,
    onClose,
    onSaved,
}: Props) {
    const isEdit = !!transaction;
    const isCredit = type === "CREDIT";

    const [transactionDate, setTransactionDate] = useState(today());

    const [headId, setHeadId] = useState("");

    const [rentalFrom, setRentalFrom] = useState("");

    const [rentalTo, setRentalTo] = useState("");

    const [amount, setAmount] = useState("");

    const [remarks, setRemarks] = useState("");

    const [relatedId, setRelatedId] = useState("");

    const [credits, setCredits] = useState<RelatedCredit[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [creditSearch, setCreditSearch] = useState("");
    const [creditsLoading, setCreditsLoading] = useState(false);
    const [creditsError, setCreditsError] = useState("");

    const selectedHead = heads.find((head) => head.id === headId);

    const visibleHeads = heads.filter(
        (head) =>
            head.isActive &&
            (
                head.allowedTransactionType === "BOTH" ||
                head.allowedTransactionType === type
            )
    );

    useEffect(() => {
        if (!open) return;

        if (transaction) {
            setTransactionDate(transaction.transactionDate?.slice(0, 10) ?? today());
            setHeadId(transaction.transactionHeadId ?? "");
            setRentalFrom(transaction.rentalFromDate?.slice(0, 10) ?? "");
            setRentalTo(transaction.rentalToDate?.slice(0, 10) ?? "");
            setAmount(String(transaction.amount ?? ""));
            setRemarks(transaction.remarks ?? "");
            setRelatedId(transaction.relatedToTransactionId ?? "");
        } else {
            // Reset fields when creating a new transaction
            setTransactionDate(today());
            setHeadId("");
            setRentalFrom("");
            setRentalTo("");
            setAmount("");
            setRemarks("");
            setRelatedId("");
        }

        setError("");
    }, [open, transaction]);

    const fetchCredits = async (search = "") => {
        setCreditsLoading(true);
        setCreditsError("");

        try {
            const params = new URLSearchParams();

            if (search.trim()) {
                params.set("search", search.trim());
            }

            const response = await fetch(
                `/api/admin/finance/related-transactions?${params.toString()}`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to load earning transactions."
                );
            }
            const newCredits = result.data as RelatedCredit[];

            setCredits(newCredits);
        } catch (err) {
            setCreditsError(
                err instanceof Error
                    ? err.message
                    : "Unable to load earning transactions."
            );
        } finally {
            setCreditsLoading(false);
        }
    };

    // Initial fetch when opening a debit form.
    useEffect(() => {
        if (!open || type !== "DEBIT") return;

        setCreditSearch("");
        fetchCredits("");
    }, [open, type]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        if (!headId) {
            setError("Please select a transaction head.");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                transactionType: type,
                transactionHeadId: headId,
                transactionDate,

                rentalFromDate:
                    isCredit && selectedHead?.requiresRentalDates
                        ? rentalFrom || null
                        : null,

                rentalToDate:
                    isCredit && selectedHead?.requiresRentalDates
                        ? rentalTo || null
                        : null,

                amount,
                remarks: remarks.trim() || null,

                relatedToTransactionId:
                    !isCredit ? relatedId || null : null,
            };

            const response = await fetch(
                isEdit
                    ? `/api/admin/finance/transactions/${transaction.id}`
                    : "/api/admin/finance/transactions",
                {
                    method: isEdit ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to save transaction."
                );
            }

            onSaved();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const labelClass =
        "mb-2 block text-sm font-semibold text-gray-700";

    const inputClass =
        "h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-base outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

    return (
        <div
            className={`fixed inset-x-0 bottom-0 z-[12] flex items-end justify-center rounded-t-2xl transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-[100%]"
                }`}
        >
            <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
                <div className={`sticky top-0 z-[12] flex items-center justify-between border-b border-gray-200 px-5 py-4 ${isCredit ? "bg-green-50" : "bg-red-50"
                    }`}>
                    <div>
                        <h2 className={`text-xl font-bold ${isCredit ? "text-green-800" : "text-red-800"
                            }`}>
                            {isEdit ? "Edit" : "Add"} {isCredit ? "Credit" : "Debit"}
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            {isCredit
                                ? "Record business income"
                                : "Record business expenses"}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
                        aria-label="Close form"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-5">
                    <div>
                        <label className={labelClass}>
                            Transaction Date *
                        </label>
                        <input
                            required
                            type="date"
                            value={transactionDate}
                            onChange={(e) => setTransactionDate(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Transaction Purpose *
                        </label>

                        <select
                            required
                            value={headId}
                            onChange={(e) => setHeadId(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Select purpose</option>

                            {visibleHeads.map((head) => (
                                <option key={head.id} value={head.id}>
                                    {head.name}
                                </option>
                            ))}
                        </select>

                        {!visibleHeads.length && (
                            <p className="mt-2 text-xs text-amber-700">
                                No suitable heads available. Add one through Manage Heads.
                            </p>
                        )}
                    </div>

                    {isCredit && selectedHead?.requiresRentalDates && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-800">
                                <CalendarDays size={17} />
                                Rental Period
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>
                                        From Date *
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        value={rentalFrom}
                                        onChange={(e) => setRentalFrom(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        To Date *
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        min={rentalFrom || undefined}
                                        value={rentalTo}
                                        onChange={(e) => setRentalTo(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className={labelClass}>
                            Amount (Rs.) *
                        </label>
                        <input
                            required
                            type="number"
                            inputMode="decimal"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className={inputClass}
                        />
                    </div>


                    {!isCredit && (
                        <div>
                            <label className={labelClass}>
                                <span className="inline-flex items-center gap-2">
                                    <Link2 size={16} />
                                    Related To (Optional)
                                </span>
                            </label>

                            {/* Search */}
                            <div className="mb-3 flex gap-2">
                                <div className="relative min-w-0 flex-1">
                                    <input
                                        type="text"
                                        value={creditSearch}
                                        onChange={(e) => setCreditSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                fetchCredits(creditSearch);
                                            }
                                        }}
                                        placeholder="Search name, date, amount..."
                                        className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => fetchCredits(creditSearch)}
                                    disabled={creditsLoading}
                                    className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {creditsLoading ? (
                                        <Loader2 size={17} className="animate-spin" />
                                    ) : (
                                        <Search size={17} />
                                    )}

                                    <span className="hidden sm:inline">Search</span>
                                </button>
                            </div>

                            {/* Transaction selector */}
                            <div className="relative">
                                <select
                                    value={relatedId}
                                    onChange={(e) => setRelatedId(e.target.value)}
                                    className={inputClass}
                                    disabled={creditsLoading && credits.length === 0}
                                >
                                    <option value="">Not linked to any earning</option>

                                    {/* Preserve existing linked transaction during editing */}
                                    {!creditSearch && transaction?.relatedTransaction &&
                                        !credits.some(
                                            (credit) =>
                                                credit.id === transaction.relatedTransaction?.id
                                        ) && (
                                            <option value={transaction.relatedTransaction.id}>
                                                {transaction.relatedTransaction.transactionHeadName}
                                                {" · "}
                                                {transaction.relatedTransaction.transactionDate}
                                                {" · Rs. "}
                                                {Number(
                                                    transaction.relatedTransaction.amount
                                                ).toLocaleString("en-IN")}
                                            </option>
                                        )}

                                    {credits.map((credit) => (
                                        <option key={credit.id} value={credit.id}>
                                            {credit.transactionHeadName}
                                            {" · "}
                                            {credit.transactionDate}
                                            {" · Rs. "}
                                            {Number(credit.amount).toLocaleString("en-IN")}
                                        </option>
                                    ))}
                                </select>

                                {creditsLoading && (
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                                        <Loader2
                                            size={16}
                                            className="animate-spin text-blue-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Loading / Error / Empty states */}
                            {creditsError ? (
                                <p className="mt-2 text-xs text-red-600">
                                    {creditsError}
                                </p>
                            ) : (
                                <p className="mt-2 text-xs text-gray-500">
                                    {creditsLoading
                                        ? "Loading earning transactions..."
                                        : `${credits.length} earning transactions loaded to link.`}
                                </p>
                            )}
                        </div>
                    )}


                    <div>
                        <label className={labelClass}>
                            Remarks (Optional)
                        </label>

                        <textarea
                            rows={3}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Additional details..."
                            className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-base outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="h-12 flex-1 rounded-xl border border-gray-200 font-semibold text-gray-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting || !visibleHeads.length}
                            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl font-bold text-white disabled:opacity-50 ${isCredit
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                                }`}
                        >
                            {submitting && (
                                <Loader2 size={18} className="animate-spin" />
                            )}
                            {isEdit ? "Update" : "Save"} {isCredit ? "Credit" : "Debit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
