
import {
  createHash,
  randomBytes,
} from "node:crypto";

import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { admins, adminSessions } from "@/lib/db/schema";

export const SESSION_COOKIE_NAME = "admin_session";

export const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60;

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function getAuthenticatedAdmin(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const [result] = await db
    .select({
      adminId: admins.id,
      email: admins.email,
      role: admins.role,
      sessionId: adminSessions.id,
      expiresAt: adminSessions.expiresAt,
    })
    .from(adminSessions)
    .innerJoin(
      admins,
      eq(adminSessions.adminId, admins.id)
    )
    .where(
      and(
        eq(adminSessions.sessionTokenHash, tokenHash),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, new Date()),
        eq(admins.isActive, true)
      )
    )
    .limit(1);

  if (!result) {
    return null;
  }

  return result;
}
