
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Loader2,
  ArrowLeft,
  RefreshCw,
  LockKeyhole,
} from "lucide-react";

export default function AdminOTPPage() {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = window.setTimeout(() => {
      setSeconds((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [seconds]);

  async function handleVerify(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid six-digit OTP.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "OTP verification failed.");
        return;
      }

      router.replace("/admin/dashboard");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (seconds > 0 || resending) return;

    setError("");
    setMessage("");
    setResending(true);

    try {
      const response = await fetch("/api/admin/resend-otp", {
        method: "POST",
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to resend OTP.");
        return;
      }

      setOtp("");
      setSeconds(60);
      setMessage("A new verification code has been sent.");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#F5F7F6] flex flex-col">
      {/* <header className="h-16 bg-white border-b border-gray-100 flex items-center px-5 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F3EF] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#267A65]" />
          </div>

          <div>
            <h1 className="text-sm font-bold text-gray-900">
              SIRAHA GRADER RENTAL
            </h1>
            <p className="text-[11px] text-gray-500">
              Secure Verification
            </p>
          </div>
        </div>
      </header> */}

      <section className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-9">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F3EF] flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#267A65]" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Verify your email
              </h2>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                We've sent a six-digit verification code to your
                registered administrator email address.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 text-center mb-3"
                >
                  Enter verification code
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full h-16 rounded-xl border border-gray-200 bg-gray-50 text-center text-2xl font-bold tracking-[0.65em] text-gray-900 outline-none transition focus:border-[#267A65] focus:ring-2 focus:ring-[#267A65]/10"
                />

                <p className="text-xs text-gray-400 text-center mt-3">
                  Code expires 10 minutes after it is issued.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700"
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-12 cursor-pointer rounded-xl bg-[#267A65] hover:bg-[#1F6654] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify and continue
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                disabled={seconds > 0 || resending}
                onClick={handleResend}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#267A65] hover:text-[#1F6654] disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}

                {seconds > 0
                  ? `Resend code in ${seconds}s`
                  : "Resend verification code"}
              </button>
            </div>

            <div className="mt-7 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.replace("/admin/login")}
                className="flex items-center justify-center gap-2 w-full text-sm text-gray-500 hover:text-gray-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-5">
                <LockKeyhole className="w-4 h-4" />
                Secure administrator verification
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
