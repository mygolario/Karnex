"use server";

import prisma from "@/lib/prisma";
import { zibalVerify } from "@/lib/zibal";
import { createSubscription, recordTransaction, updateTransactionStatus } from "@/lib/subscription";
import { getPlanById } from "@/lib/payment/pricing";
import { BillingCycle } from "@/lib/payment/types";
import { sendEmail } from "@/lib/email";
import { getActivationEmailTemplate } from "@/lib/email-templates";

export interface VerifyPaymentResult {
  success: boolean;
  message?: string;
  planName?: string;
  refId?: string;
  transactionId?: string;
}

export async function verifyPaymentAction(trackId: string, orderId?: string): Promise<VerifyPaymentResult> {
    console.log("[Payment Verify Action] Started:", { trackId, orderId });

    // Find transaction by trackId (which is the gateway authority/ref)
    // We need to find the PENDING transaction to get the user and plan details
    const pendingTx = await prisma.transaction.findFirst({
        where: { 
            trackId: trackId,
            status: 'pending' // Only look for pending ones
        },
        include: {
            user: true // Include user to get email for notification
        }
    });
    
    if (!pendingTx) {
        return { success: false, message: "Transaction not found or already processed" };
    }

    const { userId, planId, amount: txAmount } = pendingTx;

    // Use metadata to store/retrieve billing cycle if not in schema, 
    // or assume monthly/calculate based on amount? 
    // For now, let's assume we can derive or it's stored. 
    // Actually, Subscription model has billingCycle, Transaction doesn't explicitly have it in the schema I saw earlier 
    // BUT we can try to extract it from description or metadata if we saved it.
    // Let's check metadata.
    const metadata = pendingTx.metadata as any || {};
    const billingCycle = metadata.billingCycle || 'monthly';
    const planIdFixed = planId || metadata.planId;

    if (!planIdFixed) return { success: false, message: "Invalid transaction data: missing planId" };

    const plan = getPlanById(planIdFixed);
    if (!plan) return { success: false, message: "Invalid plan" };

    const transactionId = pendingTx.id;

    try {
        const verifyResult = await zibalVerify(trackId);

        if (!verifyResult) {
            await updateTransactionStatus(transactionId, 'failed');
            return { success: false, message: "Gateway verification failed" };
        }

        // 100 or 201 = success
        const isSuccess = verifyResult.result === 100 || verifyResult.result === 201;

        if (!isSuccess) {
            await updateTransactionStatus(transactionId, 'failed');
            return { success: false, message: verifyResult.message || "Payment failed" };
        }

        // Success - Create or Update Subscription
        await createSubscription(userId, planIdFixed, billingCycle as BillingCycle);

        // Update Transaction to Completed
        await updateTransactionStatus(transactionId, 'completed', {
            refId: verifyResult.refNumber?.toString(),
            cardPan: verifyResult.cardNumber,
        });

        // Send Activation Email
        try {
            if (pendingTx.user?.email) {
                 const emailHtml = getActivationEmailTemplate({
                    planName: plan.name,
                    amount: txAmount / 10, // Rials to Tomans
                    refId: verifyResult.refNumber?.toString() || trackId,
                    date: new Date(),
                    userName: pendingTx.user.name || pendingTx.user.email || "User",
                    transactionId: transactionId
                });

                await sendEmail({
                    to: pendingTx.user.email,
                    subject: `فعال‌سازی اشتراک ${plan.name}`,
                    templateName: 'plan_activation',
                    htmlContent: emailHtml
                });
            }
        } catch (emailErr) {
            console.error("Failed to send activation email:", emailErr);
        }

        return { 
            success: true, 
            planName: plan.name, 
            refId: verifyResult.refNumber?.toString(),
            transactionId: transactionId 
        };

    } catch (error: any) {
        console.error("Payment Verification Error:", error);
        await updateTransactionStatus(transactionId, 'failed');
        return { success: false, message: error.message || "Internal server error" };
    }
}

export async function getUserTransactions(userId: string) {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return transactions;
    } catch (error) {
        console.error("Failed to fetch user transactions:", error);
        return [];
    }
}
