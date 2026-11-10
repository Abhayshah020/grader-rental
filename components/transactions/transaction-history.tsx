
"use client";

import { useEffect, useState } from "react";
import {
    Pencil,
    Trash2,
    CalendarDays,
    Link2,
    ReceiptText,
    Loader2,
    X,
    ChevronRight,
    ArrowDownLeft,
    ArrowUpRight,
    FileText,
} from "lucide-react";

import type { AccountTransaction } from "@/lib/finance/types";

interface Props {
    transactions: AccountTransaction[];
    loading: boolean;
    onEdit: (transaction: AccountTransaction) => void;
    onDelete: (id: string) => void;
    setSelectedTransaction: (data: AccountTransaction | null) => void;
    selectedTransaction: AccountTransaction | null;
}

const formatMoney = (value: string) =>
    new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 2,
    }).format(Number(value));

const formatDate = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

export default function TransactionHistory({
    transactions,
    loading,
    onEdit,
    onDelete,
    selectedTransaction,
    setSelectedTransaction,
}: Props) {
    const isCredit =
        selectedTransaction?.transactionType === "CREDIT";

    useEffect(() => {
        if (!selectedTransaction) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedTransaction(null);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [selectedTransaction]);

    const handleEdit = () => {
        if (!selectedTransaction) return;

        const transaction = selectedTransaction;
        // setSelectedTransaction(null);
        onEdit(transaction);
    };

    const handleDelete = () => {
        if (!selectedTransaction) return;

        const id = selectedTransaction.id;

        onDelete(id);

    };

    if (loading) {
        return (
            <div className="flex min-h-48 items-center justify-center">
                <Loader2
                    className="animate-spin text-gray-400"
                    size={25}
                />
            </div>
        );
    }

    if (!transactions.length) {
        return (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-5 text-center">
                <ReceiptText
                    size={35}
                    className="mb-3 text-gray-300"
                />
                <p className="font-semibold text-gray-700">
                    No transactions found
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Your transactions will appear here.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Compact transaction list */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {transactions.map((transaction, index) => {
                    const credit =
                        transaction.transactionType === "CREDIT";

                    return (
                        <button
                            key={transaction.id}
                            type="button"
                            onClick={() =>
                                setSelectedTransaction(transaction)
                            }
                            className={`flex min-h-[76px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100 ${index !== transactions.length - 1
                                ? "border-b border-gray-100"
                                : ""
                                }`}
                        >
                            {/* Transaction type indicator */}
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${credit
                                    ? "bg-green-50 text-green-600"
                                    : "bg-red-50 text-red-600"
                                    }`}
                            >
                                {credit ? (
                                    <ArrowDownLeft size={19} />
                                ) : (
                                    <ArrowUpRight size={19} />
                                )}
                            </div>

                            {/* Purpose and date */}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[15px] font-semibold text-gray-900">
                                    {transaction.transactionHeadName}
                                </p>

                                <p className="mt-1 text-xs font-medium text-gray-500">
                                    {formatDate(transaction.transactionDate)}
                                </p>
                            </div>

                            {/* Amount */}
                            <div className="shrink-0 text-right">
                                <p
                                    className={`text-[15px] font-bold tabular-nums ${credit
                                        ? "text-green-700"
                                        : "text-red-700"
                                        }`}
                                >
                                    {credit ? "+" : "−"} Rs.{" "}
                                    {formatMoney(transaction.amount)}
                                </p>
                                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                    {credit ? "Credit" : "Debit"}
                                </p>
                            </div>

                            <ChevronRight
                                size={17}
                                className="shrink-0 text-gray-300"
                            />
                        </button>
                    );
                })}
            </div>

            {/* Transaction details bottom drawer */}

            <div
                className={`fixed inset-x-0 bottom-0 z-[11] flex items-end justify-center rounded-t-2xl transition-transform duration-300 ${selectedTransaction ? "translate-y-0" : "translate-y-[100%]"
                    }`}
            >
                <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="transaction-detail-title"
                    className="max-h-[100dvh] w-full max-w-lg animate-in slide-in-from-bottom duration-300 overflow-hidden rounded-t-3xl bg-white shadow-2xl"
                >

                    {/* Drawer header */}
                    <div className="border-b border-gray-100 px-5 pb-4 pt-3">
                        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Transaction details
                                </p>
                                <h2
                                    id="transaction-detail-title"
                                    className="mt-1 text-lg font-bold text-gray-900"
                                >
                                    {selectedTransaction ? selectedTransaction.transactionHeadName : "Transaction Details"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedTransaction(null)}
                                aria-label="Close details"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    {/* Scrollable details */}
                    <div className="max-h-[calc(88dvh-190px)] overflow-y-auto px-5 py-5">
                        {/* Amount summary */}
                        <div
                            className={`rounded-2xl p-5 ${isCredit
                                ? "bg-green-50"
                                : "bg-red-50"
                                }`}
                        >
                            <p
                                className={`text-xs font-semibold uppercase tracking-wider ${isCredit
                                    ? "text-green-700"
                                    : "text-red-700"
                                    }`}
                            >
                                {isCredit ? "Money received" : "Money paid"}
                            </p>

                            <p
                                className={`mt-2 text-3xl font-bold tabular-nums ${isCredit
                                    ? "text-green-800"
                                    : "text-red-800"
                                    }`}
                            >
                                {isCredit ? "+" : "−"} Rs.{" "}
                                {selectedTransaction ? formatMoney(selectedTransaction.amount) : "—"}
                            </p>

                            <span
                                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${isCredit
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {selectedTransaction ? selectedTransaction.transactionType : "—"}
                            </span>
                        </div>

                        {/* Basic information */}
                        <div className="mt-5 space-y-4">
                            <DetailRow
                                icon={<CalendarDays size={18} />}
                                label="Transaction date"
                                value={selectedTransaction ? formatDate(
                                    selectedTransaction.transactionDate
                                ) : "—"}
                            />

                            <DetailRow
                                icon={<ReceiptText size={18} />}
                                label="Transaction purpose"
                                value={selectedTransaction ? selectedTransaction.transactionHeadName : "—"}
                            />

                            {selectedTransaction && (selectedTransaction.rentalFromDate ||
                                selectedTransaction.rentalToDate) && (
                                    <DetailRow
                                        icon={<CalendarDays size={18} />}
                                        label="Rental period"
                                        value={`${selectedTransaction.rentalFromDate
                                            ? formatDate(
                                                selectedTransaction.rentalFromDate
                                            )
                                            : "—"
                                            } – ${selectedTransaction.rentalToDate
                                                ? formatDate(
                                                    selectedTransaction.rentalToDate
                                                )
                                                : "—"
                                            }`}
                                    />
                                )}

                            {selectedTransaction && selectedTransaction.transactionType === "DEBIT" &&
                                selectedTransaction.relatedTransaction?.id && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                        <div className="flex items-center gap-2 text-amber-800">
                                            <Link2 size={17} />
                                            <p className="text-sm font-bold">
                                                Related earning
                                            </p>
                                        </div>

                                        <p className="mt-2 font-semibold text-gray-900">
                                            {selectedTransaction.relatedTransaction.transactionHeadName}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-600">
                                            {formatDate(
                                                selectedTransaction.relatedTransaction.transactionDate
                                            )}
                                        </p>

                                        <p className="mt-2 font-bold text-amber-900">
                                            Rs.{" "}
                                            {formatMoney(
                                                selectedTransaction.relatedTransaction.amount
                                            )}
                                        </p>
                                    </div>
                                )}

                            {selectedTransaction && selectedTransaction.remarks && (
                                <div className="rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <FileText size={17} />
                                        <p className="text-sm font-semibold">
                                            Remarks
                                        </p>
                                    </div>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                        {selectedTransaction.remarks}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fixed action buttons */}
                    <div className="flex gap-3 border-t border-gray-100 bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.98]"
                        >
                            <Pencil size={17} />
                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-bold text-red-600 transition hover:bg-red-50 active:scale-[0.98]"
                        >
                            <Trash2 size={17} />
                            Delete
                        </button>
                    </div>

                </section >
            </div >
        </>
    );
}

function DetailRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-gray-400">{icon}</div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500">
                    {label}
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                    {value}
                </p>
            </div>
        </div>
    );
}
