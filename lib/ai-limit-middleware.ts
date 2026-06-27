/**
 * AI Rate Limit Middleware Helper
 * 
 * Reusable helper to add auth + AI usage limit checks to any API route.
 * Returns the authenticated user if allowed, or null with an error response.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/session';
import { checkAIRequestLimit, incrementAIUsage, decrementAIUsage } from '@/lib/usage-tracker';

export interface AILimitCheckResult {
  user: { id: string; email?: string } | null;
  errorResponse: NextResponse | null;
  rollback: () => Promise<void>;
}

/**
 * Check AI request limits for the current user.
 * Returns the authenticated user if allowed, or an error response if not.
 *
 * Failure modes:
 *  - No session            → 401 (legitimate denial)
 *  - Monthly limit reached → 429 (legitimate denial)
 *  - DB/infra error        → 503 FAIL CLOSED (prevents overage on transient errors)
 *
 * Usage in API routes:
 * ```ts
 * const { user, errorResponse, rollback } = await checkAILimit();
 * if (errorResponse) return errorResponse;
 * // user is authenticated and within limits
 * ```
 */
export async function checkAILimit(): Promise<AILimitCheckResult> {
  const noopRollback = async () => {};
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return {
        user: null,
        errorResponse: NextResponse.json({ error: 'Unauthorized. Please log in to use AI features.' }, { status: 401 }),
        rollback: noopRollback
      };
    }

    const userId = user.id;

    let usageCheck;
    try {
      usageCheck = await checkAIRequestLimit(userId);
    } catch (dbError) {
      // Fail closed: a transient DB error must NOT let the request through,
      // otherwise users could blow past their monthly quota.
      console.error('AI limit check DB error (failing closed):', dbError);
      return {
        user: { id: userId, email: user.email || undefined },
        errorResponse: NextResponse.json({
          error: 'AI_LIMIT_CHECK_UNAVAILABLE',
          message: 'به دلیل مشکل موقت در سرور، امکان بررسی سقف استفاده از هوش مصنوعی نیست. لطفاً کمی بعد تلاش کنید.',
        }, { status: 503 }),
        rollback: noopRollback
      };
    }

    if (!usageCheck.allowed) {
      return {
        user: { id: userId, email: user.email || undefined },
        errorResponse: NextResponse.json({
          error: 'AI_LIMIT_REACHED',
          message: `شما به سقف ${usageCheck.limit} درخواست AI در ماه رسیده‌اید. برای ادامه، پلن خود را ارتقا دهید.`,
          limitReached: true,
          used: usageCheck.used,
          limit: usageCheck.limit,
        }, { status: 429 }),
        rollback: noopRollback
      };
    }

    let incrementFailed = false;
    try {
      // Increment usage counter
      await incrementAIUsage(userId);
    } catch (dbError) {
      // If increment fails we still allow the request (the check passed) but
      // flag it so we don't block the user for our own infra hiccup.
      console.error('AI usage increment failed (allowing request):', dbError);
      incrementFailed = true;
    }

    const rollback = async () => {
      if (incrementFailed) return; // nothing to roll back
      try {
        await decrementAIUsage(userId);
      } catch (e) {
        console.error('AI usage rollback failed:', e);
      }
    };

    return { user: { id: userId, email: user.email || undefined }, errorResponse: null, rollback };
  } catch (error) {
    // Unexpected error — fail closed rather than letting an unknown failure
    // bypass the quota enforcement.
    console.error('AI limit check unexpected error (failing closed):', error);
    return {
      user: null,
      errorResponse: NextResponse.json({
        error: 'AI_LIMIT_CHECK_UNAVAILABLE',
        message: 'به دلیل مشکل موقت در سرور، امکان بررسی سقف استفاده از هوش مصنوعی نیست. لطفاً کمی بعد تلاش کنید.',
      }, { status: 503 }),
      rollback: noopRollback
    };
  }
}
