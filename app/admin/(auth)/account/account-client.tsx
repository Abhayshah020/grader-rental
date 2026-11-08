
"use client";

import { AccountOverviewDrawer, ActionButton, Detail, formatMoney, Purpose, ShowForm, SidebarButton, SummaryCard, Transaction, TransactionType, ViewingTransaction } from "@/components/account-components";
import {
    ArrowDownLeft,
    ArrowUpRight,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Eye,
    MinusCircle,
    Pencil,
    PlusCircle,
    Receipt,
    Search,
    Trash2,
    Wallet,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useEffect } from "react";


const purposes: { value: Purpose; label: string }[] = [
    { value: "", label: "Select Purpose" },
    { value: "GRADER_RENT", label: "Grader Rent" },
    { value: "ROLLER_RENT", label: "Roller Rent" },
    { value: "EXCAVATOR_RENT", label: "Excavator Rent" },
    { value: "SALARY_PAYING", label: "Salary Paying" },
    { value: "LOAN_PAYMENT", label: "Loan Payment" },
    { value: "BUSINESS_EXPENSE", label: "Business Expense" },
    { value: "GENERAL_EXPENSE", label: "General Expense" },
];

const initialForm = {
    transactionDate: new Date().toLocaleDateString("en-CA"),
    purpose: "GRADER_RENT" as Purpose,
    rentalFromDate: "",
    rentalToDate: "",
    amount: "",
    remarks: "",
};

const isRental = (purpose: Purpose) =>
    ["GRADER_RENT", "ROLLER_RENT", "EXCAVATOR_RENT"].includes(purpose);

export default function AccountClient() {
    const [activeSection, setActiveSection] = useState("ALL");
    const [transactionType, setTransactionType] =
        useState<TransactionType>("CREDIT");

    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewing, setViewing] = useState<Transaction | null>(null);

    const [form, setForm] = useState(initialForm);

    const [formDataSavingOrEditing, setFormDataSavingOrEditing] = useState(false);
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    // Temporary local data. Neon integration comes next.
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const purposeLabel =
                purposes.find(p => p.value === transaction.purpose)?.label ?? "";

            const matchesSearch =
                purposeLabel.toLowerCase().includes(search.toLowerCase()) ||
                transaction.id.toLowerCase().includes(search.toLowerCase()) ||
                transaction.remarks?.toLowerCase().includes(search.toLowerCase());

            const matchesSection =
                activeSection === "ALL" ||
                activeSection === "MANAGE" ||
                transaction.transactionType === activeSection;

            return matchesSearch && matchesSection;
        });
    }, [transactions, search, activeSection]);

    const totalCredit = transactions
        .filter(t => t.transactionType === "CREDIT")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDebit = transactions
        .filter(t => t.transactionType === "DEBIT")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    function openForm(type: TransactionType, transaction?: Transaction) {
        setTransactionType(type);
        setEditingId(transaction?.id ?? null);

        setForm(transaction ? {
            transactionDate: transaction.transactionDate,
            purpose: transaction.purpose,
            rentalFromDate: transaction.rentalFromDate ?? "",
            rentalToDate: transaction.rentalToDate ?? "",
            amount: transaction.amount,
            remarks: transaction.remarks ?? "",
        } : {
            ...initialForm,
            transactionDate: new Date().toLocaleDateString("en-CA"),
        });

        setViewing(null);
        setShowForm(true);
    }


    async function saveTransaction(e: React.FormEvent) {
        e.preventDefault();

        if (!form.amount || Number(form.amount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        if (!form.transactionDate) {
            alert("Please select a transaction date.");
            return;
        }

        if (
            isRental(form.purpose) &&
            (!form.rentalFromDate || !form.rentalToDate)
        ) {
            alert("Please select the rental date range.");
            return;
        }

        if (
            isRental(form.purpose) &&
            form.rentalFromDate > form.rentalToDate
        ) {
            alert("Rental end date must be after start date.");
            return;
        }

        if (!form.purpose) {
            alert("Please select a transaction purpose.");
            return;
        }

        const payload = {
            transactionType,
            purpose: form.purpose,
            transactionDate: form.transactionDate,

            rentalFromDate: isRental(form.purpose)
                ? form.rentalFromDate
                : null,

            rentalToDate: isRental(form.purpose)
                ? form.rentalToDate
                : null,

            amount: form.amount,
            remarks: form.remarks?.trim() || null,
        };

        try {
            setFormDataSavingOrEditing(true);
            const response = await fetch(
                editingId
                    ? `/api/admin/transactions/${editingId}`
                    : "/api/admin/transactions",
                {
                    method: editingId ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "same-origin",
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to save transaction."
                );
            }

            const savedTransaction: Transaction = result.transaction;

            setTransactions(old =>
                editingId
                    ? old.map(t =>
                        t.id === editingId ? savedTransaction : t
                    )
                    : [savedTransaction, ...old]
            );

            setShowForm(false);
            setEditingId(null);

            alert(result.message);

        } catch (error) {
            console.error("Save transaction error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setFormDataSavingOrEditing(false);
        }
    }


    async function deleteTransaction(id: string) {
        if (!confirm("Are you sure you want to delete this transaction?")) {
            return;
        }

        try {
            const response = await fetch(
                `/api/admin/transactions/${id}`,
                {
                    method: "DELETE",
                    credentials: "same-origin",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to delete transaction."
                );
            }

            setTransactions(old =>
                old.filter(t => t.id !== id)
            );

            alert(result.message);

        } catch (error) {
            console.error("Delete transaction error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Unable to delete transaction."
            );
        }
    }

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const response = await fetch(
                    "/api/admin/transactions",
                    {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store",
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Unable to load transactions."
                    );
                }

                setTransactions(result.transactions);

            } catch (error) {
                console.error("Fetch transactions error:", error);

                alert(
                    error instanceof Error
                        ? error.message
                        : "Unable to load transactions."
                );
            }
        }

        fetchTransactions();
    }, []);


    const isCredit = transactionType === "CREDIT";

    return (
        <main className="
                relative
                flex
                h-[calc(100dvh-60px)]
                w-full
                min-w-0
                max-w-full
                flex-col
                overflow-x-clip
                overflow-y-auto
                bg-[#f7f9f8]
                lg:h-[calc(100dvh-70px)]
            ">
            <div className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">

                {/* Header */}
                <div className="mb-5 min-w-0 sm:mb-6">
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                        Account Management
                    </h1>
                </div>

                <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-6">

                    {/* Navigation */}
                    <aside className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">

                        {/* Search */}
                        <div className="relative mb-4 w-full min-w-0">
                            <Search
                                size={17}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search transactions..."
                                style={{ paddingLeft: "35px" }}
                                className="block w-full min-w-0 rounded-lg border border-gray-200 py-2.5 pr-3 text-sm outline-none focus:border-[#267a65] focus:ring-2 focus:ring-[#267a65]/10"
                            />
                        </div>

                        <p className="mb-2 hidden px-1 text-xs font-semibold uppercase tracking-wider text-gray-400 lg:block">
                            Transactions
                        </p>

                        {/* Mobile Navigation */}
                        <div className="flex w-full min-w-0 items-center gap-1.5 overflow-x-auto overscroll-x-contain pb-2 lg:flex-col lg:items-stretch lg:overflow-visible lg:pb-0">

                            <div className="shrink-0 lg:w-full">
                                <SidebarButton
                                    active={activeSection === "ALL"}
                                    onClick={() => setActiveSection("ALL")}
                                    icon={<Wallet size={17} />}
                                    label="All Transactions"
                                />
                            </div>

                            <div className="shrink-0 lg:w-full">
                                <SidebarButton
                                    active={activeSection === "CREDIT"}
                                    onClick={() => setActiveSection("CREDIT")}
                                    icon={<PlusCircle size={17} />}
                                    label="Credit"
                                    color="green"
                                />
                            </div>

                            <div className="shrink-0 lg:w-full">
                                <SidebarButton
                                    active={activeSection === "DEBIT"}
                                    onClick={() => setActiveSection("DEBIT")}
                                    icon={<MinusCircle size={17} />}
                                    label="Debit"
                                    color="red"
                                />
                            </div>

                            <div className="shrink-0 lg:w-full">
                                <SidebarButton
                                    active={activeSection === "MANAGE"}
                                    onClick={() => setActiveSection("MANAGE")}
                                    icon={<Receipt size={17} />}
                                    label="Manage Records"
                                />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="hidden mt-4 border-t border-gray-100 pt-4 lg:block lg:mt-6 lg:pt-5">

                            <p className="mb-3 hidden px-1 text-xs font-semibold uppercase tracking-wider text-gray-400 lg:block">
                                Quick Actions
                            </p>

                            <div className="grid w-full grid-cols-2 gap-2 lg:grid-cols-1">

                                <button
                                    onClick={() => openForm("CREDIT")}
                                    className="flex cursor-pointer min-w-0 items-center justify-center gap-1.5 rounded-lg bg-[#90EE90] px-2 py-3 text-xs font-semibold text-[#267a65] transition hover:bg-[#dceee7] sm:text-sm"
                                >
                                    <PlusCircle size={16} className="shrink-0" />
                                    <span>Add Credit</span>
                                </button>

                                <button
                                    onClick={() => openForm("DEBIT")}
                                    className="flex min-w-0 items-center cursor-pointer justify-center gap-1.5 rounded-lg bg-red-50 px-2 py-3 text-xs font-semibold text-red-600 transition hover:bg-red-100 sm:text-sm"
                                >
                                    <MinusCircle size={16} className="shrink-0" />
                                    <span>Add Debit</span>
                                </button>

                            </div>
                        </div>
                    </aside>

                    {/* Main Dashboard */}
                    <section className="w-full min-w-0 space-y-4 sm:space-y-5">

                        {/* Summary */}
                        <div className="hidden w-full min-w-0 grid-cols-3 gap-4 lg:grid">
                            <SummaryCard
                                label="Total Credit"
                                amount={totalCredit}
                                color="green"
                                icon={<ArrowDownLeft size={20} />}
                            />

                            <SummaryCard
                                label="Total Debit"
                                amount={totalDebit}
                                color="red"
                                icon={<ArrowUpRight size={20} />}
                            />
                            <SummaryCard
                                label="Account Balance"
                                amount={totalCredit - totalDebit}
                                color="blue"
                                icon={<ArrowUpRight size={20} />}
                            />
                        </div>

                        {/* Heading */}
                        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div className="min-w-0">
                                <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                                    {activeSection === "ALL"
                                        ? "All Transactions"
                                        : activeSection === "MANAGE"
                                            ? "Manage Records"
                                            : activeSection === "CREDIT"
                                                ? "Credit Transactions"
                                                : "Debit Transactions"}
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    {filteredTransactions.length} records found
                                </p>
                            </div>
                        </div>

                        {/* Transactions */}
                        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:rounded-2xl">

                            {filteredTransactions.length === 0 ? (

                                <div className="flex min-h-[180px] flex-col items-center justify-center px-4 py-10 text-center sm:min-h-[220px]">

                                    <Receipt
                                        size={35}
                                        className="mb-3 text-gray-300"
                                    />

                                    <p className="font-semibold text-gray-700">
                                        No transactions found
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                                        Add your first credit or debit transaction.
                                    </p>
                                </div>

                            ) : (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden w-full overflow-x-auto md:block">
                                        <table className="w-full min-w-[650px] text-left text-sm">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                                <tr>
                                                    <th className="px-5 py-4">Date</th>
                                                    <th className="px-5 py-4">Purpose</th>
                                                    <th className="px-5 py-4">Type</th>
                                                    <th className="px-5 py-4">Amount</th>
                                                    <th className="px-5 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-100">
                                                {filteredTransactions.map(t => (
                                                    <tr key={t.id} className="hover:bg-gray-50">
                                                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                                            {t.transactionDate}
                                                        </td>

                                                        <td className="px-5 py-4 font-medium text-gray-800">
                                                            {purposes.find(p => p.value === t.purpose)?.label}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.transactionType === "CREDIT"
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-red-50 text-red-700"
                                                                }`}>
                                                                {t.transactionType}
                                                            </span>
                                                        </td>

                                                        <td className={`whitespace-nowrap px-5 py-4 font-semibold ${t.transactionType === "CREDIT"
                                                            ? "text-green-700"
                                                            : "text-red-600"
                                                            }`}>
                                                            {formatMoney(Number(t.amount))}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-2">
                                                                <ActionButton
                                                                    label="View"
                                                                    onClick={() => setViewing(t)}
                                                                    icon={<Eye size={15} />}
                                                                />

                                                                <ActionButton
                                                                    label="Edit"
                                                                    onClick={() => openForm(t.transactionType, t)}
                                                                    icon={<Pencil size={15} />}
                                                                />

                                                                <ActionButton
                                                                    label="Delete"
                                                                    onClick={() => deleteTransaction(t.id)}
                                                                    icon={<Trash2 size={15} />}
                                                                    danger
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="w-full min-w-0 divide-y divide-gray-100 md:hidden">

                                        {filteredTransactions.map(t => (
                                            <div
                                                key={t.id}
                                                className="w-full min-w-0 space-y-3 p-3 sm:p-4"
                                            >

                                                <div className="flex min-w-0 items-start justify-between gap-2">

                                                    <div className="min-w-0 flex-1">
                                                        <p className="break-words text-sm font-semibold text-gray-900">
                                                            {purposes.find(p => p.value === t.purpose)?.label}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {t.transactionDate}
                                                        </p>
                                                    </div>

                                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${t.transactionType === "CREDIT"
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-red-50 text-red-700"
                                                        }`}>
                                                        {t.transactionType}
                                                    </span>
                                                </div>

                                                <div className="flex min-w-0 items-center justify-between gap-2">
                                                    <span className="shrink-0 text-xs text-gray-500">
                                                        Amount
                                                    </span>

                                                    <span className={`min-w-0 break-all text-right text-base font-bold ${t.transactionType === "CREDIT"
                                                        ? "text-green-700"
                                                        : "text-red-600"
                                                        }`}>
                                                        {formatMoney(Number(t.amount))}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-2">
                                                    <ActionButton
                                                        label="View"
                                                        onClick={() => setViewing(t)}
                                                        icon={<Eye size={15} />}
                                                    />

                                                    <ActionButton
                                                        label="Edit"
                                                        onClick={() => openForm(t.transactionType, t)}
                                                        icon={<Pencil size={15} />}
                                                    />

                                                    <ActionButton
                                                        label="Delete"
                                                        onClick={() => deleteTransaction(t.id)}
                                                        icon={<Trash2 size={15} />}
                                                        danger
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </div>


            {/* Mobile Account Overview Drawer */}
            <AccountOverviewDrawer
                setIsOverviewOpen={setIsOverviewOpen}
                isOverviewOpen={isOverviewOpen}
                totalCredit={totalCredit}
                totalDebit={totalDebit}
                openForm={openForm}
            />


            {/* Credit / Debit Form */}
            {showForm && (
                <ShowForm
                    isCredit={isCredit}
                    editingId={editingId}
                    transactionType={transactionType}
                    form={form}
                    setForm={setForm}
                    setShowForm={setShowForm}
                    saveTransaction={saveTransaction}
                    formDataSavingOrEditing={formDataSavingOrEditing}
                    purposes={purposes}
                    isRental={isRental}
                />
            )}

            {/* View Transaction */}
            {viewing && (
                <ViewingTransaction
                    viewing={viewing}
                    setViewing={setViewing}
                    purposes={purposes}
                />
            )}
        </main>
    );
}
