"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompetitorWorkspace } from "@/components/dashboard/competitors/competitor-workspace";

function CompetitorsPageInner() {
  const { activeProject: plan } = useProject();

  if (plan && plan.projectType === "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md space-y-3">
          <h2 className="text-xl font-bold">تحلیل رقبا برای استارتاپ و کسب‌وکار سنتی</h2>
          <p className="text-sm text-muted-foreground">
            این فضای رقابتی برای پروژه‌های محتوا فعال نیست.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <CompetitorWorkspace />;
}

export default function CompetitorsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-4 space-y-4 animate-pulse">
          <div className="h-12 w-64 rounded-xl bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      }
    >
      <CompetitorsPageInner />
    </Suspense>
  );
}
