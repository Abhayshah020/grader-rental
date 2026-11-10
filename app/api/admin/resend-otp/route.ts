
import { NextRequest, NextResponse } from "next/server";
import {
    and,
    eq,
    gt,
    isNull,
    lt,
    lte,
    sql,
} from "drizzle-orm";

import { db } from "@/lib/db";
import { admins, adminLoginOtps } from "@/lib/db/schema";

import { generateOTP, hashOTP } from "@/lib/auth/otp";
import { sendOTPEmail } from "@/lib/email/brevo";
import {
    getRequestDetails,
    writeAuditLog,
} from "@/lib/auth/audit";
import { consumeRateLimit } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESENDS = 5;

export async function POST(request: NextRequest) {
    try {
        const challengeId = request.cookies.get(
            "admin_otp_challenge"
        )?.value;

        if (!challengeId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Your verification session has expired. Please log in again.",
                },
                { status: 401 }
            );
        }

        const { ipAddress, userAgent } =
            getRequestDetails(request);

        // Limit resend requests by IP.
        const ipLimit = await consumeRateLimit({
            key: `resend-otp:ip:${ipAddress ?? "unknown"}`,
            limit: 10,
            windowMs: 15 * 60 * 1000,
        });

        // Limit resend requests for this specific challenge.
        const challengeLimit = await consumeRateLimit({
            key: `resend-otp:challenge:${challengeId}`,
            limit: 5,
            windowMs: 15 * 60 * 1000,
        });

        if (!ipLimit.allowed || !challengeLimit.allowed) {
            await writeAuditLog({
                email: undefined,
                eventType: "OTP_RESEND_RATE_LIMITED",
                request,
                metadata: {
                    ipLimitExceeded: !ipLimit.allowed,
                    challengeLimitExceeded: !challengeLimit.allowed,
                },
            });

            const retryAfter = Math.max(
                ipLimit.allowed ? 0 : ipLimit.retryAfter,
                challengeLimit.allowed ? 0 : challengeLimit.retryAfter
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Too many resend requests. Please try again later.",
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

        // Find the current challenge and its associated administrator.
        const [challenge] = await db
            .select({
                id: adminLoginOtps.id,
                adminId: admins.id,
                email: admins.email,
                isActive: admins.isActive,
                expiresAt: adminLoginOtps.expiresAt,
                lastSentAt: adminLoginOtps.lastSentAt,
                resendCount: adminLoginOtps.resendCount,
                consumedAt: adminLoginOtps.consumedAt,
            })
            .from(adminLoginOtps)
            .innerJoin(
                admins,
                eq(adminLoginOtps.adminId, admins.id)
            )
            .where(eq(adminLoginOtps.id, challengeId))
            .limit(1);

        if (
            !challenge ||
            !challenge.isActive ||
            challenge.consumedAt ||
            challenge.expiresAt <= new Date()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Your verification code has expired. Please log in again.",
                },
                { status: 401 }
            );
        }

        if (challenge.resendCount >= MAX_RESENDS) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You have reached the maximum number of resend attempts. Please log in again.",
                },
                { status: 429 }
            );
        }

        // Enforce the 60-second cooldown on the server.
        const now = new Date();
        const cooldownCutoff = new Date(
            now.getTime() - RESEND_COOLDOWN_SECONDS * 1000
        );

        if (challenge.lastSentAt > cooldownCutoff) {
            const retryAfter = Math.ceil(
                (challenge.lastSentAt.getTime() +
                    RESEND_COOLDOWN_SECONDS * 1000 -
                    now.getTime()) / 1000
            );

            return NextResponse.json(
                {
                    success: false,
                    message: `Please wait ${retryAfter} seconds before requesting another code.`,
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

        // Generate a new OTP. The previous OTP will no longer work.
        const otp = generateOTP();
        const otpHash = hashOTP(otp, challenge.id);

        const expiresAt = new Date(
            now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
        );

        // Atomically update the challenge. This also protects against
        // simultaneous resend requests bypassing the cooldown.
        const [updatedChallenge] = await db
            .update(adminLoginOtps)
            .set({
                otpHash,
                attempts: 0,
                resendCount: sql`${adminLoginOtps.resendCount} + 1`,
                expiresAt,
                lastSentAt: now,
            })
            .where(
                and(
                    eq(adminLoginOtps.id, challenge.id),
                    isNull(adminLoginOtps.consumedAt),
                    gt(adminLoginOtps.expiresAt, now),
                    lte(adminLoginOtps.lastSentAt, cooldownCutoff),
                    lt(adminLoginOtps.resendCount, MAX_RESENDS)
                )
            )
            .returning({
                id: adminLoginOtps.id,
            });

        if (!updatedChallenge) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to resend the code yet. Please wait and try again.",
                    retryAfter: RESEND_COOLDOWN_SECONDS,
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(RESEND_COOLDOWN_SECONDS),
                    },
                }
            );
        }

        // Deliver the new OTP.
        try {
            await sendOTPEmail({
                email: challenge.email,
                otp,
            });
        } catch (emailError) {
            // Do not leave an unusable challenge active.
            await db
                .update(adminLoginOtps)
                .set({
                    consumedAt: new Date(),
                })
                .where(
                    and(
                        eq(adminLoginOtps.id, challenge.id),
                        isNull(adminLoginOtps.consumedAt)
                    )
                );

            await writeAuditLog({
                adminId: challenge.adminId,
                email: challenge.email,
                eventType: "OTP_DELIVERY_FAILED",
                request,
                metadata: {
                    source: "RESEND",
                },
            });

            console.error("OTP resend email error:", emailError);

            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to send the verification email. Please log in again.",
                },
                { status: 502 }
            );
        }

        await writeAuditLog({
            adminId: challenge.adminId,
            email: challenge.email,
            eventType: "OTP_RESENT",
            request,
            metadata: {
                expiresInMinutes: OTP_EXPIRY_MINUTES,
                resendCount: challenge.resendCount + 1,
            },
        });

        const response = NextResponse.json({
            success: true,
            message: "A new verification code has been sent to your registered email.",
            expiresInMinutes: OTP_EXPIRY_MINUTES,
            resendCooldownSeconds: RESEND_COOLDOWN_SECONDS,
        });

        // Refresh the challenge cookie lifetime to match the new OTP.
        response.cookies.set(
            "admin_otp_challenge",
            challenge.id,
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
        console.error("Admin OTP resend error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "An unexpected error occurred. Please try again.",
            },
            { status: 500 }
        );
    }
}
