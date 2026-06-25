import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { zibalRequest } from '@/lib/zibal';
import { getPlanById } from '@/lib/payment/pricing';
import prisma from "@/lib/prisma";
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {

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

    // Create orderId first to include in the signature
    const orderId = `${planId}_${Date.now()}`;

    // Cryptographic signature of payment request to prevent parameter tampering on callback
    const secret = process.env.ZIBAL_WEBHOOK_SECRET || process.env.ZIBAL_MERCHANT;
    if (!secret) {
        console.error("[Payment Request API] Zibal secret/merchant key is not configured.");
        return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }
    const dataToSign = `${user.id}:${planId}:${orderId}`;
    const signature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');

    // Build callback URL with metadata for the verify page and the signature
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.karnex.ir';
    // Use the PAGE route, not the API route
    const callbackUrl = `${baseUrl}/payment/verify?plan=${planId}&cycle=${billingCycle}&uid=${user.id}&orderId=${orderId}&sig=${signature}`;
    
    // Create description
    const description = `خرید اشتراک ${plan.name} - ${isAnnual ? 'سالانه' : 'ماهانه'} - کارنکس`;

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
            metadata: { billingCycle, orderId } // Save billing cycle for subscription activation
        }
    });


    // Initiate Zibal payment
    const paymentUrl = await zibalRequest(
      amountInRials,
      description,
      callbackUrl,
      undefined, // mobile
      orderId
    );

    if (paymentUrl) {
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
