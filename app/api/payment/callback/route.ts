/**
 * Payment Callback API
 * 
 * Handles callbacks from payment gateways.
 * GET /api/payment/callback
 * POST /api/payment/callback (for webhooks)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createGateway } from '@/lib/payment';
import { createSubscription, recordTransaction, updateTransactionStatus } from '@/lib/subscription';
import { getPlanById } from '@/lib/payment/pricing';
import { BillingCycle } from '@/lib/payment/types';

// Handle GET callback (redirect from gateway)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const authority = searchParams.get('Authority') || searchParams.get('authority');
  const status = searchParams.get('Status') || searchParams.get('status');
  const sessionId = searchParams.get('sessionId');
  
  // Check if payment was cancelled
  if (status === 'NOK' || status === 'CANCEL') {
    return NextResponse.redirect(
      new URL('/pricing?payment=cancelled', request.url)
    );
  }
  
  try {
    // For mock gateway, use sessionId; for real gateways, use authority
    const verificationToken = authority || sessionId;
    
    if (!verificationToken) {
      return NextResponse.redirect(
        new URL('/pricing?payment=error&reason=missing_token', request.url)
      );
    }
    
    const gateway = createGateway();
    const result = await gateway.verifyPayment(verificationToken);
    
    if (result.success) {
      // Payment successful - redirect to dashboard
      return NextResponse.redirect(
        new URL(`/dashboard?upgrade=success&ref=${result.refId || result.transactionId}`, request.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/pricing?payment=failed&reason=${result.error?.code || 'verification_failed'}`, request.url)
      );
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    
    return NextResponse.redirect(
      new URL('/pricing?payment=error&reason=server_error', request.url)
    );
  }
}

// Handle POST webhook (for server-to-server callbacks)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      authority,
      transactionId,
      planId,
      userId,
      billingCycle,
      status: paymentStatus 
    } = body;
    
    // Verify the payment
    const gateway = createGateway();
    const result = await gateway.verifyPayment(authority || transactionId);
    
    if (!result.success) {
      // Log failed transaction
      if (transactionId) {
        await updateTransactionStatus(transactionId, 'failed', {
          error: result.error,
        } as any);
      }
      
      return NextResponse.json({ success: false, error: result.error });
    }
    
    // Get plan details
    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Invalid plan' });
    }
    
    // Create/update subscription
    await createSubscription(
      userId,
      planId,
      (billingCycle || 'monthly') as BillingCycle
    );
    
    // Record successful transaction
    const amount = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
    await recordTransaction({
      userId,
      planId,
      amount,
      currency: plan.currency,
      status: 'completed',
      gateway: gateway.name,
      gatewayRef: authority,
      refId: result.refId,
      cardPan: result.cardPan,
      description: `خرید پلن ${plan.name}`,
      completedAt: new Date(),
    });
    
    return NextResponse.json({ success: true, refId: result.refId });
  } catch (error) {
    console.error('Payment webhook error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
