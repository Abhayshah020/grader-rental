
"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/app/admin/(auth)/dashboard/logout-button";
import {
    ShieldCheck,
    LayoutDashboard,
    Wallet,
    UserRound,
    Menu,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Account",
        href: "/admin/transactions",
        icon: Wallet,
    },
    {
        label: "User",
        href: "/admin/user",
        icon: UserRound,
    },
];

export function AdminNavbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar whenever the route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent background scrolling when sidebar is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <>
            <header className="sticky top-0 z-[90] border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

                    {/* Logo */}
                    <Link
                        href="/admin/dashboard"
                        className="flex shrink-0 items-center gap-3"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#267a65] text-white">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h1 className="text-base font-bold text-gray-900 sm:text-lg">
                                Admin Panel
                            </h1>
                            <p className="hidden text-xs text-gray-500 sm:block">
                                Grader Rental Management
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${active
                                            ? "bg-[#eaf4f0] text-[#267a65]"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    <Icon size={17} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Desktop Logout */}
                    <div className="hidden sm:block">
                        <LogoutButton />
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        aria-label="Open navigation menu"
                        aria-expanded={isOpen}
                        aria-controls="mobile-admin-sidebar"
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 sm:hidden"
                    >
                        <Menu size={25} />
                    </button>
                </div>
            </header>

            {/* Mobile Backdrop */}
            <div
                onClick={() => setIsOpen(false)}
                className={`fixed inset-0 z-[99] bg-black/40 transition-opacity duration-300 sm:hidden ${isOpen
                        ? "visible opacity-100"
                        : "invisible opacity-0"
                    }`}
                aria-hidden="true"
            />

            {/* Mobile Sidebar */}
            <aside
                id="mobile-admin-sidebar"
                aria-label="Mobile admin navigation"
                aria-hidden={!isOpen}
                className={`fixed inset-y-0 left-0 z-[100] flex w-[280px] max-w-[85vw] flex-col border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:hidden ${isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                    <Link
                        href="/admin/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3"
                        tabIndex={isOpen ? 0 : -1}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#267a65] text-white">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h2 className="font-bold text-gray-900">
                                Admin Panel
                            </h2>
                            <p className="text-xs text-gray-500">
                                Grader Rental Management
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close navigation menu"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Main Menu
                    </p>

                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                tabIndex={isOpen ? 0 : -1}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active
                                        ? "bg-[#eaf4f0] text-[#267a65]"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>

                                {active && (
                                    <span className="ml-auto h-2 w-2 rounded-full bg-[#267a65]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="border-t border-gray-200 p-4">
                    <p className="mb-3 text-xs text-gray-400">
                        Account Management
                    </p>

                    <LogoutButton />
                </div>
            </aside>
        </>
    );
}
