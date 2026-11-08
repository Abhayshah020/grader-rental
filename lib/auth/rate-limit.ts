
import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminRateLimits } from "@/lib/db/schema";

const secret = process.env.ADMIN_SESSION_SECRET;

interface RateLimitOptions {
    key: string;
    limit: number;
    windowMs: number;
}

export async function consumeRateLimit({
    key,
    limit,
    windowMs,
}: RateLimitOptions) {
    if (!secret || secret.length < 64) {
        throw new Error("ADMIN_SESSION_SECRET is not configured correctly.");
    }
    
    const now = Date.now();
    const windowStartMs =
        Math.floor(now / windowMs) * windowMs;

    const windowStart = new Date(windowStartMs);
    const expiresAt = new Date(windowStartMs + windowMs);

    // Do not store raw email addresses or IP addresses
    // as rate-limit keys.
    const hashedKey = createHmac("sha256", secret)
        .update(key)
        .digest("hex");

    const [result] = await db
        .insert(adminRateLimits)
        .values({
            key: hashedKey,
            windowStart,
            count: 1,
            expiresAt,
        })
        .onConflictDoUpdate({
            target: [
                adminRateLimits.key,
                adminRateLimits.windowStart,
            ],
            set: {
                count: sql`${adminRateLimits.count} + 1`,
            },
        })
        .returning({
            count: adminRateLimits.count,
        });

    const currentCount = Number(result.count);

    return {
        allowed: currentCount <= limit,
        limit,
        remaining: Math.max(0, limit - currentCount),
        retryAfter: Math.max(
            1,
            Math.ceil((expiresAt.getTime() - now) / 1000)
        ),
    };
}
