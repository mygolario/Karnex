import { NextResponse } from 'next/server';
import { zibalRequest } from '@/lib/zibal';

export async function POST(req: Request) {
  console.log("[Payment API] ====== New Payment Request ======");
  
  try {
    const body = await req.json();
    const { planId, amount, isAnnual } = body;

    console.log("[Payment API] Plan ID:", planId);
    console.log("[Payment API] Amount:", amount);
    console.log("[Payment API] Is Annual:", isAnnual);

    // Validate inputs
    if (!amount || !planId) {
      console.error("[Payment API] ❌ Missing required parameters");
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Calculate final amount (apply 20% discount if annual)
    let finalAmount = amount; 
    if (isAnnual) {
      finalAmount = (amount * 12) * 0.8;
    }

    // Convert to Rials (Zibal takes Rials)
    const amountInRials = finalAmount * 10; 
    console.log("[Payment API] Final Amount (Tomans):", finalAmount);
    console.log("[Payment API] Amount in Rials:", amountInRials);

    // Determine callback URL - MUST be HTTPS for production
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://karnex.ir';
    const callbackUrl = `${baseUrl}/api/payment/verify?plan=${planId}`;
    
    console.log("[Payment API] Base URL:", baseUrl);
    console.log("[Payment API] Callback URL:", callbackUrl);
    
    // Create description
    const description = `خرید اشتراک ${planId} - ${isAnnual ? 'سالانه' : 'ماهانه'} - کارنکس`;

    // Initiate payment
    const paymentUrl = await zibalRequest(
      amountInRials,
      description,
      callbackUrl
    );

    if (paymentUrl) {
      console.log("[Payment API] ✅ Success! Redirecting to:", paymentUrl);
      return NextResponse.json({ url: paymentUrl });
    } else {
      console.error("[Payment API] ❌ Zibal returned null URL");
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

