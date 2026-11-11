
"use client";

import {
    useCallback,
    useEffect,
    useState,
    useMemo,
} from "react";

import {
    Plus,
    Minus,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Wallet,
    TrendingUp,
    TrendingDown,
    Settings2,
    RefreshCw,
    X,
    CalendarDays,
    Loader2,
    SlidersHorizontal,
} from "lucide-react";

import type {
    AccountTransaction,
    FinanceSummary,
    TransactionHead,
    TransactionType,
} from "@/lib/finance/types";
import TransactionHistory from "./transaction-history";
import BalanceDrawer from "./balance-drawer";
import TransactionForm from "./transaction-form";
import TransactionHeadManager from "./transaction-head-manager";
import TransactionFilter from "./transaction-filter";
import { useAppDialog } from "../app-dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { formatADShort } from "@/lib/date/nepali-date";

interface TransactionPDFRow {
    id: string;
    transactionType: "CREDIT" | "DEBIT";
    transactionHeadName: string;
    transactionDate: string;
    amount: string | number;
    remarks: string | null;
    relatedTransaction: {
        transactionDate: string;
        amount: string | number;
        transactionHeadName: string;
    } | null;
}

interface TransactionAPIResponse {
    success: boolean;
    message?: string;
    data: TransactionPDFRow[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function TransactionPage() {
    const { alert, confirm } = useAppDialog();

    const [selectedTransaction, setSelectedTransaction] =
        useState<AccountTransaction | null>(null);

    const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
    const [heads, setHeads] = useState<TransactionHead[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [type, setType] = useState("ALL");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [formType, setFormType] =
        useState<TransactionType | null>(null);

    const [editing, setEditing] =
        useState<AccountTransaction | null>(null);

    const [showDrawer, setShowDrawer] = useState(false);
    const [showHeads, setShowHeads] = useState(false);

    const [error, setError] = useState("");

    const [searchInput, setSearchInput] = useState("");

    const [showFilters, setShowFilters] = useState(false);

    const [includeRelated, setIncludeRelated] = useState(true);

    const [selectedHeadId, setSelectedHeadId] = useState("ALL");
    const [datePreset, setDatePreset] = useState("ALL");

    const [downloadingPDF, setDownloadingPDF] = useState(false);

    const getDateRange = (preset: string) => {
        const today = new Date();
        const end = new Date(today);

        if (preset === "ALL") {
            return { from: "", to: "" };
        }

        const start = new Date(today);

        const days: Record<string, number> = {
            "1_WEEK": 7,
            "1_MONTH": 30,
            "3_MONTHS": 90,
            "6_MONTHS": 180,
            "1_YEAR": 365,
        };

        start.setDate(start.getDate() - (days[preset] ?? 0));

        const toISO = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        return {
            from: toISO(start),
            to: toISO(end),
        };
    };

    const downloadTransactionsPDF = useCallback(async () => {
        setDownloadingPDF(true);
        setError("");

        try {
            // Reuse exactly the same filters as transaction history.
            const params = new URLSearchParams({
                page: "1",
                limit: "100",
                includeRelated: String(includeRelated),
            });

            if (searchInput.trim()) {
                params.set("search", searchInput.trim());
            }

            if (type !== "ALL") {
                params.set("type", type);
            }

            if (from) params.set("from", from);
            if (to) params.set("to", to);

            if (selectedHeadId !== "ALL") {
                params.set("headId", selectedHeadId);
            }

            // Fetch first page.
            const firstResponse = await fetch(
                `/api/admin/finance/transactions?${params.toString()}`,
                { cache: "no-store" }
            );

            const firstResult: TransactionAPIResponse =
                await firstResponse.json();

            if (!firstResponse.ok || !firstResult.success) {
                throw new Error(
                    firstResult.message || "Failed to fetch transactions."
                );
            }

            const allTransactions = [...firstResult.data];

            // Fetch remaining pages if necessary.
            for (
                let page = 2;
                page <= firstResult.pagination.totalPages;
                page++
            ) {
                params.set("page", String(page));

                const response = await fetch(
                    `/api/admin/finance/transactions?${params.toString()}`,
                    { cache: "no-store" }
                );

                const result: TransactionAPIResponse =
                    await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || `Failed to fetch page ${page}.`
                    );
                }

                allTransactions.push(...result.data);
            }

            if (!allTransactions.length) {
                throw new Error(
                    "No transactions found for the selected filters."
                );
            }

            // Oldest transactions first.
            allTransactions.sort((a, b) => {
                const dateComparison =
                    a.transactionDate.localeCompare(b.transactionDate);

                if (dateComparison !== 0) return dateComparison;

                return a.id.localeCompare(b.id);
            });

            // Calculate totals.
            const totalCredit = allTransactions
                .filter((t) => t.transactionType === "CREDIT")
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);

            const totalDebit = allTransactions
                .filter((t) => t.transactionType === "DEBIT")
                .reduce((sum, t) => sum + Number(t.amount || 0), 0);

            const netMovement = totalCredit - totalDebit;

            const formatAmount = (amount: number) =>
                `Rs. ${amount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`;

            // Create PDF.
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pageWidth = doc.internal.pageSize.getWidth();

            // Document heading.
            doc.setFont("helvetica", "bold");
            doc.setFontSize(17);
            doc.text("TRANSACTION STATEMENT", pageWidth / 2, 17, {
                align: "center",
            });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(90);

            doc.text(
                `Generated on: ${formatADShort(
                    new Date().toISOString().slice(0, 10)
                )}`,
                pageWidth / 2,
                24,
                { align: "center" }
            );

            // Applied filters.
            doc.setTextColor(40);
            doc.setFontSize(9);

            const filterParts = [
                `Type: ${type === "ALL" ? "All Transactions" : type}`,
                `From: ${from ? formatADShort(from) : "All"}`,
                `To: ${to ? formatADShort(to) : "All"}`,
                `Records: ${allTransactions.length}`,
            ];

            doc.text(filterParts.join("    |    "), 14, 33);

            // Table data.
            const tableRows = allTransactions.map((transaction) => {
                let particulars = transaction.remarks?.trim() || "-";

                if (
                    includeRelated &&
                    transaction.transactionType === "DEBIT" &&
                    transaction.relatedTransaction
                ) {
                    particulars +=
                        `\nRelated earning: ${transaction.relatedTransaction.transactionHeadName}`;
                }

                return [
                    formatADShort(transaction.transactionDate),
                    particulars,
                    transaction.transactionHeadName,
                    transaction.transactionType === "CREDIT"
                        ? formatAmount(Number(transaction.amount))
                        : "-",
                    transaction.transactionType === "DEBIT"
                        ? formatAmount(Number(transaction.amount))
                        : "-",
                ];
            });

            autoTable(doc, {
                startY: 39,
                head: [[
                    "Date",
                    "Particulars",
                    "Transaction Head",
                    "Credit",
                    "Debit",
                ]],
                body: tableRows,

                theme: "grid",

                styles: {
                    font: "helvetica",
                    fontSize: 8,
                    cellPadding: 2.5,
                    textColor: [45, 55, 65],
                    lineColor: [220, 225, 230],
                    lineWidth: 0.15,
                    overflow: "linebreak",
                    valign: "middle",
                },

                headStyles: {
                    fillColor: [235, 242, 247],
                    textColor: [35, 55, 70],
                    fontStyle: "bold",
                    halign: "center",
                },

                columnStyles: {
                    0: { cellWidth: 27 },
                    1: { cellWidth: 57 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 33, halign: "right" },
                    4: { cellWidth: 33, halign: "right" },
                },

                foot: [
                    [
                        {
                            content: "TOTAL CREDIT",
                            colSpan: 3,
                            styles: { halign: "right", fontStyle: "bold" },
                        },
                        {
                            content: formatAmount(totalCredit),
                            styles: { fontStyle: "bold", halign: "right" },
                        },
                        "",
                    ],
                    [
                        {
                            content: "TOTAL DEBIT",
                            colSpan: 3,
                            styles: { halign: "right", fontStyle: "bold" },
                        },
                        "",
                        {
                            content: formatAmount(totalDebit),
                            styles: { fontStyle: "bold", halign: "right" },
                        },
                    ],
                    [
                        {
                            content: "NET MOVEMENT",
                            colSpan: 3,
                            styles: { halign: "right", fontStyle: "bold" },
                        },
                        {
                            content: netMovement >= 0
                                ? formatAmount(netMovement)
                                : "-",
                            styles: { fontStyle: "bold", halign: "right" },
                        },
                        {
                            content: netMovement < 0
                                ? formatAmount(Math.abs(netMovement))
                                : "-",
                            styles: { fontStyle: "bold", halign: "right" },
                        },
                    ],
                ],

                showFoot: "lastPage",

                footStyles: {
                    fillColor: [245, 247, 249],
                    textColor: [35, 45, 55],
                    lineColor: [190, 200, 210],
                    lineWidth: 0.2,
                },

                margin: {
                    top: 12,
                    left: 14,
                    right: 14,
                    bottom: 20,
                },

                didDrawPage: () => {
                    const pageHeight = doc.internal.pageSize.getHeight();

                    doc.setFontSize(8);
                    doc.setTextColor(130);
                    doc.setFont("helvetica", "normal");

                    doc.text(
                        `Page ${doc.internal.pages.length - 1}`,
                        pageWidth - 14,
                        pageHeight - 8,
                        { align: "right" }
                    );
                },
            });

            // Download.
            const filename = `transaction-statement-${new Date()
                .toISOString()
                .slice(0, 10)}.pdf`;

            doc.save(filename);

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to generate transaction statement."
            );
        } finally {
            setDownloadingPDF(false);
        }
    }, [
        searchInput,
        type,
        from,
        to,
        selectedHeadId,
        includeRelated,
    ]);


    const loadHeads = useCallback(async () => {
        const response = await fetch(
            "/api/admin/finance/transaction-heads?includeInactive=true",
            { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to load heads.");
        }

        setHeads(result.data);
    }, []);

    const summary = useMemo<FinanceSummary>(() => {
        let totalCredit = 0;
        let totalDebit = 0;

        for (const transaction of transactions) {
            const amountInCents = Math.round(
                Number(transaction.amount) * 100
            );

            if (!Number.isFinite(amountInCents)) continue;

            if (transaction.transactionType === "CREDIT") {
                totalCredit += amountInCents;
            } else if (transaction.transactionType === "DEBIT") {
                totalDebit += amountInCents;
            }
        }

        return {
            totalCredit: (totalCredit / 100).toFixed(2),
            totalDebit: (totalDebit / 100).toFixed(2),
            balance: ((totalCredit - totalDebit) / 100).toFixed(2),
        };
    }, [transactions]);

    const handleSearch = (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (searchInput.trim() === "") {
            refresh();
        } else {
            loadTransactions();
        }
    };

    const loadTransactions = useCallback(
        async (
            currentPage = 1,
            append = false
        ) => {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            try {
                const params = new URLSearchParams({
                    page: String(currentPage),
                    limit: "20",
                    includeRelated: String(includeRelated),
                });

                if (searchInput.trim()) {
                    params.set("search", searchInput.trim());
                }

                if (type !== "ALL") {
                    params.set("type", type);
                }

                if (from) params.set("from", from);
                if (to) params.set("to", to);

                if (selectedHeadId !== "ALL") {
                    params.set("headId", selectedHeadId);
                }

                const response = await fetch(
                    `/api/admin/finance/transactions?${params.toString()}`,
                    { cache: "no-store" }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Failed to load transactions."
                    );
                }

                setTransactions((previous) =>
                    append
                        ? [...previous, ...result.data]
                        : result.data
                );

                setPage(currentPage);
                setTotalPages(result.pagination.totalPages);
                setError("");
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Something went wrong."
                );
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [
            searchInput,
            type,
            from,
            to,
            selectedHeadId,
            includeRelated,
        ]
    );

    const refresh = useCallback(async () => {
        try {
            await Promise.all([
                loadHeads(),
                loadTransactions(1),
            ]);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to refresh."
            );
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            refresh();
        }, 250);

        return () => clearTimeout(timer);
    }, []);

    const openForm = (transactionType: TransactionType) => {
        setEditing(null);
        setFormType(transactionType);
    };

    const openEdit = (transaction: AccountTransaction) => {
        setFormType(transaction.transactionType);
        setEditing(transaction);
    };

    const closeForm = () => {
        setFormType(null);
        setEditing(null);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm(
            "",
            {
                title: "Delete Transaction?",
                confirmText: "Delete",
                cancelText: "Keep",
                variant: "danger",
            }
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `/api/admin/finance/transactions/${id}`,
                { method: "DELETE" }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message);
            }

            await Promise.all([
                loadTransactions(1),
            ]);
            setSelectedTransaction(null);
        } catch (err) {
            alert(
                err instanceof Error ? err.message : "Delete failed."
            );
        }
    };

    const handleSaved = async () => {
        closeForm();

        await Promise.all([
            loadTransactions(1),
        ]);
    };

    return (
        <main className="min-h-dvh bg-[#f7f8fa] text-gray-900">
            <div className="mx-auto max-w-5xl pt-5 pb-10 sm:pt-8">
                <section className="mb-4 relative px-4 sm:px-6">
                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2"
                    >
                        <div className="relative min-w-0 flex-1">
                            <input
                                type="search"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search transactions..."
                                enterKeyHint="search"
                                className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowFilters((prev) => !prev)}
                            aria-label="Toggle filters"
                            aria-expanded={showFilters}
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition ${showFilters
                                ? "border-blue-200 bg-blue-50 text-blue-600"
                                : "border-gray-200 bg-white text-gray-600"
                                }`}
                        >
                            <SlidersHorizontal size={19} />
                        </button>

                        <button
                            type="submit"
                            aria-label="Search"
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 active:scale-95"
                        >
                            {searchInput ? <Search size={19} /> : <RefreshCw size={18} />}
                        </button>
                    </form>
                </section>
                <TransactionFilter
                    selectedHeadId={selectedHeadId}
                    setSelectedHeadId={setSelectedHeadId}
                    type={type}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    datePreset={datePreset}
                    setDatePreset={setDatePreset}
                    getDateRange={getDateRange}
                    from={from}
                    setFrom={setFrom}
                    to={to}
                    setTo={setTo}
                    setType={setType}
                    includeRelated={includeRelated}
                    setIncludeRelated={setIncludeRelated}
                    heads={heads}
                    setSearchInput={setSearchInput}
                    loadTransactions={loadTransactions}
                    downloadTransactionsPDF={downloadTransactionsPDF}
                    downloadingPDF={downloadingPDF}
                />

                {/* Error */}
                {error && (
                    <div className="flex w-full items-center justify-center">
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            Something went wrong
                        </div>
                    </div>
                )}

                {/* History */}
                <section>
                    <div className="mb-3 flex items-center justify-between px-4 sm:px-6">
                        <h2 className="text-sm text-gray-800">
                            {heads.find((h) => h.id === selectedHeadId)?.name || "All"} Transaction History
                        </h2>

                        <span className="text-xs text-gray-500">
                            {transactions.length} loaded
                        </span>
                    </div>
                    <div className="sm:px-6">
                        <TransactionHistory
                            transactions={transactions}
                            loading={loading}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                            setSelectedTransaction={setSelectedTransaction}
                            selectedTransaction={selectedTransaction}
                        />
                    </div>

                    {page < totalPages && (
                        <div className="flex w-full items-center justify-center">
                            <button
                                onClick={() => loadTransactions(page + 1, true)}
                                disabled={loadingMore}
                                className="mt-4 px-10 cursor-pointer flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    "Load More"
                                )}
                            </button>
                        </div>
                    )}
                </section>
            </div>

            <BalanceDrawer
                openForm={openForm}
                summary={summary}
                open={showDrawer}
                summaryLoading={loading || loadingMore}
                onToggle={() => setShowDrawer((value) => !value)}
                onManageHeads={() => setShowHeads(true)}
            />

            <TransactionForm
                open={!!formType}
                type={formType}
                transaction={editing}
                heads={heads}
                onClose={closeForm}
                onSaved={handleSaved}

            />

            <TransactionHeadManager
                open={showHeads}
                heads={heads}
                onClose={() => setShowHeads(false)}
                onChanged={refresh}
            />
        </main>
    );
}
