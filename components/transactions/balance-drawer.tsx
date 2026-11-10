
"use client";

import {
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  MinusCircle,
  Plus,
  PlusCircle,
  Wallet,
} from "lucide-react";

import type { FinanceSummary } from "@/lib/finance/types";

interface Props {
  summary: FinanceSummary;
  summaryLoading: boolean;
  open: boolean;
  onToggle: () => void;
  onManageHeads: () => void;
  openForm: (type: "CREDIT" | "DEBIT") => void;
}

const formatMoney = (value: string) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function BalanceDrawer({
  summary,
  summaryLoading,
  open,
  onToggle,
  openForm,
  onManageHeads,
}: Props) {
  const SummaryValue = ({ value }: { value: string }) => {
    if (summaryLoading) {
      return (
        <div className="mt-2 flex h-7 items-center">
          <LoaderCircle
            size={18}
            className="animate-spin text-gray-400"
          />
        </div>
      );
    }

    return (
      <p className="mt-2 text-lg font-bold">
        Rs. {formatMoney(value)}
      </p>
    );
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[10] mx-auto max-w-5xl rounded-t-2xl border border-gray-200 bg-white shadow-[0_-8px_35px_rgba(0,0,0,0.10)] transition-transform duration-300 ${
        open
          ? "translate-y-0"
          : "translate-y-[calc(100%-94px)]"
      }`}
    >
      {/* Drawer header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex h-[94px] w-full items-center justify-between px-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Wallet size={22} />
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Current net balance
            </p>

            <div className="flex items-center gap-2">
              {summaryLoading ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin text-gray-400"
                />
              ) : (
                <p className="text-xl font-bold text-gray-900">
                  Rs. {formatMoney(summary.balance)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
          {open ? "Collapse" : "Details"}
          {open ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronUp size={20} />
          )}
        </div>
      </button>

      {/* Drawer content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open
            ? "max-h-[360px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5">
          {/* Credit / Debit summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-xs font-medium text-green-700">
                Total Credit
              </p>

              <SummaryValue value={summary.totalCredit} />
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs font-medium text-red-700">
                Total Debit
              </p>

              <SummaryValue value={summary.totalDebit} />
            </div>
          </div>

          {/* Credit and debit actions */}
          <div className="my-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => openForm("CREDIT")}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#5a5aff] px-3 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              <PlusCircle size={18} />
              Add Credit
            </button>

            <button
              type="button"
              onClick={() => openForm("DEBIT")}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#ff5a5a] px-3 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              <MinusCircle size={18} />
              Add Debit
            </button>
          </div>

          {/* Manage transaction heads */}
          <button
            type="button"
            onClick={onManageHeads}
            className="mt-4 flex min-h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 font-semibold text-gray-800 active:bg-gray-50"
          >
            <span>Manage Transaction Heads</span>

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
              <Plus size={20} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
