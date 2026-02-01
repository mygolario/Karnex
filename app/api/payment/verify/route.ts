import { NextResponse } from 'next/server';
import { zibalVerify } from '@/lib/zibal';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get('trackId');
  const status = searchParams.get('status');
  const success = searchParams.get('success');
  const planId = searchParams.get('plan');
  
  if (!trackId || !status) {
       // User cancelled or back button
       return NextResponse.redirect(new URL('/pricing', req.url));
  }

  try {
     const verifyResult = await zibalVerify(trackId);

     if (verifyResult && verifyResult.result === 100) {
         // Payment Successful!
         // TODO: Update user's subscription in the database (Supabase/Firebase/etc) using the orderId or session.
         // For now we assume typical success flow.
         
         const successUrl = new URL('/dashboard/overview', req.url);
         successUrl.searchParams.set('payment_status', 'success');
         successUrl.searchParams.set('plan', planId || 'unknown');
         successUrl.searchParams.set('refId', String(verifyResult.refNumber));
         
         return NextResponse.redirect(successUrl);
     } else {
         // Payment Failed or already verified
         const failUrl = new URL('/pricing', req.url);
         failUrl.searchParams.set('error', 'payment_failed');
         failUrl.searchParams.set('msg', verifyResult?.message || 'تراکنش ناموفق بود');
         return NextResponse.redirect(failUrl);
     }
  } catch (error) {
      console.error("Payment Verify Error", error);
      return NextResponse.redirect(new URL('/pricing?error=system', req.url));
  }
}
