
"use client";

import { useRef } from "react";
import {
    CalendarDays,
    ChevronDown,
} from "lucide-react";

import "@nepali-date-picker/web-component";
import "@nepali-date-picker/web-component/react";

import type {
    NepaliDatePickerDialog,
} from "@nepali-date-picker/web-component";

import { adToBs } from "@/lib/date/nepali-date";

interface NepaliDateInputProps {
    value: string;
    onChange: (adDate: string) => void;
    min?: string;
    max?: string;
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function NepaliDateInput({
    value,
    onChange,
    min,
    max,
    label,
    placeholder = "Select Nepali date",
    className = "",
    disabled = false,
}: NepaliDateInputProps) {
    const dialogRef = useRef<NepaliDatePickerDialog>(null);

    // Convert the existing AD state into BS for the calendar.
    const valueBS = value ? adToBs(value) : "";
    const minBS = min ? adToBs(min) : "";
    const maxBS = max ? adToBs(max) : "";

    const pickerStyle = {
        "--ndp-bg": "#ffffff",
        "--ndp-text": "#1f2937",
        "--ndp-muted": "#6b7280",
        "--ndp-accent": "#267A65",
        "--ndp-on-accent": "#ffffff",
        "--ndp-hover": "rgba(38, 122, 101, 0.10)",
        "--ndp-border": "#d1d5db",
        "--ndp-today-ring": "#267A65",
        "--ndp-radius": "14px",
        "--ndp-font": "inherit",
    } as React.CSSProperties;

    return (
        <div
            className={`w-full min-w-0 ${className}`}
            style={pickerStyle}
        >
            {/* Full-width read-only date field */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => dialogRef.current?.show()}
                className="
                    flex h-12 w-full min-w-0 items-center justify-between
                    gap-3 rounded-xl border border-gray-200 bg-white
                    px-3 text-left text-sm text-gray-800
                    shadow-sm transition
                    hover:border-[#267A65]/50
                    focus:outline-none focus:ring-2
                    focus:ring-[#267A65]/15 focus:border-[#267A65]
                    disabled:cursor-not-allowed disabled:bg-gray-100
                    disabled:text-gray-400
                "
                aria-label={label || "Select Nepali date"}
            >
                <span className="flex min-w-0 items-center gap-3">
                    <CalendarDays className="h-5 w-5 shrink-0 text-[#267A65]" />

                    <span
                        className={`truncate font-medium ${valueBS ? "text-gray-800" : "text-gray-400"
                            }`}
                    >
                        {valueBS || placeholder}
                    </span>
                </span>

                <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
            </button>

            {/* Calendar dialog */}
            <nepali-date-picker-dialog
                ref={dialogRef}
                value={valueBS}
                min={minBS}
                max={maxBS}
                language="en"
                calendarSystem="bs"
                showEnglish
                style={pickerStyle}
                onChange={(event) => {
                    const selectedAD =
                        event.nativeEvent.detail.adIso;

                    if (selectedAD) {
                        onChange(selectedAD);
                    }
                }}
            />
        </div>
    );
}
