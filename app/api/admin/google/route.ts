import {
    eq,
    sql
} from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import {
    timingSafeEqual
} from "node:crypto";
import { z } from "zod";

import { db } from "@/lib/db";
import {
    admins,
    adminSessions,
} from "@/lib/db/schema";

import {
    generateSessionToken,
    hashSessionToken,
    SESSION_COOKIE_NAME,
    SESSION_DURATION_SECONDS,
} from "@/lib/auth/session";

import {
    getRequestDetails,
    writeAuditLog,
} from "@/lib/auth/audit";

import { consumeRateLimit } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = GOOGLE_CLIENT_ID
    ? new OAuth2Client(GOOGLE_CLIENT_ID)
    : null;

const googleSchema = z.object({
    credential: z.string().min(100).max(10000),
});

const NONCE_COOKIE = "admin_google_nonce";

function jsonResponse(
    body: Record<string, unknown>,
    status = 200
) {
    const response = NextResponse.json(body, { status });

    // A nonce must not be reused after an authentication attempt.
    response.cookies.set(NONCE_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/admin/google",
        maxAge: 0,
    });

    return response;
}

function nonceMatches(
    expected: string | undefined,
    actual: string | undefined
) {
    if (
        !expected ||
        !actual ||
        expected.length !== actual.length
    ) {
        return false;
    }

    return timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(actual)
    );
}

export async function POST(request: NextRequest) {
    try {
        if (!GOOGLE_CLIENT_ID || !googleClient) {
            console.error("GOOGLE_CLIENT_ID is not configured.");

            return jsonResponse(
                {
                    success: false,
                    message: "Google authentication is not configured.",
                },
                500
            );
        }

        // Reject cross-origin authentication requests.
        const origin = request.headers.get("origin");

        if (
            !origin ||
            origin !== request.nextUrl.origin
        ) {
            return jsonResponse(
                {
                    success: false,
                    message: "Invalid authentication request.",
                },
                403
            );
        }

        const { ipAddress, userAgent } =
            getRequestDetails(request);

        // Rate-limit Google verification by IP.
        const ipLimit = await consumeRateLimit({
            key: `google-login:ip:${ipAddress ?? "unknown"}`,
            limit: 10,
            windowMs: 15 * 60 * 1000,
        });

        if (!ipLimit.allowed) {
            await writeAuditLog({
                eventType: "RATE_LIMITED",
                request,
                metadata: {
                    reason: "GOOGLE_LOGIN_IP_RATE_LIMIT",
                },
            });

            return jsonResponse(
                {
                    success: false,
                    message: "Too many login attempts. Please try again later.",
                    retryAfter: ipLimit.retryAfter,
                },
                429
            );
        }

        const body = await request.json();
        const parsed = googleSchema.safeParse(body);

        if (!parsed.success) {
            return jsonResponse(
                {
                    success: false,
                    message: "Invalid Google authentication credentials.",
                },
                400
            );
        }

        const expectedNonce =
            request.cookies.get(NONCE_COOKIE)?.value;

        // Verify Google's signed ID token.
        const ticket = await googleClient.verifyIdToken({
            idToken: parsed.data.credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (
            !payload ||
            !payload.sub ||
            !payload.email ||
            payload.email_verified !== true ||
            !nonceMatches(expectedNonce, payload.nonce)
        ) {
            await writeAuditLog({
                eventType: "GOOGLE_LOGIN_FAILED",
                request,
                email: payload?.email ?? null,
                metadata: {
                    reason: "INVALID_GOOGLE_IDENTITY_OR_NONCE",
                },
            });

            return jsonResponse(
                {
                    success: false,
                    message: "Google authentication failed. Please try again.",
                },
                401
            );
        }

        const email = payload.email.trim().toLowerCase();

        // Independently rate-limit attempts for the verified email.
        const emailLimit = await consumeRateLimit({
            key: `google-login:email:${email}`,
            limit: 5,
            windowMs: 15 * 60 * 1000,
        });

        if (!emailLimit.allowed) {
            await writeAuditLog({
                email,
                eventType: "RATE_LIMITED",
                request,
                metadata: {
                    reason: "GOOGLE_LOGIN_EMAIL_RATE_LIMIT",
                },
            });

            return jsonResponse(
                {
                    success: false,
                    message: "Too many login attempts. Please try again later.",
                    retryAfter: emailLimit.retryAfter,
                },
                429
            );
        }

        // Google authentication does NOT automatically register admins.
        const [admin] = await db
            .select()
            .from(admins)
            .where(
                sql`lower(${admins.email}) = ${email}`
            )
            .limit(1);

        if (!admin || !admin.isActive) {
            await writeAuditLog({
                adminId: admin?.id ?? null,
                email,
                eventType: "GOOGLE_LOGIN_FAILED",
                request,
                metadata: {
                    reason: "ADMIN_NOT_FOUND_OR_INACTIVE",
                    googleSubject: payload.sub,
                },
            });

            return jsonResponse(
                {
                    success: false,
                    message: "This Google account is not authorized to access the administrator panel.",
                },
                403
            );
        }

        // Create the same application session used by OTP login.
        const token = generateSessionToken();
        const tokenHash = hashSessionToken(token);

        const expiresAt = new Date(
            Date.now() + SESSION_DURATION_SECONDS * 1000
        );

        const [session] = await db
            .insert(adminSessions)
            .values({
                adminId: admin.id,
                sessionTokenHash: tokenHash,
                ipAddress,
                userAgent,
                expiresAt,
            })
            .returning({
                id: adminSessions.id,
                expiresAt: adminSessions.expiresAt,
            });

        if (!session) {
            throw new Error("Unable to create administrator session.");
        }
        try {
            await writeAuditLog({
                adminId: admin.id,
                email: admin.email,
                eventType: "GOOGLE_LOGIN_SUCCESS",
                request,
                metadata: {
                    googleSubject: payload.sub,
                    sessionId: session.id,
                    authenticationMethod: "GOOGLE",
                },
            });

            await writeAuditLog({
                adminId: admin.id,
                email: admin.email,
                eventType: "LOGIN_SESSION_CREATED",
                request,
                metadata: {
                    sessionId: session.id,
                    expiresAt: expiresAt.toISOString(),
                    durationDays: Math.floor(
                        SESSION_DURATION_SECONDS / 86400
                    ),
                    authenticationMethod: "GOOGLE",
                },
            });
        } catch (auditError) {
            // If audit logging fails, revoke the session we just created.
            await db
                .update(adminSessions)
                .set({
                    revokedAt: new Date(),
                })
                .where(eq(adminSessions.id, session.id));

            return jsonResponse(
                {
                    success: false,
                    message: "Unable to authenticate with Google. Please try again.",
                },
                500
            );
        }

        const response = jsonResponse({
            success: true,
            message: "Google authentication successful.",
            redirect: "/admin/transactions",
            expiresAt: expiresAt.toISOString(),
        });

        response.cookies.set(
            SESSION_COOKIE_NAME,
            token,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: SESSION_DURATION_SECONDS,
                expires: expiresAt,
            }
        );

        return response;

    } catch (error) {
        console.error("Google authentication error:", error);

        return jsonResponse(
            {
                success: false,
                message: "Unable to authenticate with Google. Please try again.",
            },
            500
        );
    }
}