import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // Max requests per window
};

export function rateLimiter(req: NextRequest): { allowed: boolean; remaining: number } {
  const ip = req.headers.get("x-forwarded-for") || 
             req.headers.get("x-real-ip") || 
             "anonymous";
  
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;
  
  // Get or create entry
  let entry = rateLimitMap.get(ip);
  
  if (!entry || entry.resetTime < now) {
    // Reset window
    entry = { count: 0, resetTime: now + RATE_LIMIT.windowMs };
    rateLimitMap.set(ip, entry);
  }
  
  entry.count++;
  
  // Clean up old entries periodically
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
    remaining
  };
}

export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { allowed, remaining } = rateLimiter(req);
    
    if (!allowed) {
      return NextResponse.json(
        { error: "درخواست‌های زیادی ارسال شده. لطفاً کمی صبر کنید.", code: "RATE_LIMITED" },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "Retry-After": "60"
          }
        }
      );
    }
    
    const response = await handler(req);
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    
    return response;
  };
}
