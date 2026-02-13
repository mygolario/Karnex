/**
 * AI Rate Limit Middleware Helper
 * 
 * Reusable helper to add auth + AI usage limit checks to any API route.
 * Returns the authenticated user if allowed, or null with an error response.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkAIRequestLimit, incrementAIUsage } from '@/lib/usage-tracker';

export interface AILimitCheckResult {
  user: { id: string; email?: string } | null;
  errorResponse: NextResponse | null;
}

/**
 * Check AI request limits for the current user.
 * Returns the authenticated user if allowed, or an error response if not.
 * 
 * Usage in API routes:
 * ```ts
 * const { user, errorResponse } = await checkAILimit();
 * if (errorResponse) return errorResponse;
 * // user is authenticated and within limits
 * ```
 */
export async function checkAILimit(): Promise<AILimitCheckResult> {
  try {
    const session = await auth();
    const user = session?.user;
    
    if (!user || !user.id) {
      // Allow unauthenticated requests? Usually no for AI.
      // But preserving original logic: "Allow unauthenticated requests (they won't be tracked)"
      return { user: null, errorResponse: null };
    }

    const usageCheck = await checkAIRequestLimit(user.id);
    if (!usageCheck.allowed) {
      return {
        user: { id: user.id, email: user.email || undefined },
        errorResponse: NextResponse.json({
          error: 'محدودیت درخواست AI',
          message: `شما به سقف ${usageCheck.limit} درخواست AI در ماه رسیده‌اید. برای ادامه، پلن خود را ارتقا دهید.`,
          limitReached: true,
          used: usageCheck.used,
          limit: usageCheck.limit,
        }, { status: 429 }),
      };
    }

    // Increment usage counter
    await incrementAIUsage(user.id);

    return { user: { id: user.id, email: user.email || undefined }, errorResponse: null };
  } catch (error) {
    console.error('AI limit check error:', error);
    // On error, allow the request (fail open)
    return { user: null, errorResponse: null };
  }
}
