"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LegacyVerifyRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const query = params.toString();
    router.replace(query ? `/api/payment/verify?${query}` : "/payment/failed?error=missing_track_id");
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <h1 className="text-xl font-bold">در حال تأیید پرداخت...</h1>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    }>
      <LegacyVerifyRedirect />
    </Suspense>
  );
}
