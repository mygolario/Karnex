/**
 * AI Rate Limit Middleware Helper
 *
 * Auth + weighted AI credit checks for API routes.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/session';
import { getAiCreditCost } from '@/lib/ai/credit-weights';
import {
  checkAIRequestLimit,
  incrementAIUsage,
  decrementAIUsage,
} from '@/lib/usage-tracker';

export interface AILimitCheckResult {
  user: { id: string; email?: string } | null;
  errorResponse: NextResponse | null;
  rollback: () => Promise<void>;
  creditsCharged: number;
}

/**
 * Check AI credit limits for the current user.
 * @param featureOrAction - maps to weighted credit cost (see lib/ai/credit-weights.ts)
 */
export async function checkAILimit(featureOrAction?: string): Promise<AILimitCheckResult> {
  const noopRollback = async () => {};
  const creditsNeeded = getAiCreditCost(featureOrAction);

  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return {
        user: null,
        errorResponse: NextResponse.json({ error: 'Unauthorized. Please log in to use AI features.' }, { status: 401 }),
        rollback: noopRollback,
        creditsCharged: 0,
      };
    }

    const userId = user.id;

    let usageCheck;
    try {
      usageCheck = await checkAIRequestLimit(userId, creditsNeeded);
    } catch (dbError) {
      console.error('AI limit check DB error (failing closed):', dbError);
      return {
        user: { id: userId, email: user.email || undefined },
        errorResponse: NextResponse.json({
          error: 'AI_LIMIT_CHECK_UNAVAILABLE',
          message: 'به دلیل مشکل موقت در سرور، امکان بررسی سقف استفاده از هوش مصنوعی نیست. لطفاً کمی بعد تلاش کنید.',
        }, { status: 503 }),
        rollback: noopRollback,
        creditsCharged: 0,
      };
    }

    if (!usageCheck.allowed) {
      return {
        user: { id: userId, email: user.email || undefined },
        errorResponse: NextResponse.json({
          error: 'AI_LIMIT_REACHED',
          message: `شما به سقف ${usageCheck.limit} واحد اعتبار AI در ماه رسیده‌اید. برای ادامه، پلن خود را ارتقا دهید.`,
          limitReached: true,
          used: usageCheck.used,
          limit: usageCheck.limit,
          creditsNeeded,
        }, { status: 429 }),
        rollback: noopRollback,
        creditsCharged: 0,
      };
    }

    let incrementFailed = false;
    try {
      await incrementAIUsage(userId, creditsNeeded);
    } catch (dbError) {
      console.error('AI usage increment failed (allowing request):', dbError);
      incrementFailed = true;
    }

    const rollback = async () => {
      if (incrementFailed) return;
      try {
        await decrementAIUsage(userId, creditsNeeded);
      } catch (e) {
        console.error('AI usage rollback failed:', e);
      }
    };

    return {
      user: { id: userId, email: user.email || undefined },
      errorResponse: null,
      rollback,
      creditsCharged: incrementFailed ? 0 : creditsNeeded,
    };
  } catch (error) {
    console.error('AI limit check unexpected error (failing closed):', error);
    return {
      user: null,
      errorResponse: NextResponse.json({
        error: 'AI_LIMIT_CHECK_UNAVAILABLE',
        message: 'به دلیل مشکل موقت در سرور، امکان بررسی سقف استفاده از هوش مصنوعی نیست. لطفاً کمی بعد تلاش کنید.',
      }, { status: 503 }),
      rollback: noopRollback,
      creditsCharged: 0,
    };
  }
}
