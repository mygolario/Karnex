import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth/session";
import { zibalRequest } from '@/lib/zibal';
import { getPlanById } from '@/lib/payment/pricing';
import prisma from "@/lib/prisma";

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

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const isAnnual = billingCycle === 'yearly';
    const finalAmountTomans = isAnnual ? plan.price.yearly : plan.price.monthly;
    const amountInRials = finalAmountTomans * 10;

    const orderId = `${planId}_${Date.now()}`;

    // Clean callback URL — Zibal only appends trackId, success, status, orderId.
    // All payment context is stored in the Transaction record before redirect.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.karnex.ir';
    const callbackUrl = `${baseUrl}/api/payment/verify`;
    
    const description = `خرید اشتراک ${plan.name} - ${isAnnual ? 'سالانه' : 'ماهانه'} - کارنکس`;

    const transaction = await prisma.transaction.create({
        data: {
            userId: user.id,
            planId: planId,
            amount: amountInRials,
            currency: 'IRR',
            status: 'pending',
            gateway: 'zibal',
            description: description,
            metadata: { billingCycle, orderId },
        }
    });

    const paymentUrl = await zibalRequest(
      amountInRials,
      description,
      callbackUrl,
      undefined,
      orderId
    );

    if (paymentUrl) {
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
