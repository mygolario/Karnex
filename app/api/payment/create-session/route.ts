/**
 * Payment Session Creation API
 * 
 * Creates a payment session with the configured gateway.
 * POST /api/payment/create-session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createGateway } from '@/lib/payment';
import { getPlanById } from '@/lib/payment/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { planId, userId, userEmail, billingCycle, returnUrl, callbackUrl } = body;
    
    // Validate required fields
    if (!planId || !userId) {
      return NextResponse.json(
        { error: 'planId and userId are required' },
        { status: 400 }
      );
    }
    
    // Get plan details
    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }
    
    // Calculate amount based on billing cycle
    const amount = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
    
    // Create payment session
    const gateway = createGateway(); // Uses default gateway
    
    const session = await gateway.createSession({
      amount,
      currency: plan.currency,
      planId,
      userId,
      userEmail,
      returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?upgrade=success`,
      callbackUrl: callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
      description: `خرید پلن ${plan.name}`,
      metadata: {
        billingCycle,
      },
    });
    
    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        redirectUrl: session.redirectUrl,
        expiresAt: session.expiresAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Payment session creation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}
