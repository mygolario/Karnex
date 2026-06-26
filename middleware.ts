import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const rateLimit = new Map<string, number[]>();

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

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
    path.startsWith("/api/generate-image");

  let response = supabaseResponse;

  if (isAIRoute) {
    const limit = 30;
    const windowMs = 60 * 1000;
    const now = Date.now();
    const windowStart = now - windowMs;
    const requestLog = rateLimit.get(ip) || [];
    const recentRequests = requestLog.filter((timestamp) => timestamp > windowStart);

    if (recentRequests.length >= limit) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    recentRequests.push(now);
    rateLimit.set(ip, recentRequests);
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
