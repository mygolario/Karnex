"use server";

import prisma from "@/lib/prisma";
import { zibalVerify } from "@/lib/zibal";
import { createSubscription, recordTransaction, updateTransactionStatus } from "@/lib/subscription";
import { getPlanById } from "@/lib/payment/pricing";
import { BillingCycle } from "@/lib/payment/types";

export interface VerifyPaymentResult {
  success: boolean;
  message?: string;
  planName?: string;
  refId?: string;
}

export async function verifyPaymentAction(data: {
    trackId: string;
    planId: string;
    billingCycle: string;
    userId: string;
}): Promise<VerifyPaymentResult> {
    const { trackId, planId, billingCycle, userId } = data;

    console.log("[Payment Verify Action] Started:", { trackId, planId });

    const plan = getPlanById(planId);
    if (!plan) return { success: false, message: "Invalid plan" };

    // Find transaction
    const pendingTx = await prisma.transaction.findFirst({
        where: { trackId: trackId, userId: userId }
    });
    
    const transactionId = pendingTx?.id;

    try {
        const verifyResult = await zibalVerify(trackId);

        if (!verifyResult) {
            if (transactionId) await updateTransactionStatus(transactionId, 'failed');
            return { success: false, message: "Gateway verification failed" };
        }

        // 100 or 201 = success
        const isSuccess = verifyResult.result === 100 || verifyResult.result === 201;

        if (!isSuccess) {
            if (transactionId) await updateTransactionStatus(transactionId, 'failed');
            return { success: false, message: verifyResult.message || "Payment failed" };
        }

        // Success
        await createSubscription(userId, planId, billingCycle as BillingCycle);

        if (transactionId) {
            await updateTransactionStatus(transactionId, 'completed', {
                refId: verifyResult.refNumber?.toString()
            });
        } else {
            // Record if missing
            const amount = billingCycle === 'yearly' ? plan.price.yearly * 12 * 10 : plan.price.monthly * 10;
            await recordTransaction({
                userId,
                planId,
                amount,
                currency: 'IRR',
                status: 'completed',
                gateway: 'zibal',
                gatewayRef: trackId,
                refId: verifyResult.refNumber?.toString(),
                cardPan: verifyResult.cardNumber,
                description: `Auto-record: ${plan.name}`,
                completedAt: new Date()
            });
        }

        return { success: true, planName: plan.name, refId: verifyResult.refNumber?.toString() };

    } catch (error: any) {
        console.error("Payment Verification Error:", error);
        if (transactionId) await updateTransactionStatus(transactionId, 'failed');
        return { success: false, message: error.message || "Internal server error" };
    }
}
