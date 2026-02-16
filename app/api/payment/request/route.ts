import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { zibalRequest } from '@/lib/zibal';
import { getPlanById } from '@/lib/payment/pricing';
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  console.log("[Payment API] ====== New Payment Request ======");
  
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

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

    // Calculate amount in Tomans
    const isAnnual = billingCycle === 'yearly';
    const monthlyPrice = plan.price.monthly; // Already in Tomans

    let finalAmountTomans: number;
    if (isAnnual) {
      // Yearly price is already total for 12 months in the plan config
      finalAmountTomans = plan.price.yearly;
    } else {
      finalAmountTomans = monthlyPrice;
    }

    // Convert to Rials (Zibal expects Rials)
    const amountInRials = finalAmountTomans * 10;

    console.log("[Payment API] Plan:", plan.name, `(${planId})`);
    console.log("[Payment API] Billing:", billingCycle);
    console.log("[Payment API] Amount (Tomans):", finalAmountTomans);
    console.log("[Payment API] Amount (Rials):", amountInRials);

    // Build callback URL with metadata for the verify page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://karnex.ir';
    // Use the PAGE route, not the API route
    const callbackUrl = `${baseUrl}/payment/verify?plan=${planId}&cycle=${billingCycle}&uid=${user.id}`;
    
    // Create description
    const description = `خرید اشتراک ${plan.name} - ${isAnnual ? 'سالانه' : 'ماهانه'} - کارنکس`;
    const orderId = `${planId}_${Date.now()}`;

    // Record pending transaction in DB using Prisma
    // We create the transaction record before request to have a trace
    const transaction = await prisma.transaction.create({
        data: {
            userId: user.id,
            planId: planId,
            amount: amountInRials,
            currency: 'IRR',
            status: 'pending',
            gateway: 'zibal',
            description: description,
            // metadata: { billingCycle, orderId } // if metadata field exists
        }
    });

    console.log("[Payment API] Transaction Created:", transaction.id);

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
         await prisma.transaction.update({
             where: { id: transaction.id },
             data: { trackId: trackId }
         });
      }

      return NextResponse.json({ url: paymentUrl });
    } else {
      console.error("[Payment API] ❌ Zibal returned null URL");

      // Mark transaction as failed
      await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'failed' }
      });

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
