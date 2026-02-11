import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { zibalRequest } from '@/lib/zibal';
import { getPlanById } from '@/lib/payment/pricing';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log("[Payment API] ====== New Payment Request ======");
  
  try {
    const body = await req.json();
    const { planId, billingCycle = 'monthly' } = body;

    // Validate
    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Authenticate user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Calculate amount in Tomans
    const isAnnual = billingCycle === 'yearly';
    const monthlyPrice = plan.price.monthly; // Already in Tomans

    let finalAmountTomans: number;
    if (isAnnual) {
      // Yearly price = discounted monthly × 12
      finalAmountTomans = plan.price.yearly * 12;
    } else {
      finalAmountTomans = monthlyPrice;
    }

    // Convert to Rials (Zibal expects Rials)
    const amountInRials = finalAmountTomans * 10;

    console.log("[Payment API] Plan:", plan.name, `(${planId})`);
    console.log("[Payment API] Billing:", billingCycle);
    console.log("[Payment API] Amount (Tomans):", finalAmountTomans);
    console.log("[Payment API] Amount (Rials):", amountInRials);

    // Build callback URL with metadata for the verify route
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://karnex.ir';
    const callbackUrl = `${baseUrl}/api/payment/verify?plan=${planId}&cycle=${billingCycle}&uid=${user.id}`;

    console.log("[Payment API] Callback URL:", callbackUrl);

    // Record pending transaction in the database
    const orderId = `${planId}_${Date.now()}`;
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount: amountInRials,
        currency: 'IRR',
        status: 'pending',
        gateway: 'zibal',
        description: `خرید اشتراک ${plan.name} - ${isAnnual ? 'سالانه' : 'ماهانه'}`,
        metadata: { billingCycle, orderId },
      });

    if (txError) {
      console.error("[Payment API] Transaction insert error:", txError);
      // Don't block payment if transaction logging fails
    }

    // Create description
    const description = `خرید اشتراک ${plan.name} - ${isAnnual ? 'سالانه' : 'ماهانه'} - کارنکس`;

    // Initiate Zibal payment
    const paymentUrl = await zibalRequest(
      amountInRials,
      description,
      callbackUrl,
      undefined, // mobile
      orderId
    );

    if (paymentUrl) {
      console.log("[Payment API] ✅ Success! Payment URL:", paymentUrl);

      // Extract trackId and update the transaction record
      const trackId = paymentUrl.split('/start/')[1];
      if (trackId) {
        await supabase
          .from('transactions')
          .update({ track_id: trackId })
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);
      }

      return NextResponse.json({ url: paymentUrl });
    } else {
      console.error("[Payment API] ❌ Zibal returned null URL");

      // Mark transaction as failed
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      return NextResponse.json({ 
        error: 'Payment gateway error',
        message: 'لطفاً بعداً تلاش کنید یا با پشتیبانی تماس بگیرید'
      }, { status: 502 });
    }

  } catch (error) {
    console.error("[Payment API] ❌ Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
