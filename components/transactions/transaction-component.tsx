
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
