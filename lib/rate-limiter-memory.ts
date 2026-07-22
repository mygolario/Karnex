import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function clearRateLimits(): void {
  rateLimitMap.clear();
}

export const RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 30,
};

/** Edge-safe in-memory rate limiter (no Node.js / Redis deps). */
export function memoryRateLimiter(
  req: NextRequest
): { allowed: boolean; remaining: number } {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  const now = Date.now();
  let entry = rateLimitMap.get(ip);

  if (!entry || entry.resetTime < now) {
    entry = { count: 0, resetTime: now + RATE_LIMIT.windowMs };
    rateLimitMap.set(ip, entry);
  }

  entry.count++;

  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  const remaining = Math.max(0, RATE_LIMIT.maxRequests - entry.count);
  return {
    allowed: entry.count <= RATE_LIMIT.maxRequests,
    remaining,
  };
}
