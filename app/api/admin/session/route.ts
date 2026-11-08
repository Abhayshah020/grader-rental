
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { adminSessions } from "@/lib/db/schema";

import {
  getAuthenticatedAdmin,
  SESSION_COOKIE_NAME
} from "@/lib/auth/session";


export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(
      SESSION_COOKIE_NAME
    )?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const admin = await getAuthenticatedAdmin(token);

    if (!admin) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Update last activity for the authenticated session.
    await db
      .update(adminSessions)
      .set({
        lastActivityAt: new Date(),
      })
      .where(
        eq(adminSessions.id, admin.sessionId)
      );

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: admin.adminId,
        email: admin.email,
        role: admin.role,
      },
      expiresAt: admin.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Session validation error:", error);

    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // POST is intentionally not used for session validation.
  return NextResponse.json(
    { message: "Method not allowed." },
    { status: 405 }
  );
}
