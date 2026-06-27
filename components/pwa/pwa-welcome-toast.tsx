"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function PwaWelcomeToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const source = searchParams.get("source") || searchParams.get("pwa");
    if (source === "pwa" || source === "true") {
      toast.success("به کارنکس خوش آمدید!", {
        description: "نسخه موبایل کارنکس آماده استفاده است.",
        duration: 4000,
      });
    }
  }, [searchParams]);

  return null;
}
