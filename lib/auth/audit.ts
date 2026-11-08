
import { isIP } from "node:net";
import { db } from "../db";
import { adminLoginAudit } from "../db/schema";

interface AuditParams {
  adminId?: string | null;
  email?: string | null;
  eventType: string;
  request: Request;
  metadata?: Record<string, unknown>;
}

export function getRequestDetails(request: Request) {
  const headers = request.headers;

  // Use these headers only behind a trusted hosting proxy.
  const forwardedFor = headers.get("x-forwarded-for");

  const forwardedIp = forwardedFor
    ?.split(",")[0]
    ?.trim();

  const realIp = headers.get("x-real-ip")?.trim();

  const candidateIp = forwardedIp || realIp || null;

  const ipAddress =
    candidateIp && isIP(candidateIp)
      ? candidateIp
      : null;

  const userAgent =
    headers.get("user-agent") || "Unknown";

  return {
    ipAddress,
    userAgent,
  };
}

export async function writeAuditLog({
  adminId = null,
  email = null,
  eventType,
  request,
  metadata = {},
}: AuditParams) {
  const { ipAddress, userAgent } =
    getRequestDetails(request);

  await db.insert(adminLoginAudit).values({
    adminId,
    attemptedEmail: email,
    eventType,
    ipAddress,
    userAgent,
    metadata,
  });
}
