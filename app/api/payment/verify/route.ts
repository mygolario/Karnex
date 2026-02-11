import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { zibalVerify } from '@/lib/zibal';
import { createSubscription, recordTransaction } from '@/lib/subscription';
import { getPlanById } from '@/lib/payment/pricing';
import { BillingCycle } from '@/lib/payment/types';

export const dynamic = 'force-dynamic';

/**
 * Payment Verify Route
 * 
 * Zibal redirects here after user completes (or cancels) payment.
 * Query params from Zibal: trackId, success, status, orderId
 * Query params we added: plan, cycle, uid
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  // Zibal callback params
  const trackId = searchParams.get('trackId');
  const success = searchParams.get('success');
  const status = searchParams.get('status');
  
  // Our custom params (added to callbackUrl in request route)
  const planId = searchParams.get('plan');
  const billingCycle = (searchParams.get('cycle') || 'monthly') as BillingCycle;
  const userId = searchParams.get('uid');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://karnex.ir';

  console.log("[Payment Verify] ====== Verify Started ======");
  console.log("[Payment Verify] TrackId:", trackId);
  console.log("[Payment Verify] Success:", success);
  console.log("[Payment Verify] Status:", status);
  console.log("[Payment Verify] Plan:", planId);
  console.log("[Payment Verify] Cycle:", billingCycle);
  console.log("[Payment Verify] UserId:", userId);

  // If no trackId or user cancelled
  if (!trackId || !status || success === '0') {
    console.log("[Payment Verify] ❌ Payment cancelled or missing params");
    return NextResponse.redirect(new URL('/pricing?error=cancelled', baseUrl));
  }

  // Validate required params
  if (!planId || !userId) {
    console.error("[Payment Verify] ❌ Missing plan or userId");
    return NextResponse.redirect(new URL('/pricing?error=invalid_params', baseUrl));
  }

  // Get plan details
  const plan = getPlanById(planId);
  if (!plan) {
    console.error("[Payment Verify] ❌ Invalid plan:", planId);
    return NextResponse.redirect(new URL('/pricing?error=invalid_plan', baseUrl));
  }

  // Create admin client for DB operations (no cookie-based auth needed for verify callback)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Verify with Zibal
    const verifyResult = await zibalVerify(trackId);
    
    console.log("[Payment Verify] Zibal result:", JSON.stringify(verifyResult));

    if (!verifyResult) {
      console.error("[Payment Verify] ❌ Zibal verify returned null");
      await updateTransactionFailed(supabase, trackId, userId);
      return NextResponse.redirect(new URL('/pricing?error=verify_failed', baseUrl));
    }

    // Zibal result codes: 100 = success, 201 = already verified
    const isSuccess = verifyResult.result === 100 || verifyResult.result === 201;

    if (!isSuccess) {
      console.error("[Payment Verify] ❌ Payment failed. Result:", verifyResult.result, verifyResult.message);
      await updateTransactionFailed(supabase, trackId, userId);
      
      const failUrl = new URL('/pricing', baseUrl);
      failUrl.searchParams.set('error', 'payment_failed');
      failUrl.searchParams.set('msg', verifyResult.message || 'تراکنش ناموفق بود');
      return NextResponse.redirect(failUrl);
    }

    // === PAYMENT SUCCESSFUL ===
    console.log("[Payment Verify] ✅ Payment verified successfully!");
    console.log("[Payment Verify] Ref Number:", verifyResult.refNumber);
    console.log("[Payment Verify] Card:", verifyResult.cardNumber);

    // 1. Activate/upgrade subscription
    try {
      await createSubscription(userId, planId, billingCycle);
      console.log("[Payment Verify] ✅ Subscription activated:", plan.name, billingCycle);
    } catch (subError) {
      console.error("[Payment Verify] ⚠️ Subscription creation error (payment was successful):", subError);
      // Don't fail the flow — payment was successful. Log for manual review.
    }

    // 2. Update transaction to completed
    const amount = billingCycle === 'yearly' 
      ? plan.price.yearly * 12 * 10  // yearly total in Rials
      : plan.price.monthly * 10;     // monthly in Rials

    try {
      // Update existing pending transaction
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          ref_id: verifyResult.refNumber?.toString(),
          card_pan: verifyResult.cardNumber,
          completed_at: new Date().toISOString(),
        })
        .eq('track_id', trackId)
        .eq('user_id', userId);

      if (updateError) {
        // If no pending transaction found, create a new one
        console.log("[Payment Verify] No pending tx found, recording new one");
        await recordTransaction({
          userId,
          planId,
          amount,
          currency: 'IRR',
          status: 'completed',
          gateway: 'zibal',
          gatewayRef: trackId,
          refId: verifyResult.refNumber?.toString(),
          cardPan: verifyResult.cardNumber,
          description: `خرید اشتراک ${plan.name} - ${billingCycle === 'yearly' ? 'سالانه' : 'ماهانه'}`,
          completedAt: new Date(),
        });
      }
      
      console.log("[Payment Verify] ✅ Transaction recorded");
    } catch (txError) {
      console.error("[Payment Verify] ⚠️ Transaction recording error:", txError);
    }

    // 3. Redirect to dashboard with success
    const successUrl = new URL('/dashboard/overview', baseUrl);
    successUrl.searchParams.set('payment_status', 'success');
    successUrl.searchParams.set('plan', plan.name);
    successUrl.searchParams.set('refId', verifyResult.refNumber?.toString() || '');
    
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error("[Payment Verify] ❌ Fatal error:", error);
    await updateTransactionFailed(supabase, trackId, userId);
    return NextResponse.redirect(new URL('/pricing?error=system', baseUrl));
  }
}

/**
 * Helper to mark a transaction as failed
 */
async function updateTransactionFailed(supabase: any, trackId: string, userId: string) {
  try {
    await supabase
      .from('transactions')
      .update({ status: 'failed' })
      .eq('track_id', trackId)
      .eq('user_id', userId);
  } catch (e) {
    console.error("[Payment Verify] Could not update transaction status:", e);
  }
}
