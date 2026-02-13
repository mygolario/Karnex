import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse, type NextRequest } from 'next/server'

const { auth } = NextAuth(authConfig)

// Simple in-memory store for rate limiting (per instance)
const rateLimit = new Map();

export const proxy = auth(async function proxy(req) {
  const request = req as NextRequest; // Cast to NextRequest for consistency
  const path = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // Note: 'auth' wrapper handles the 'authorized' callback logic in auth.config.ts
  // automatically. If the user is not authorized for a protected route, 
  // they are redirected/rejected before reaching here (or we can check req.auth).

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // --- 2. Rate Limiting for AI Chat endpoints ---
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

  // --- 5. Strict Headers (Additional Security) ---
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
