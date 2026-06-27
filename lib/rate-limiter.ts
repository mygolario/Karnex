import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { memoryRateLimiter, RATE_LIMIT } from "@/lib/rate-limiter-memory";

let redisClient: Redis | null = null;
let redisInitialized = false;

function getRedisClient(): Redis | null {
  if (redisInitialized) return redisClient;
  
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 1000, // fail fast
      });
      redisClient.on("error", (err) => {
        console.error("Redis Error:", err);
      });
    } catch (e) {
      console.error("Failed to initialize Redis client:", e);
    }
  }
  
  redisInitialized = true;
  return redisClient;
}

export async function rateLimiter(req: NextRequest): Promise<{ allowed: boolean; remaining: number }> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
             req.headers.get("x-real-ip") || 
             "anonymous";
  
  const redis = getRedisClient();
  if (redis) {
    try {
      const key = `rate_limit:${ip}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, Math.ceil(RATE_LIMIT.windowMs / 1000));
      }
      const remaining = Math.max(0, RATE_LIMIT.maxRequests - count);
      return {
        allowed: count <= RATE_LIMIT.maxRequests,
        remaining,
      };
    } catch (e) {
      console.warn("Redis rate limit check failed, falling back to memory:", e);
    }
  }
  
  return memoryRateLimiter(req);
}

export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { allowed, remaining } = await rateLimiter(req);
    
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
