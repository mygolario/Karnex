"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("در حال تأیید پرداخت...");

  useEffect(() => {
    const verify = async () => {
      const trackId = searchParams.get('trackId') || searchParams.get('authority');
      const success = searchParams.get('success');
      const paymentStatus = searchParams.get('status');
      const planId = searchParams.get('plan');
      const billingCycle = searchParams.get('cycle');
      const userId = searchParams.get('uid');

      if (!trackId || !planId || !userId) {
        setStatus("اطلاعات پرداخت ناقص است.");
        setTimeout(() => router.push("/pricing?error=invalid_params"), 2000);
        return;
      }

      if (success === '0' || paymentStatus === 'nok') {
        setStatus("پرداخت ناموفق بود یا لغو شد.");
        setTimeout(() => router.push("/pricing?error=cancelled"), 2000);
        return;
      }

      try {
        // We need a server action to verify securely
        const { verifyPaymentAction } = await import("@/lib/payment-actions");
        const result = await verifyPaymentAction({
          trackId,
          planId,
          billingCycle: billingCycle || 'monthly',
          userId
        });

        if (result.success) {
          setStatus("پرداخت با موفقیت انجام شد. در حال انتقال...");
          toast.success("خرید شما با موفقیت انجام شد");
          // Redirect to Receipt Page
          if (result.transactionId) {
             router.push(`/payment/receipt/${result.transactionId}`);
          } else {
             // Fallback if no transaction ID (should not happen with new logic)
             router.push(`/dashboard/overview?payment_status=success&plan=${result.planName}`);
          }
        } else {
          setStatus("خطا در تأیید پرداخت: " + (result.message || "Unknown error"));
          toast.error(result.message || "خطا در تأیید پرداخت");
          setTimeout(() => router.push(`/pricing?error=payment_failed&msg=${result.message}`), 3000);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("خطای سیستمی در تأیید پرداخت.");
        setTimeout(() => router.push("/pricing?error=system"), 3000);
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <h1 className="text-xl font-bold">{status}</h1>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin"/></div>}>
      <VerifyContent />
    </Suspense>
  );
}
