
export default function TransactionFilter({
    selectedHeadId,
    setSelectedHeadId,
    type,
    showFilters,
    setShowFilters,
    datePreset,
    setDatePreset,
    getDateRange,
    from,
    setFrom,
    to,
    setTo,
    setType,
    includeRelated,
    setIncludeRelated,
    heads,
    setSearchInput,
    loadTransactions,
}: {
    setSearchInput: (input: string) => void;
    loadTransactions: () => void;
    includeRelated: boolean;
    setIncludeRelated: (include: boolean) => void;
    heads: { id: string; name: string }[];
    type: string;
    selectedHeadId: string;
    setSelectedHeadId: (id: string) => void;
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    datePreset: string;
    setDatePreset: (preset: string) => void;
    getDateRange: (preset: string) => { from: string; to: string };
    from: string;
    setFrom: (date: string) => void;
    to: string;
    setTo: (date: string) => void;
    setType: (type: string) => void;

}) {
    return (
        <>
            <div
                onClick={() => setShowFilters(false)}
                className={`fixed inset-0 z-[90] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${showFilters
                    ? "visible opacity-100"
                    : "invisible pointer-events-none opacity-0"
                    }`}
            />
            <div
                aria-hidden={!showFilters}
                className={`fixed inset-x-0 top-0 z-[91] transition-all duration-300 ease-out ${showFilters
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-full pointer-events-none opacity-0"
                    }`}
            >
                <div className="mx-auto max-h-[88dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-b-2xl border border-gray-200 bg-white shadow-2xl">

                    {/* Drawer header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                Filter transactions
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Narrow down your transaction history
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowFilters(false)}
                            aria-label="Close filters"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Filter content */}
                    <div className="space-y-5 p-4">

                        {/* Quick date filters */}
                        <div>
                            <p className="mb-3 text-sm font-bold text-gray-800">
                                Date range
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: "1 Week", value: "1_WEEK" },
                                    { label: "1 Month", value: "1_MONTH" },
                                    { label: "3 Months", value: "3_MONTHS" },
                                    { label: "6 Months", value: "6_MONTHS" },
                                    { label: "1 Year", value: "1_YEAR" },
                                    { label: "All", value: "ALL" },
                                ].map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => {
                                            setDatePreset(item.value);

                                            const range = getDateRange(item.value);

                                            setFrom(range.from);
                                            setTo(range.to);
                                        }}
                                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${datePreset === item.value
                                            ? "border-blue-600 bg-blue-50 text-blue-700"
                                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom dates */}
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                    From date
                                </label>
                                <input
                                    type="date"
                                    value={from}
                                    onChange={(e) => {
                                        setFrom(e.target.value);
                                        setDatePreset("CUSTOM");
                                    }}
                                    className="h-11 w-full min-w-0 rounded-lg border border-gray-200 px-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                                    To date
                                </label>
                                <input
                                    type="date"
                                    value={to}
                                    min={from || undefined}
                                    onChange={(e) => {
                                        setTo(e.target.value);
                                        setDatePreset("CUSTOM");
                                    }}
                                    className="h-11 w-full min-w-0 rounded-lg border border-gray-200 px-2 text-sm"
                                />
                            </div>
                        </div>

                        {/* Transaction type */}
                        <div className="mt-5">
                            <p className="mb-2 text-sm font-bold text-gray-800">
                                Transaction type
                            </p>

                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "All", value: "ALL" },
                                    { label: "Credit", value: "CREDIT" },
                                    { label: "Debit", value: "DEBIT" },
                                ].map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => setType(item.value)}
                                        className={`rounded-lg border py-2.5 text-sm font-semibold ${type === item.value
                                            ? item.value === "CREDIT"
                                                ? "border-green-300 bg-green-50 text-green-700"
                                                : item.value === "DEBIT"
                                                    ? "border-red-300 bg-red-50 text-red-700"
                                                    : "border-blue-300 bg-blue-50 text-blue-700"
                                            : "border-gray-200 text-gray-600"
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Transaction heads */}
                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-bold text-gray-800">
                                Transaction head
                            </label>

                            <select
                                value={selectedHeadId}
                                onChange={(e) => setSelectedHeadId(e.target.value)}
                                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
                            >
                                <option value="ALL">All transaction heads</option>

                                {heads.map((head) => (
                                    <option key={head.id} value={head.id}>
                                        {head.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Related transaction toggle */}
                        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800">
                                    Fetch related earnings
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Include the earning linked to each expense.
                                </p>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={includeRelated}
                                onClick={() => setIncludeRelated(!includeRelated)}
                                className={`relative h-7 w-12 shrink-0 rounded-full transition ${includeRelated ? "bg-blue-600" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${includeRelated ? "left-6" : "left-1"
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="mt-5 flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setDatePreset("ALL");
                                    setFrom("");
                                    setTo("");
                                    setType("ALL");
                                    setSelectedHeadId("ALL");
                                    setIncludeRelated(false);
                                    setSearchInput("");
                                }}
                                className="h-11 flex-1 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700"
                            >
                                Reset
                            </button>

                            <button
                                type="button"
                                onClick={() => { loadTransactions(); setShowFilters(false) }}
                                className="h-11 flex-1 rounded-xl bg-blue-600 text-sm font-semibold text-white"
                            >
                                Apply filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}