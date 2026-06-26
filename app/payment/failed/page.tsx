"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ERROR_MESSAGES: Record<string, string> = {
  missing_track_id: "شناسه تراکنش دریافت نشد. لطفاً دوباره تلاش کنید.",
  cancelled: "پرداخت لغو شد یا ناموفق بود.",
  verification_failed: "خطا در تأیید پرداخت. اگر مبلغ از حساب شما کسر شده، با پشتیبانی تماس بگیرید.",
  gateway_rejected: "درگاه پرداخت تراکنش را رد کرد.",
  unauthorized_ip: "درخواست تأیید پرداخت معتبر نیست.",
  invalid_signature: "امضای امنیتی پرداخت نامعتبر است.",
  missing_signature: "اطلاعات امنیتی پرداخت ناقص است.",
  config_error: "پیکربندی درگاه پرداخت ناقص است.",
  system: "خطای سیستمی در تأیید پرداخت.",
};

function FailedContent() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get("error") || "verification_failed";
  const customMsg = searchParams.get("msg");

  const message =
    customMsg && customMsg !== "verification_failed"
      ? decodeURIComponent(customMsg)
      : ERROR_MESSAGES[errorKey] || ERROR_MESSAGES.verification_failed;

  return (
    <div className="container max-w-lg py-20 px-4">
      <Card className="border-2 border-destructive/20 shadow-lg">
        <CardHeader className="text-center border-b bg-destructive/5 pb-8 pt-8">
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-black text-destructive">پرداخت ناموفق</CardTitle>
        </CardHeader>

        <CardContent className="pt-8">
          <p className="text-center text-muted-foreground leading-relaxed">{message}</p>
          <p className="text-center text-sm text-muted-foreground mt-4">
            اگر مبلغ از حساب شما کسر شده، تا ۷۲ ساعت به حسابتان بازمی‌گردد یا با{" "}
            <a href="mailto:support@karnex.ir" className="text-primary underline">
              support@karnex.ir
            </a>{" "}
            تماس بگیرید.
          </p>
        </CardContent>

        <CardFooter className="pb-8 flex flex-col gap-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/pricing">
              تلاش مجدد
              <ArrowRight className="ms-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/overview">بازگشت به داشبورد</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      }
    >
      <FailedContent />
    </Suspense>
  );
}
