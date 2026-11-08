
import { and, count, desc, eq, gt, gte, isNull } from "drizzle-orm";
import {
    Activity,
    CalendarDays,
    Clock,
    Monitor,
    ShieldCheck,
    UserRound
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
    getAuthenticatedAdmin,
    SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { db } from "@/lib/db";
import { adminLoginAudit, adminSessions } from "@/lib/db/schema";

export const runtime = "nodejs";

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-NP", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kathmandu",
    }).format(date);
}

function eventLabel(event: string) {
    const labels: Record<string, string> = {
        LOGIN_SESSION_CREATED: "Login successful",
        OTP_VERIFIED: "OTP verified",
        PASSWORD_VERIFIED: "Password verified",
        OTP_SENT: "OTP email sent",
        OTP_FAILED: "OTP verification failed",
        LOGIN_FAILED: "Login failed",
        LOGOUT: "Logged out",
        RATE_LIMITED: "Rate limit triggered",
    };

    return labels[event] ?? event.replaceAll("_", " ").toLowerCase();
}

export default async function AdminDashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
        redirect("/admin/login");
    }

    const admin = await getAuthenticatedAdmin(token);

    if (!admin) {
        redirect("/admin/login");
    }

    const now = new Date();

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
        todayLogins,
        weeklyLogins,
        activeSessions,
        recentActivity,
    ] = await Promise.all([
        db
            .select({ total: count() })
            .from(adminLoginAudit)
            .where(
                and(
                    eq(adminLoginAudit.adminId, admin.adminId),
                    eq(adminLoginAudit.eventType, "LOGIN_SESSION_CREATED"),
                    gte(adminLoginAudit.createdAt, today)
                )
            ),

        db
            .select({ total: count() })
            .from(adminLoginAudit)
            .where(
                and(
                    eq(adminLoginAudit.adminId, admin.adminId),
                    eq(adminLoginAudit.eventType, "LOGIN_SESSION_CREATED"),
                    gte(adminLoginAudit.createdAt, sevenDaysAgo)
                )
            ),

        db
            .select({ total: count() })
            .from(adminSessions)
            .where(
                and(
                    eq(adminSessions.adminId, admin.adminId),
                    isNull(adminSessions.revokedAt),
                    gt(adminSessions.expiresAt, now)
                )
            ),

        db
            .select({
                id: adminLoginAudit.id,
                eventType: adminLoginAudit.eventType,
                attemptedEmail: adminLoginAudit.attemptedEmail,
                ipAddress: adminLoginAudit.ipAddress,
                createdAt: adminLoginAudit.createdAt,
            })
            .from(adminLoginAudit)
            .where(eq(adminLoginAudit.adminId, admin.adminId))
            .orderBy(desc(adminLoginAudit.createdAt))
            .limit(8),
    ]);

    const stats = [
        {
            label: "Logins Today",
            value: todayLogins[0]?.total ?? 0,
            icon: CalendarDays,
            description: "Successful logins today",
        },
        {
            label: "Last 7 Days",
            value: weeklyLogins[0]?.total ?? 0,
            icon: Activity,
            description: "Successful logins this week",
        },
        {
            label: "Active Sessions",
            value: activeSessions[0]?.total ?? 0,
            icon: Monitor,
            description: "Currently valid sessions",
        },
    ];

    return (
        <main className="min-h-screen bg-[#f7f9f8]">
            {/* Header */}

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Welcome */}
                <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="mb-1 text-sm font-medium text-[#267a65]">
                            Administration
                        </p>

                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Dashboard
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Welcome back, {admin.email}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
                        <ShieldCheck size={16} className="text-[#267a65]" />
                        <span>{admin.role.replaceAll("_", " ")}</span>
                    </div>
                </section>

                {/* Statistics */}
                <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-500">
                                        {stat.label}
                                    </p>

                                    <div className="rounded-xl bg-[#eaf4f0] p-2.5 text-[#267a65]">
                                        <Icon size={20} />
                                    </div>
                                </div>

                                <p className="mt-4 text-3xl font-bold text-gray-900">
                                    {stat.value}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {stat.description}
                                </p>
                            </div>
                        );
                    })}
                </section>

                {/* Account and activity */}
                <section className="grid gap-6 lg:grid-cols-3">
                    {/* Account information */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-2">
                            <UserRound size={19} className="text-[#267a65]" />
                            <h3 className="font-semibold text-gray-900">
                                Account Information
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500">
                                    Email Address
                                </p>
                                <p className="mt-1 break-all text-sm font-medium text-gray-800">
                                    {admin.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Account Role
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-800">
                                    {admin.role.replaceAll("_", " ")}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Session Expires
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-800">
                                    {formatDate(admin.expiresAt)}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg bg-[#eaf4f0] px-3 py-2 text-sm font-medium text-[#267a65]">
                                <ShieldCheck size={16} />
                                Authenticated
                            </div>
                        </div>
                    </div>

                    {/* Recent activity */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock size={19} className="text-[#267a65]" />
                                <h3 className="font-semibold text-gray-900">
                                    Recent Activity
                                </h3>
                            </div>

                            <span className="text-xs text-gray-400">
                                Latest 8 events
                            </span>
                        </div>

                        {recentActivity.length === 0 ? (
                            <div className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                                No activity recorded yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 rounded-lg bg-gray-100 p-2 text-gray-600">
                                                <Activity size={16} />
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium capitalize text-gray-800">
                                                    {eventLabel(activity.eventType)}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {activity.attemptedEmail ?? admin.email}
                                                    {activity.ipAddress
                                                        ? ` · ${activity.ipAddress}`
                                                        : ""}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="pl-11 text-xs text-gray-400 sm:pl-0">
                                            {formatDate(activity.createdAt)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>


            </div>
        </main>
    );
}
