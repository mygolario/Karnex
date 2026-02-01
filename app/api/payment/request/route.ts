import { NextResponse } from 'next/server';
import { zibalRequest } from '@/lib/zibal';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, amount, isAnnual } = body;

    // Validate inputs
    if (!amount || !planId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Calculate final amount (apply 20% discount if annual)
    let finalAmount = amount; 
    if (isAnnual) {
      finalAmount = (amount * 12) * 0.8;
    }

    // Convert to Rials (Zibal takes Rials)
    const amountInRials = finalAmount * 10; 

    // Determine callback URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://karnex.ir';
    const callbackUrl = `${baseUrl}/api/payment/verify?plan=${planId}`;
    
    // Create description
    const description = `خرید اشتراک ${planId} - ${isAnnual ? 'سالانه' : 'ماهانه'} - کارنکس`;

    // Initiate payment
    const paymentUrl = await zibalRequest(
      amountInRials,
      description,
      callbackUrl
    );

    if (paymentUrl) {
      return NextResponse.json({ url: paymentUrl });
    } else {
      console.error('Zibal returned null url');
      return NextResponse.json({ error: 'Payment gateway error' }, { status: 502 });
    }

  } catch (error) {
    console.error('Payment API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
