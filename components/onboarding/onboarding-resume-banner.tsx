"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OnboardingResumeBanner() {
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.redirectTo && !data.redirectTo.includes("profile")) {
          setRedirectTo(data.redirectTo);
        } else if (data?.redirectTo === "/onboarding/profile") {
          setRedirectTo(data.redirectTo);
        }
      })
      .catch(() => {});
  }, []);

  if (!redirectTo) return null;

  const labels: Record<string, string> = {
    "/onboarding/profile": "تکمیل پروفایل راه‌اندازی",
    "/onboarding/genesis": "ادامه طرح راه‌اندازی",
    "/onboarding/reveal": "مشاهده آشکارسازی طرح",
    "/onboarding/missions": "ادامه مأموریت‌ها",
  };

  return (
    <div
      className="mb-6 rounded-xl border border-brand-primary/30 bg-brand-primary/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      role="status"
    >
      <Sparkles className="w-5 h-5 text-brand-primary shrink-0" aria-hidden />
      <div className="flex-1">
        <p className="font-bold text-sm">راه‌اندازی ناتمام</p>
        <p className="text-xs text-muted-foreground">{labels[redirectTo] ?? "ادامه فرآیند راه‌اندازی"}</p>
      </div>
      <Button asChild size="sm" className="bg-brand-primary text-white shrink-0">
        <Link href={redirectTo}>
          ادامه
          <ArrowLeft className="w-4 h-4 mr-1" />
        </Link>
      </Button>
    </div>
  );
}
