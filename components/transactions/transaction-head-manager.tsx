
"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Power,
} from "lucide-react";

import type {
  TransactionHead,
  AllowedTransactionType,
  TransactionHeadType,
} from "@/lib/finance/types";
import { useAppDialog } from "../app-dialog";

interface Props {
  open: boolean;
  heads: TransactionHead[];
  onClose: () => void;
  onChanged: () => Promise<void>;
}

const emptyForm = {
  name: "",
  headType: "EXPENSE" as TransactionHeadType,
  allowedTransactionType: "DEBIT" as AllowedTransactionType,
  requiresRentalDates: false,
};

export default function TransactionHeadManager({
  open,
  heads,
  onClose,
  onChanged,
}: Props) {
  const { confirm } = useAppDialog();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const startCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const startEdit = (head: TransactionHead) => {
    setForm({
      name: head.name,
      headType: head.headType,
      allowedTransactionType: head.allowedTransactionType,
      requiresRentalDates: head.requiresRentalDates,
    });

    setEditingId(head.id);
    setError("");
    setShowForm(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        editingId
          ? `/api/admin/finance/transaction-heads/${editingId}`
          : "/api/admin/finance/transaction-heads",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save head.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await onChanged();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (head: TransactionHead) => {
    const nextActive = !head.isActive;

    const confirmed = await confirm(
      `${nextActive ? "Activate" : "Deactivate"} ${head.name}?`,
      {
        title: nextActive ? "Activate Head?" : "Deactivate Head?",
        confirmText: nextActive ? "Activate" : "Deactivate",
        variant: nextActive ? "primary" : "warning",
      }
    );

    if (!confirmed) return;
    try {
      const response = await fetch(
        `/api/admin/finance/transaction-heads/${head.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: nextActive }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      await onChanged();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Unable to update head."
      );
    }
  };

  const handleDelete = async (head: TransactionHead) => {
    const confirmed = await confirm(
      "Delete this transaction head permanently?",
      {
        title: `Permanently delete "${head.name}"?`,
        confirmText: "Delete",
        cancelText: "Keep",
        variant: "danger",
      }
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/finance/transaction-heads/${head.id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      await onChanged();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Unable to delete head."
      );
    }
  };

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700";

  const inputClass =
    "h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-base outline-none focus:border-blue-400";

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[13] flex items-end justify-center rounded-t-2xl transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-[100%]"
        }`}
    >
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Manage Heads
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Create and manage reusable transaction names
            </p>
          </div>

          <button
            onClick={() => { setShowForm(false); onClose() }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            aria-label="Close manager"
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <button
            onClick={startCreate}
            className="mb-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-semibold text-white active:bg-blue-700"
          >
            <Plus size={19} />
            Add New Head
          </button>

          <div className="space-y-3">
            {heads.map((head) => (
              <div
                key={head.id}
                className={`rounded-xl border p-3 ${head.isActive
                  ? "border-gray-200"
                  : "border-gray-100 bg-gray-50 opacity-60"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900">
                      {head.name}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {head.headType.replaceAll("_", " ")}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                        {head.allowedTransactionType}
                      </span>

                      {head.requiresRentalDates && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                          Rental dates
                        </span>
                      )}

                      {!head.isActive && (
                        <span className="rounded-full bg-gray-200 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEdit(head)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      aria-label="Edit head"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDeactivate(head)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                      aria-label="Toggle active status"
                    >
                      <Power size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(head)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete unused head"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!heads.length && (
              <p className="py-12 text-center text-sm text-gray-500">
                No transaction heads created yet.
              </p>
            )}
          </div>

        </div>
      </div>
      <div
        className={`fixed inset-x-0 bottom-0 z-[14] flex items-end justify-center rounded-t-2xl transition-transform duration-300 ${showForm ? "translate-y-0" : "translate-y-[100%]"
          }`}
      >
        <div className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">
          <form onSubmit={handleSave} className="space-y-5 flex-1 overflow-y-auto p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">
                {editingId ? "Edit Head" : "Create Head"}
              </h3>

              <button
                onClick={() => setShowForm(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                aria-label="Close manager"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className={labelClass}>
                Name *
              </label>

              <input
                required
                maxLength={150}
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="e.g. Grader Rental"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Category *
              </label>

              <select
                value={form.headType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    headType: e.target.value as TransactionHeadType,
                  })
                }
                className={inputClass}
              >
                <option value="INCOME_SOURCE">Income Source</option>
                <option value="PERSON">Person</option>
                <option value="COLLECTIVE">Collective Expense</option>
                <option value="EXPENSE">Expense</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Allowed Transaction *
              </label>

              <select
                value={form.allowedTransactionType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    allowedTransactionType:
                      e.target.value as AllowedTransactionType,
                  })
                }
                className={inputClass}
              >
                <option value="BOTH">Credit and Debit</option>
                <option value="CREDIT">Credit Only</option>
                <option value="DEBIT">Debit Only</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4">
              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  Requires rental dates
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  Show from/to dates when recording credit.
                </span>
              </span>

              <input
                type="checkbox"
                checked={form.requiresRentalDates}
                onChange={(e) =>
                  setForm({
                    ...form,
                    requiresRentalDates: e.target.checked,
                  })
                }
                className="h-5 w-5 accent-blue-600"
              />
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-bold text-white disabled:opacity-50"
            >
              {saving && (
                <Loader2 size={18} className="animate-spin" />
              )}
              {editingId ? "Update Head" : "Create Head"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
