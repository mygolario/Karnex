import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Simple in-memory store for rate limiting (per instance)
// Note: In serverless, this memory is not shared, but it helps against single-instance floods.
const rateLimit = new Map();

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // --- 1. Supabase Auth & Session Refresh ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  // --- 3. Route Protection (Dashboards) ---
  if (path.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // --- 4. Auth Routes (Redirect to dashboard if already logged in) ---
  if (path === '/login' || path === '/signup' || path === '/reset-password') {
    if (user) {
      // Allow reset-password to be viewed if user is logged in? 
      // Usually reset password is for unauthenticated users, 
      // but 'update password' is for authenticated. 
      // Use case: User clicks "forgot password", gets email, clicks link.
      // Link logs them in automatically via Supabase magic? 
      // If code exchange happens, they stay on /reset-password? 
      // Let's keep /login and /signup redirect, but maybe check reset-password.
      // Actually, if they are logged in, they shouldn't be on /login or /signup.
      // But /reset-password might be used for 'change password'? 
      // If it is the same page, we should allow it.
      // The current reset-password page handles the "sessionCheck" logic itself.
      // Let's safe-guard /login and /signup only.
      if (path !== '/reset-password') {
          return NextResponse.redirect(new URL('/dashboard/overview', request.url));
      }
    }
  }

  // --- 5. Strict Headers (Additional Security) ---
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response
}

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
