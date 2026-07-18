"use server";

import prisma from "@/lib/prisma";
import { zibalVerify } from "@/lib/zibal";
import { createSubscription, updateTransactionStatus } from "@/lib/subscription";
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

async function findTransaction(trackId: string, orderId?: string) {
    const byTrackId = await prisma.transaction.findFirst({
        where: { trackId },
        include: { user: true },
    });
    if (byTrackId) return byTrackId;

    if (orderId) {
        const candidates = await prisma.transaction.findMany({
            where: { status: { in: ["pending", "completed"] } },
            include: { user: true },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        return candidates.find((tx) => {
            const meta = (tx.metadata as Record<string, unknown>) || {};
            return meta.orderId === orderId;
        }) ?? null;
    }

    return null;
}

export async function verifyPaymentAction(trackId: string, orderId?: string): Promise<VerifyPaymentResult> {
    console.log("[Payment Verify Action] Started:", { trackId, orderId });

    const tx = await findTransaction(trackId, orderId);

    if (!tx) {
        return { success: false, message: "Transaction not found" };
    }

    // Idempotent: already completed — return success without re-verifying
    if (tx.status === "completed") {
        const plan = tx.planId ? getPlanById(tx.planId) : null;
        return {
            success: true,
            planName: plan?.name,
            refId: tx.refId ?? undefined,
            transactionId: tx.id,
        };
    }

    if (tx.status !== "pending") {
        return { success: false, message: "Transaction not found or already processed" };
    }

    const { userId, planId, amount: txAmount } = tx;
    const metadata = (tx.metadata as Record<string, unknown>) || {};
    const billingCycle = (metadata.billingCycle as BillingCycle) || "monthly";
    const planIdFixed = planId || (metadata.planId as string | undefined);

    if (!planIdFixed) return { success: false, message: "Invalid transaction data: missing planId" };

    const plan = getPlanById(planIdFixed);
    if (!plan) return { success: false, message: "Invalid plan" };

    const transactionId = tx.id;

    try {
        const verifyResult = await zibalVerify(trackId);

        if (!verifyResult) {
            await updateTransactionStatus(transactionId, "failed");
            return { success: false, message: "Gateway verification failed" };
        }

        const isSuccess = verifyResult.result === 100 || verifyResult.result === 201;

        if (!isSuccess) {
            await updateTransactionStatus(transactionId, "failed");
            return { success: false, message: verifyResult.message || "Payment failed" };
        }

        await createSubscription(userId, planIdFixed, billingCycle);

        await updateTransactionStatus(transactionId, "completed", {
            refId: verifyResult.refNumber?.toString(),
            cardPan: verifyResult.cardNumber,
        });

        // Trigger In-App Notification
        try {
            const { createNotification } = await import("@/lib/notifications");
            const refNumberStr = verifyResult.refNumber?.toString() || trackId;
            await createNotification(userId, {
                type: "success",
                title: "فعال‌سازی اشتراک 💳",
                message: `اشتراک ${plan.name} شما با موفقیت فعال شد. کد پیگیری: ${refNumberStr}`,
                action: { label: "حساب کاربری", href: "/dashboard/account" },
                category: "billing"
            });
        } catch (inAppErr) {
            console.error("Failed to send payment verification in-app notification:", inAppErr);
        }

        try {
            if (tx.user?.email) {
                const emailHtml = getActivationEmailTemplate({
                    planName: plan.name,
                    amount: txAmount / 10,
                    refId: verifyResult.refNumber?.toString() || trackId,
                    date: new Date(),
                    userName: tx.user.name || tx.user.email || "User",
                    transactionId: transactionId,
                });

                await sendEmail({
                    to: tx.user.email,
                    subject: `فعال‌سازی اشتراک ${plan.name}`,
                    templateName: "plan_activation",
                    htmlContent: emailHtml,
                });
            }
        } catch (emailErr) {
            console.error("Failed to send activation email:", emailErr);
        }

        return {
            success: true,
            planName: plan.name,
            refId: verifyResult.refNumber?.toString(),
            transactionId: transactionId,
        };
    } catch (error: unknown) {
        console.error("Payment Verification Error:", error);
        await updateTransactionStatus(transactionId, "failed");
        return {
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        };
    }
}

export async function getUserTransactions(userId: string) {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        return transactions;
    } catch (error) {
        console.error("Failed to fetch user transactions:", error);
        return [];
    }
}
