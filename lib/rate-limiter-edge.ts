import type { NextRequest } from "next/server";
import { memoryRateLimiter, RATE_LIMIT } from "@/lib/rate-limiter-memory";

/**
 * Edge-safe rate limit for Next.js middleware.
 * Uses Upstash Redis REST when configured; otherwise in-memory (per isolate).
 * Classic REDIS_URL (ioredis TCP) cannot run on the Edge — use that via
 * `lib/rate-limiter.ts` inside Node.js API routes.
 */
export async function edgeRateLimit(
  req: NextRequest,
): Promise<{ allowed: boolean; remaining: number }> {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (restUrl && restToken) {
    try {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        "anonymous";
      const key = `rl:${ip}`;
      const windowSec = Math.ceil(RATE_LIMIT.windowMs / 1000);

      const res = await fetch(`${restUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${restToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, windowSec],
        ]),
      });

      if (res.ok) {
        const data = (await res.json()) as Array<{ result: number }>;
        const count = Number(data?.[0]?.result ?? 0);
        const remaining = Math.max(0, RATE_LIMIT.maxRequests - count);
        return {
          allowed: count <= RATE_LIMIT.maxRequests,
          remaining,
        };
      }
    } catch (e) {
      console.warn("Upstash rate limit failed, using memory:", e);
    }
  }

  return memoryRateLimiter(req);
}
