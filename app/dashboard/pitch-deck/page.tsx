"use client";

import { Presentation } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProject } from "@/contexts/project-context";
import { PitchDeckBuilder } from "@/components/features/pitch-deck/pitch-deck-builder";
import { EmptyProjectState } from "@/components/dashboard/empty-project-state";
import { Loader2 } from "lucide-react";
import { useImmersivePage } from "@/hooks/use-immersive-page";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

export default function PitchDeckPage() {
  const { activeProject: plan, loading } = useProject();
  const isMobile = useIsMobile();
  useImmersivePage(isMobile);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <EmptyProjectState
        title="برای پیچ‌دک به پروژه نیاز داری"
        description="اول یک پروژه استارتاپی بساز تا سازنده پیچ‌دک فعال شود."
      />
    );
  }

  // Project Type Guard
  if (plan.projectType !== "startup") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <Presentation size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">پیچ دک ساز استارتاپی</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های استارتاپی فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        isMobile
          ? "h-[calc(100dvh-3.5rem)]"
          : "h-[calc(100vh-4rem)]"
      )}
    >
      <PitchDeckBuilder />
    </div>
  );
}
