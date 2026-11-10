
"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

import {
    AlertCircle,
    CheckCircle2,
    Info,
    TriangleAlert,
    X,
} from "lucide-react";

type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertOptions {
    title?: string;
    variant?: AlertVariant;
    buttonText?: string;
}

interface ConfirmOptions {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "primary";
}

interface DialogState {
    type: "alert" | "confirm";
    title: string;
    message: string;
    variant: AlertVariant | "danger" | "primary";
    confirmText: string;
    cancelText: string;
}

interface DialogContextType {
    alert: (
        message: string,
        options?: AlertOptions
    ) => Promise<void>;

    confirm: (
        message: string,
        options?: ConfirmOptions
    ) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | null>(null);

const alertStyles = {
    error: {
        icon: AlertCircle,
        iconClass: "bg-red-50 text-red-600",
        buttonClass: "bg-red-600 hover:bg-red-700",
        defaultTitle: "Something went wrong",
    },
    success: {
        icon: CheckCircle2,
        iconClass: "bg-green-50 text-green-600",
        buttonClass: "bg-green-600 hover:bg-green-700",
        defaultTitle: "Successful",
    },
    warning: {
        icon: TriangleAlert,
        iconClass: "bg-amber-50 text-amber-600",
        buttonClass: "bg-amber-500 hover:bg-amber-600",
        defaultTitle: "Warning",
    },
    info: {
        icon: Info,
        iconClass: "bg-blue-50 text-blue-600",
        buttonClass: "bg-blue-600 hover:bg-blue-700",
        defaultTitle: "Information",
    },
};

export function AppDialogProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [dialog, setDialog] = useState<DialogState | null>(null);

    const resolver = useRef<((value: boolean) => void) | null>(null);

    const alert = useCallback(
        (message: string, options: AlertOptions = {}) => {
            return new Promise<void>((resolve) => {
                resolver.current = () => resolve();

                const variant = options.variant ?? "error";

                setDialog({
                    type: "alert",
                    title:
                        options.title ??
                        alertStyles[variant].defaultTitle,
                    message,
                    variant,
                    confirmText: options.buttonText ?? "Got it",
                    cancelText: "",
                });
            });
        },
        []
    );

    const confirm = useCallback(
        (message: string, options: ConfirmOptions = {}) => {
            return new Promise<boolean>((resolve) => {
                resolver.current = resolve;

                setDialog({
                    type: "confirm",
                    title: options.title ?? "Are you sure?",
                    message,
                    variant: options.variant ?? "danger",
                    confirmText: options.confirmText ?? "Yes, continue",
                    cancelText: options.cancelText ?? "Cancel",
                });
            });
        },
        []
    );

    const handleClose = useCallback((result: boolean) => {
        resolver.current?.(result);
        resolver.current = null;
        setDialog(null);
    }, []);

    // Escape key and scroll locking
    useEffect(() => {
        if (!dialog) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleClose(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [dialog, handleClose]);

    const isDanger = dialog?.variant === "danger";
    const isPrimary = dialog?.variant === "primary";

    const style =
        dialog?.type === "alert"
            ? alertStyles[dialog.variant as AlertVariant]
            : {
                icon: isDanger ? TriangleAlert : Info,
                iconClass: isDanger
                    ? "bg-red-50 text-red-600"
                    : "bg-blue-50 text-blue-600",
                buttonClass: isDanger
                    ? "bg-red-600 hover:bg-red-700"
                    : isPrimary
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-amber-500 hover:bg-amber-600",
            };

    const Icon = style?.icon;

    return (
        <DialogContext.Provider value={{ alert, confirm }}>
            {children}

            {dialog && (
                <div
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] animate-in fade-in duration-200 sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleClose(false);
                        }
                    }}
                >
                    <div
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="app-dialog-title"
                        aria-describedby="app-dialog-message"
                        className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-gray-100 bg-white p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 sm:rounded-2xl sm:slide-in-from-bottom-3"
                    >
                        {/* Mobile drag indicator */}
                        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => handleClose(false)}
                            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Close dialog"
                        >
                            <X size={19} />
                        </button>

                        {/* Icon */}
                        <div
                            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${style?.iconClass}`}
                        >
                            {Icon && <Icon size={27} strokeWidth={2} />}
                        </div>

                        {/* Content */}
                        <h2
                            id="app-dialog-title"
                            className="pr-8 text-lg font-bold tracking-tight text-gray-900 sm:text-xl"
                        >
                            {dialog.title}
                        </h2>

                        <p
                            id="app-dialog-message"
                            className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600"
                        >
                            {dialog.message}
                        </p>

                        {/* Actions */}
                        <div
                            className={`mt-7 grid gap-3 ${dialog.type === "confirm"
                                    ? "grid-cols-2"
                                    : "grid-cols-1"
                                }`}
                        >
                            {dialog.type === "confirm" && (
                                <button
                                    type="button"
                                    onClick={() => handleClose(false)}
                                    className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
                                >
                                    {dialog.cancelText}
                                </button>
                            )}

                            <button
                                type="button"
                                autoFocus
                                onClick={() => handleClose(true)}
                                className={`h-12 rounded-xl px-4 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] ${style?.buttonClass}`}
                            >
                                {dialog.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
}

export function useAppDialog() {
    const context = useContext(DialogContext);

    if (!context) {
        throw new Error(
            "useAppDialog must be used inside AppDialogProvider"
        );
    }

    return context;
}
