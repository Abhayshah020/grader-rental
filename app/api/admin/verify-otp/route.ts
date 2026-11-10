
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  adminLoginOtps
} from "@/lib/db/schema";

import { verifyOTP } from "@/lib/auth/otp";
import {
  generateSessionToken,
  hashSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth/session";

import { writeAuditLog } from "@/lib/auth/audit";
import { consumeRateLimit } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/),
});

const MAX_OTP_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const challengeId = request.cookies.get(
      "admin_otp_challenge"
    )?.value;

    if (
      !challengeId ||
      !/^[0-9a-f-]{36}$/i.test(challengeId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification session expired. Please log in again.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = otpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid six-digit OTP.",
        },
        { status: 400 }
      );
    }

    const rateLimit = await consumeRateLimit({
      key: `otp:challenge:${challengeId}`,
      limit: MAX_OTP_ATTEMPTS,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      await writeAuditLog({
        eventType: "RATE_LIMITED",
        request,
        metadata: {
          reason: "OTP_VERIFICATION_RATE_LIMIT",
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Too many verification attempts. Please log in again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
          },
        }
      );
    }

    const [challenge] = await db
      .select()
      .from(adminLoginOtps)
      .where(
        and(
          eq(adminLoginOtps.id, challengeId),
          isNull(adminLoginOtps.consumedAt),
          gt(adminLoginOtps.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP expired or invalid. Please log in again.",
        },
        { status: 401 }
      );
    }

    if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum OTP attempts exceeded. Please log in again.",
        },
        { status: 429 }
      );
    }

    const otpValid = verifyOTP(
      parsed.data.otp,
      challenge.otpHash,
      challenge.id
    );

    if (!otpValid) {
      const [updatedChallenge] = await db
        .update(adminLoginOtps)
        .set({
          attempts: sql`${adminLoginOtps.attempts} + 1`,
        })
        .where(
          and(
            eq(adminLoginOtps.id, challenge.id),
            isNull(adminLoginOtps.consumedAt),
            gt(adminLoginOtps.expiresAt, new Date()),
            sql`${adminLoginOtps.attempts} < ${MAX_OTP_ATTEMPTS}`
          )
        )
        .returning({
          attempts: adminLoginOtps.attempts,
        });

      await writeAuditLog({
        adminId: challenge.adminId,
        eventType: "OTP_FAILED",
        request,
        metadata: {
          attempts: updatedChallenge?.attempts ?? null,
        },
      });

      if (!updatedChallenge) {
        return NextResponse.json(
          {
            success: false,
            message: "OTP expired or maximum attempts exceeded. Please log in again.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Incorrect verification code.",
          remainingAttempts:
            MAX_OTP_ATTEMPTS - updatedChallenge.attempts,
        },
        { status: 400 }
      );
    }

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);

    const expiresAt = new Date(
      Date.now() + SESSION_DURATION_SECONDS * 1000
    );

    // One PostgreSQL statement:
    // 1. Atomically consume the valid OTP.
    // 2. Verify the admin is still active.
    // 3. Create the authenticated session.
    const result = await db.execute(sql`
      WITH consumed AS (
        UPDATE admin_login_otps AS otp
        SET
          consumed_at = NOW(),
          verified_at = NOW()
        FROM admins AS admin
        WHERE
          otp.id = ${challenge.id}::uuid
          AND otp.admin_id = admin.id
          AND otp.otp_hash = ${challenge.otpHash}
          AND otp.consumed_at IS NULL
          AND otp.expires_at > NOW()
          AND otp.attempts < ${MAX_OTP_ATTEMPTS}
          AND admin.is_active = TRUE
        RETURNING otp.admin_id
      ),
      created AS (
        INSERT INTO admin_sessions (
          admin_id,
          session_token_hash,
          ip_address,
          user_agent,
          expires_at
        )
        SELECT
          consumed.admin_id,
          ${tokenHash},
          ${challenge.ipAddress},
          ${challenge.userAgent},
          ${expiresAt}
        FROM consumed
        RETURNING id, admin_id
      )
      SELECT id, admin_id FROM created
    `);

    if (!result.rows || result.rows.length === 0) {
      await writeAuditLog({
        adminId: challenge.adminId,
        eventType: "OTP_FAILED",
        request,
        metadata: {
          reason: "OTP_ALREADY_USED_EXPIRED_OR_ADMIN_INACTIVE",
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Verification expired or already used. Please log in again.",
        },
        { status: 401 }
      );
    }

    await writeAuditLog({
      adminId: challenge.adminId,
      eventType: "OTP_VERIFIED",
      request,
    });

    await writeAuditLog({
      adminId: challenge.adminId,
      eventType: "LOGIN_SESSION_CREATED",
      request,
      metadata: {
        sessionId: result.rows[0].id,
        expiresAt: expiresAt.toISOString(),
        durationDays: Math.floor(
          SESSION_DURATION_SECONDS / 86400
        ),
        authenticationMethod: "EMAIL_OTP",
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      redirect: "/admin/dashboard",
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

    response.cookies.set(
      "admin_otp_challenge",
      "",
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/admin",
        maxAge: 0,
      }
    );

    return response;
  } catch (error) {
    console.error("OTP verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify OTP. Please try again.",
      },
      { status: 500 }
    );
  }
}
