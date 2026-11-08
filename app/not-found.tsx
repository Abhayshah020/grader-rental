
import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export const metadata = {
    title: "Page Not Found | Grader Rental",
    description: "The page you are looking for could not be found.",
};

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f7f9f8] px-4 py-12">
            <div className="w-full max-w-lg text-center">
                <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#eaf4f0] text-[#267a65]">
                    <SearchX size={38} strokeWidth={1.7} />
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#267a65]">
                    Error 404
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    Page not found
                </h1>

                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
                    The page you are trying to access does not exist, may have
                    been moved, or the URL may be incorrect.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#267a65] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f6654]"
                    >
                        <Home size={17} />
                        Back to Home
                    </Link>
                </div>

                <p className="mt-12 text-xs text-gray-400">
                    © {new Date().getFullYear()} Grader Rental. All rights reserved.
                </p>
            </div>
        </main>
    );
}
