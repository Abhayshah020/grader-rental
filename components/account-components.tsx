import { ArrowDownLeft, ArrowUpRight, CalendarDays, ChevronDown, ChevronUp, Loader2, MinusCircle, PlusCircle, Wallet, X } from "lucide-react";

export type TransactionType = "CREDIT" | "DEBIT";

export type Purpose =
    | ""
    | "GRADER_RENT"
    | "ROLLER_RENT"
    | "EXCAVATOR_RENT"
    | "SALARY_PAYING"
    | "LOAN_PAYMENT"
    | "BUSINESS_EXPENSE"
    | "GENERAL_EXPENSE";

export type Transaction = {
    id: string;
    transactionType: TransactionType;
    purpose: Purpose;
    transactionDate: string;
    rentalFromDate?: string | null;
    rentalToDate?: string | null;
    amount: string;
    remarks?: string | null;
};

export const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-NP", {
        style: "currency",
        currency: "NPR",
        maximumFractionDigits: 2,
    }).format(amount);

export function SidebarButton({
    active,
    onClick,
    icon,
    label,
    color,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    color?: "green" | "red";
}) {
    const activeColor =
        color === "green"
            ? "bg-green-50 text-green-700"
            : color === "red"
                ? "bg-red-50 text-red-700"
                : "bg-[#eaf4f0] text-[#267a65]";

    return (
        <button
            onClick={onClick}
            className={`
                flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5
                text-xs font-medium transition-all sm:text-sm
                lg:w-full
                ${active
                    ? "bg-[#eaf4f0] text-[#267a65]"
                    : "text-gray-600 hover:bg-gray-50"
                }
            `}
        >
            {icon}
            {label}
        </button>
    );
}

export function SummaryCard({
    label,
    amount,
    color,
    icon,
}: {
    label: string;
    amount: number;
    color: "green" | "red" | "blue";
    icon: React.ReactNode;
}) {
    const green = color === "green";
    const blue = color === "blue";

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <div className={`rounded-xl p-2 ${green
                    ? "bg-green-50 text-green-700"
                    : blue
                        ? "bg-blue-50 text-blue-700"
                        : "bg-red-50 text-red-600"
                    }`}>
                    {icon}
                </div>
            </div>
            <p className={`mt-4 text-l font-bold ${green ? "text-green-700" : blue ? "text-blue-700" : "text-red-600"
                }`}>
                {formatMoney(amount)}
            </p>
        </div>
    );
}

export function ActionButton({
    label,
    onClick,
    icon,
    danger = false,
}: {
    label: string;
    onClick: () => void;
    icon: React.ReactNode;
    danger?: boolean;
}) {
    return (
        <button
            title={label}
            onClick={onClick}
            className={`rounded-lg cursor-pointer border p-2 transition ${danger
                ? "border-red-100 text-red-500 hover:bg-red-50"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
        >
            {icon}
        </button>
    );
}

export function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b border-gray-100 pb-3 last:border-0">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="mt-1 break-all font-medium text-gray-800">{value}</p>
        </div>
    );
}

export function ShowForm({ isCredit, editingId, transactionType, formDataSavingOrEditing, form, setForm, setShowForm, saveTransaction, purposes, isRental }: {
    isCredit: boolean;
    editingId: string | null;
    transactionType: TransactionType;
    formDataSavingOrEditing: boolean;
    form: any;
    setForm: React.Dispatch<React.SetStateAction<any>>;
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
    saveTransaction: (e: React.FormEvent) => void;
    purposes: { value: Purpose; label: string }[];
    isRental: (purpose: Purpose) => boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
            <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">

                <div className={`flex items-center justify-between rounded-t-2xl border-b p-5 ${isCredit
                    ? "border-green-100 bg-green-50"
                    : "border-red-100 bg-red-50"
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2 ${isCredit
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {isCredit
                                ? <PlusCircle size={22} />
                                : <MinusCircle size={22} />}
                        </div>

                        <div>
                            <h3 className={`font-bold ${isCredit ? "text-green-800" : "text-red-800"
                                }`}>
                                {editingId ? "Edit" : "Add"} {transactionType} Transaction
                            </h3>
                            <p className="text-xs text-gray-500">
                                {isCredit
                                    ? "Money received by your business"
                                    : "Money paid by your business"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowForm(false)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-white"
                    >
                        <X size={19} />
                    </button>
                </div>

                <form onSubmit={saveTransaction} className="space-y-4 p-5">

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Transaction Date *
                        </label>
                        <input
                            type="date"
                            required
                            value={form.transactionDate}
                            onChange={e => setForm({
                                ...form,
                                transactionDate: e.target.value,
                            })}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#267a65]"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Transaction Purpose / Details *
                        </label>
                        <select
                            required
                            value={form.purpose}
                            onChange={e => setForm({
                                ...form,
                                purpose: e.target.value as Purpose,
                                rentalFromDate: "",
                                rentalToDate: "",
                            })}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#267a65]"
                        >
                            {purposes.map((p: { value: Purpose; label: string }) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {isRental(form.purpose) && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-800">
                                <CalendarDays size={17} />
                                Rental Period
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                        From Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={form.rentalFromDate}
                                        onChange={e => setForm({
                                            ...form,
                                            rentalFromDate: e.target.value,
                                        })}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                        To Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        min={form.rentalFromDate || undefined}
                                        value={form.rentalToDate}
                                        onChange={e => setForm({
                                            ...form,
                                            rentalToDate: e.target.value,
                                        })}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Amount (NPR) *
                        </label>
                        <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={form.amount}
                            onChange={e => setForm({
                                ...form,
                                amount: e.target.value,
                            })}
                            placeholder="Enter amount"
                            className="w-full rounded-lg border border-gray-200 py-3 pl-14 pr-3 text-sm outline-none focus:border-[#267a65]"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Remarks
                        </label>
                        <textarea
                            rows={3}
                            value={form.remarks}
                            onChange={e => setForm({
                                ...form,
                                remarks: e.target.value,
                            })}
                            placeholder="Additional details (optional)"
                            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#267a65]"
                        />
                    </div>

                    <div className="flex gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={formDataSavingOrEditing}
                            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:border-red-200 disabled:cursor-not-allowed disabled:opacity-60
                                ${isCredit
                                    ? "bg-[#267a65] hover:bg-[#1f6654]"
                                    : "bg-red-600 hover:bg-red-700"
                                }`}
                        >
                            {formDataSavingOrEditing ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : null}
                            {editingId ? "Update" : "Save"}{formDataSavingOrEditing ? "ing..." : ""} {transactionType}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function ViewingTransaction({
    viewing,
    setViewing,
    purposes,
}: {
    viewing: Transaction;
    setViewing: React.Dispatch<React.SetStateAction<Transaction | null>>;
    purposes: { value: Purpose; label: string }[];
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">
                        Transaction Details
                    </h3>
                    <button onClick={() => setViewing(null)} className="cursor-pointer">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4 text-sm">
                    {/* <Detail label="Transaction ID" value={viewing.id} /> */}
                    <Detail label="Type" value={viewing.transactionType} />
                    <Detail
                        label="Purpose"
                        value={purposes.find(p => p.value === viewing.purpose)?.label ?? ""}
                    />
                    <Detail label="Date" value={viewing.transactionDate} />
                    <Detail label="Amount" value={formatMoney(Number(viewing.amount))} />

                    {viewing.rentalFromDate && (
                        <Detail
                            label="Rental Period"
                            value={`${viewing.rentalFromDate} to ${viewing.rentalToDate}`}
                        />
                    )}

                    <Detail label="Remarks" value={viewing.remarks || "—"} />
                </div>

                <button
                    onClick={() => setViewing(null)}
                    className="mt-6 w-full rounded-lg bg-gray-100 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export function AccountOverviewDrawer({
    setIsOverviewOpen,
    isOverviewOpen,
    totalCredit,
    totalDebit,
    openForm,
}: {
    setIsOverviewOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOverviewOpen: boolean;
    totalCredit: number;
    totalDebit: number;
    openForm: (transactionType: TransactionType) => void;
}) {
    return (
        <div className="lg:hidden">

            {/* Backdrop */}
            <div
                onClick={() => setIsOverviewOpen(false)}
                className={`fixed inset-0 z-[5] bg-black/30 transition-opacity duration-300 ${isOverviewOpen
                    ? "visible opacity-100"
                    : "invisible opacity-0"
                    }`}
            />

            {/* Bottom Drawer */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[10] overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-in-out ${isOverviewOpen
                    ? "translate-y-0"
                    : "translate-y-[calc(100%-76px)]"
                    }`}
                style={{
                    maxHeight: "75dvh",
                    paddingBottom: "env(safe-area-inset-bottom)",
                }}
            >

                {/* Drawer Handle / Toggle */}
                <button
                    type="button"
                    onClick={() => setIsOverviewOpen(prev => !prev)}
                    aria-expanded={isOverviewOpen}
                    aria-label={
                        isOverviewOpen
                            ? "Close account overview"
                            : "Open account overview"
                    }
                    className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5"
                >
                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf4f0] text-[#267a65]">
                            <Wallet size={20} />
                        </div>

                        <div className="min-w-0 text-left">
                            <p className="text-xs text-gray-500">
                                Account Balance
                            </p>

                            <p className={`truncate text-base font-bold ${totalCredit - totalDebit >= 0
                                ? "text-[#267a65]"
                                : "text-red-600"
                                }`}>
                                {formatMoney(totalCredit - totalDebit)}
                            </p>
                        </div>

                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">
                            {isOverviewOpen ? "Close" : "Overview"}
                        </span>

                        {isOverviewOpen ? (
                            <ChevronDown size={20} className="text-gray-500" />
                        ) : (
                            <ChevronUp size={20} className="text-[#267a65]" />
                        )}
                    </div>
                </button>

                {/* Drawer Content */}
                <div className="max-h-[calc(75dvh-76px)] space-y-5 overflow-y-auto p-4">

                    {/* Quick Actions */}
                    <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Quick Actions
                        </h3>

                        <div className="grid grid-cols-2 gap-3">

                            <button
                                onClick={() => {
                                    setIsOverviewOpen(false);
                                    openForm("CREDIT");
                                }}
                                className="flex items-center justify-center gap-2 rounded-xl bg-[#eaf4f0] px-3 py-3.5 text-sm font-semibold text-[#267a65] transition active:scale-[0.98]"
                            >
                                <PlusCircle size={18} />
                                Add Credit
                            </button>

                            <button
                                onClick={() => {
                                    setIsOverviewOpen(false);
                                    openForm("DEBIT");
                                }}
                                className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-3.5 text-sm font-semibold text-red-600 transition active:scale-[0.98]"
                            >
                                <MinusCircle size={18} />
                                Add Debit
                            </button>

                        </div>
                    </section>

                    {/* Account Summary */}
                    <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Account Summary
                        </h3>

                        <div className="grid grid-cols-2 gap-3">

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

                            <div className="col-span-2">
                                <SummaryCard
                                    label="Account Balance"
                                    amount={totalCredit - totalDebit}
                                    color="blue"
                                    icon={<ArrowUpRight size={20} />}
                                />
                            </div>

                        </div>
                    </section>

                </div>
            </div>
        </div>
    )
}