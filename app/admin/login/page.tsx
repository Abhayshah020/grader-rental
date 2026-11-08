
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShieldCheck,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    Loader2,
    Construction,
    ArrowRight,
    Shield,
    ArrowLeft,
    Home,
} from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message || "Unable to sign in. Please try again."
                );
                return;
            }

            router.push("/admin/verify-otp");
        } catch {
            setError("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-dvh bg-[#F5F7F6] flex flex-col">
            {/* <header className="h-16 bg-white border-b border-gray-100 flex items-center px-5 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F3EF] flex items-center justify-center">
            <Construction className="w-6 h-6 text-[#267A65]" />
          </div>

          <div>
            <h1 className="text-sm font-bold text-gray-900">
              SIRAHA GRADER RENTAL
            </h1>
            <p className="text-[11px] text-gray-500">
              Administration Portal
            </p>
          </div>
        </div>
      </header> */}

            <section className="flex-1 flex items-center justify-center px-5 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-9">
                        <div className="flex justify-center mb-5">
                            <div className="w-14 h-14 rounded-2xl bg-[#E8F3EF] flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8 text-[#267A65]" />
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Super Admin Login
                            </h2>

                            <p className="text-sm text-gray-500 mt-2">
                                Enter your administrator credentials to continue.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <div className="flex flex-row gap-2">
                                    <Mail className=" w-5 h-5 text-gray-400" />
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email address
                                    </label>
                                </div>


                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="username"
                                    required
                                    maxLength={255}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none transition focus:border-[#267A65] focus:ring-2 focus:ring-[#267A65]/10"
                                />
                            </div>

                            <div>
                                <div className="flex flex-row gap-2">
                                    <LockKeyhole className=" w-5 h-5 text-gray-400" />
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Password
                                    </label>
                                </div>


                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        maxLength={128}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm outline-none transition focus:border-[#267A65] focus:ring-2 focus:ring-[#267A65]/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={
                                            showPassword ? "Hide password" : "Show password"
                                        }
                                        className="absolute cursor-pointer right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !email.trim() || !password}
                                className="w-full cursor-pointer h-12 rounded-xl bg-[#267A65] hover:bg-[#1F6654] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verifying credentials...
                                    </>
                                ) : (
                                    <>
                                        Sign in securely
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                        <Link
                            href="/"
                            className="flex mt-5 items-center justify-center gap-2 w-full text-sm text-gray-500 hover:text-gray-800 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to home
                        </Link>
                        <div className="mt-7 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                <Shield className="w-4 h-4 text-[#267A65]" />
                                Protected Super Admin Access
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        © {new Date().getFullYear()} Siraha Grader Roller Rental Service
                    </p>
                </div>
            </section>
        </main>
    );
}
