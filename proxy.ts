import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting (per instance)
// Note: In serverless, this memory is not shared, but it helps against single-instance floods.
const rateLimit = new Map();

export function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const path = request.nextUrl.pathname;

  // 1. Rate Limiting for AI Chat endpoints
  if (path.startsWith('/api/chat')) {
    const limit = 10; // Requests
    const windowMs = 60 * 1000; // 1 Minute

    const now = Date.now();
    const windowStart = now - windowMs;

    const requestLog = rateLimit.get(ip) || [];
    const recentRequests = requestLog.filter((timestamp: number) => timestamp > windowStart);

    if (recentRequests.length >= limit) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);
  }

  // 2. Strict Headers (Additional Security)
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
