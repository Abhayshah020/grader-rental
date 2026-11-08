
import { NextRequest, NextResponse } from "next/server";
import { and, count, eq, gte, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { db } from "@/lib/db";
import { admins, adminLoginOtps, adminLoginAudit } from "@/lib/db/schema";

import { verifyPassword } from "@/lib/auth/password";
import { generateOTP, hashOTP } from "@/lib/auth/otp";
import { sendOTPEmail } from "@/lib/email/brevo";
import {
    getRequestDetails,
    writeAuditLog,
} from "@/lib/auth/audit";
import { consumeRateLimit } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

const loginSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(1).max(128),
});

const OTP_EXPIRY_MINUTES = 10;
const LOGIN_WINDOW_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 10;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password." },
                { status: 400 }
            );
        }

        const email = parsed.data.email.trim().toLowerCase();
        const password = parsed.data.password;

        const { ipAddress, userAgent } =
            getRequestDetails(request);

        const ipLimit = await consumeRateLimit({
            key: `login:ip:${ipAddress ?? "unknown"}`,
            limit: 10,
            windowMs: 15 * 60 * 1000,
        });

        const emailLimit = await consumeRateLimit({
            key: `login:email:${email}`,
            limit: 5,
            windowMs: 15 * 60 * 1000,
        });

        if (!ipLimit.allowed || !emailLimit.allowed) {
            await writeAuditLog({
                email,
                eventType: "RATE_LIMITED",
                request,
                metadata: {
                    ipLimitExceeded: !ipLimit.allowed,
                    emailLimitExceeded: !emailLimit.allowed,
                },
            });

            const retryAfter = Math.max(
                ipLimit.allowed ? 0 : ipLimit.retryAfter,
                emailLimit.allowed ? 0 : emailLimit.retryAfter
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Too many login attempts. Please try again later.",
                    retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(retryAfter),
                    },
                }
            );
        }

        const windowStart = new Date(
            Date.now() - LOGIN_WINDOW_MINUTES * 60 * 1000
        );

        // Basic database-backed login throttling.
        // We will strengthen this with atomic rate-limit records.
        const failedConditions = [
            eq(adminLoginAudit.eventType, "LOGIN_FAILED"),
            gte(adminLoginAudit.createdAt, windowStart),
        ];

        if (ipAddress) {
            failedConditions.push(
                eq(adminLoginAudit.ipAddress, ipAddress)
            );
        }

        const [failedCount] = await db
            .select({ total: count() })
            .from(adminLoginAudit)
            .where(and(...failedConditions));

        if (Number(failedCount.total) >= MAX_FAILED_ATTEMPTS) {
            await writeAuditLog({
                email,
                eventType: "RATE_LIMITED",
                request,
                metadata: {
                    reason: "TOO_MANY_FAILED_LOGIN_ATTEMPTS",
                },
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Too many login attempts. Please try again later.",
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": "900",
                    },
                }
            );
        }

        const [admin] = await db
            .select()
            .from(admins)
            .where(eq(admins.email, email))
            .limit(1);

        if (!admin || !admin.isActive) {
            await writeAuditLog({
                adminId: admin?.id ?? null,
                email,
                eventType: "LOGIN_FAILED",
                request,
                metadata: {
                    reason: "INVALID_CREDENTIALS_OR_INACTIVE_ACCOUNT",
                },
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password.",
                },
                { status: 401 }
            );
        }

        const passwordValid = await verifyPassword(
            admin.passwordHash,
            password
        );

        if (!passwordValid) {
            await writeAuditLog({
                adminId: admin.id,
                email,
                eventType: "LOGIN_FAILED",
                request,
                metadata: {
                    reason: "INVALID_CREDENTIALS",
                },
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password.",
                },
                { status: 401 }
            );
        }

        // Invalidate older unconsumed challenges for this admin.
        await db
            .update(adminLoginOtps)
            .set({
                consumedAt: new Date(),
            })
            .where(
                and(
                    eq(adminLoginOtps.adminId, admin.id),
                    // Only challenges that have not already been consumed.
                    // Expired challenges are also invalidated.
                    // A new challenge replaces the previous one.
                    // OTP verification will additionally check expiry.
                    isNull(adminLoginOtps.consumedAt)
                    //   eq(adminLoginOtps.attempts, 0)
                )
            );

        const challengeId = randomUUID();
        const otp = generateOTP();

        const expiresAt = new Date(
            Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
        );

        const otpHash = hashOTP(otp, challengeId);

        await db.insert(adminLoginOtps).values({
            id: challengeId,
            adminId: admin.id,
            otpHash,
            attempts: 0,
            resendCount: 0,
            expiresAt,
            lastSentAt: new Date(),
            ipAddress,
            userAgent,
        });

        try {
            await sendOTPEmail({
                email: admin.email,
                otp,
            });
        } catch {
            await db
                .update(adminLoginOtps)
                .set({
                    consumedAt: new Date(),
                })
                .where(eq(adminLoginOtps.id, challengeId));

            await writeAuditLog({
                adminId: admin.id,
                email: admin.email,
                eventType: "OTP_DELIVERY_FAILED",
                request,
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to send verification email. Please try again.",
                },
                { status: 502 }
            );
        }

        await writeAuditLog({
            adminId: admin.id,
            email: admin.email,
            eventType: "PASSWORD_VERIFIED",
            request,
        });

        await writeAuditLog({
            adminId: admin.id,
            email: admin.email,
            eventType: "OTP_SENT",
            request,
            metadata: {
                expiresInMinutes: OTP_EXPIRY_MINUTES,
            },
        });

        const response = NextResponse.json({
            success: true,
            message: "Verification code sent to your registered email.",
            redirect: "/admin/verify-otp",
        });

        response.cookies.set(
            "admin_otp_challenge",
            challengeId,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/api/admin",
                maxAge: OTP_EXPIRY_MINUTES * 60,
            }
        );

        return response;
    } catch (error) {
        console.error("Admin login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred. Please try again.",
            },
            { status: 500 }
        );
    }
}
