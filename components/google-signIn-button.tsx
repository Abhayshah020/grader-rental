"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface GoogleCredentialResponse {
    credential: string;
}

interface GoogleIdentity {
    accounts: {
        id: {
            initialize: (config: Record<string, unknown>) => void;
            renderButton: (
                element: HTMLElement,
                options: Record<string, unknown>
            ) => void;
        };
    };
}

declare global {
    interface Window {
        google?: GoogleIdentity;
    }
}

export default function GoogleSignInButton() {
    const router = useRouter();

    const buttonRef = useRef<HTMLDivElement>(null);

    const [scriptReady, setScriptReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [containerWidth, setContainerWidth] = useState(0);

    const handleGoogleCredential = useCallback(
        async (response: GoogleCredentialResponse) => {
            if (!response.credential) {
                setError("Google authentication failed.");
                return;
            }

            setLoading(true);
            setError("");

            try {
                const result = await fetch("/api/admin/google", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "same-origin",
                    cache: "no-store",
                    body: JSON.stringify({
                        credential: response.credential,
                    }),
                });

                const data = await result.json();

                if (!result.ok) {
                    setError(
                        data.message ||
                        "Unable to sign in with Google."
                    );
                    return;
                }

                router.replace(
                    data.redirect || "/admin/transactions"
                );

                router.refresh();

            } catch {
                setError(
                    "Unable to connect to the authentication server."
                );
            } finally {
                setLoading(false);
            }
        },
        [router]
    );


    useEffect(() => {
        const element = buttonRef.current;

        if (!element) return;

        const observer = new ResizeObserver(([entry]) => {
            const width = Math.floor(entry.contentRect.width);

            if (width > 0) {
                setContainerWidth(width);
            }
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!scriptReady || !buttonRef.current) {
            return;
        }

        let cancelled = false;

        async function initializeGoogle() {
            try {
                const nonceResponse = await fetch(
                    "/api/admin/google/nonce",
                    {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store",
                    }
                );

                const nonceData = await nonceResponse.json();

                if (!nonceResponse.ok || !nonceData.nonce) {
                    throw new Error("Unable to initialize Google login.");
                }

                if (cancelled) return;

                const google = window.google;

                if (!google) {
                    throw new Error("Google services failed to load.");
                }

                const clientId =
                    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

                if (!clientId) {
                    throw new Error("Google client ID is not configured.");
                }

                google.accounts.id.initialize({
                    client_id: clientId,
                    nonce: nonceData.nonce,
                    callback: handleGoogleCredential,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                if (buttonRef.current) {
                    buttonRef.current.innerHTML = "";

                    google.accounts.id.renderButton(
                        buttonRef.current,
                        {
                            theme: "outline",
                            size: "large",
                            shape: "rectangular",
                            text: "continue_with",
                            width: Math.min(containerWidth, 400),
                            logo_alignment: "left",
                        }
                    );
                }

            } catch (error) {
                if (!cancelled) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Unable to initialize Google login."
                    );
                }
            }
        }

        initializeGoogle();

        return () => {
            cancelled = true;
        };
    }, [scriptReady, handleGoogleCredential]);

    return (
        <div className="w-full space-y-3">
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onReady={() => setScriptReady(true)}
            />

            <div className="relative flex justify-center min-h-[44px]">
                <div
                    ref={buttonRef}
                    className={
                        loading
                            ? "pointer-events-none opacity-40"
                            : ""
                    }
                />

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <Loader2 className="w-5 h-5 animate-spin text-[#267A65]" />
                    </div>
                )}
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}
        </div>
    );
}