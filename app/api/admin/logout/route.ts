
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { adminSessions } from "@/lib/db/schema";

import {
    hashSessionToken,
    SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

import { writeAuditLog } from "@/lib/auth/audit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(
      SESSION_COOKIE_NAME
    )?.value;

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return response;
    }

    const tokenHash = hashSessionToken(token);

    const [revoked] = await db
      .update(adminSessions)
      .set({
        revokedAt: new Date(),
      })
      .where(
        and(
          eq(adminSessions.sessionTokenHash, tokenHash),
          isNull(adminSessions.revokedAt)
        )
      )
      .returning({
        adminId: adminSessions.adminId,
      });

    if (revoked) {
      await writeAuditLog({
        adminId: revoked.adminId,
        eventType: "LOGOUT",
        request,
      });
    }

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete logout.",
      },
      { status: 500 }
    );
  }
}
