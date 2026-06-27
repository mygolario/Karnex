import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { memoryRateLimiter } from "@/lib/rate-limiter-memory";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const { supabaseResponse, user } = await updateSession(request);

  const isLoggedIn = !!user;
  const isOnDashboard = path.startsWith("/dashboard");
  const isOnAuth =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/reset-password");

  if (isOnDashboard && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard/overview", request.url));
  }

  if (path.startsWith("/api/admin")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Admin role checked in route handlers via Prisma (app user id)
  }

  const isAIRoute =
    path.startsWith("/api/chat") ||
    path.startsWith("/api/copilot") ||
    path.startsWith("/api/ai-generate") ||
    path.startsWith("/api/generate-document") ||
    path.startsWith("/api/generate-image") ||
    path.startsWith("/api/stt");

  const isPublicWriteRoute =
    path.startsWith("/api/contact");

  const response = supabaseResponse;

  if (isAIRoute || isPublicWriteRoute) {
    // Redis-backed sliding window limiter (with in-memory fallback).
    // Works across serverless instances unlike the previous in-memory Map.
    const { allowed, remaining } = memoryRateLimiter(request);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    response.headers.set("X-RateLimit-Remaining", String(remaining));
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/((?!monitoring|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
