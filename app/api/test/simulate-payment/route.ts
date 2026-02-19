import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, planId, billingCycle } = body;

    if (!userId || !planId) {
      return NextResponse.json({ error: "Missing userId or planId" }, { status: 400 });
    }

    // Generate a fake trackId
    const trackId = `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { createSubscription, recordTransaction } = await import("@/lib/subscription");
    const { getPlanById } = await import("@/lib/payment/pricing");
    const { sendEmail } = await import("@/lib/email");
    const { getActivationEmailTemplate } = await import("@/lib/email-templates");
    const prisma = (await import("@/lib/prisma")).default;

    const plan = getPlanById(planId);
    if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const amount = billingCycle === 'yearly' ? plan.price.yearly * 10 : plan.price.monthly * 10;

    // Simulate sucessful payment
    await createSubscription(userId, planId, billingCycle || 'monthly');

    // Create completed transaction - recordTransaction returns string ID
    const transactionId = await recordTransaction({
        userId,
        planId,
        amount,
        currency: 'IRR',
        status: 'completed',
        gateway: 'zibal', 
        gatewayRef: trackId,
        refId: `REF-${Date.now()}`,
        description: `Simulated: ${plan.name}`,
        completedAt: new Date()
    });

    // Send Email
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
            // Fetch the transaction to get refId, or just use what we generated
            const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
            
            const emailHtml = getActivationEmailTemplate({
                planName: plan.name,
                amount: amount / 10, // Display in Tomans
                refId: transaction?.refId || trackId,
                date: new Date(),
                userName: user.name || user.email,
                transactionId: transactionId
            });

            await sendEmail({
                to: user.email,
                subject: `[TEST] فعال‌سازی اشتراک ${plan.name}`,
                templateName: 'plan_activation',
                htmlContent: emailHtml
            });
        }
    } catch (e) {
        console.error("Email failed", e);
    }

    return NextResponse.json({ 
        success: true, 
        message: "Simulation complete", 
        transactionId: transactionId,
        trackId 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
