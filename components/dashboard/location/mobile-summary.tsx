"use client";

import { useLocation } from "./location-context";
import { VerdictBanner } from "./verdict-banner";
import { ExecutiveSummaryCard } from "./executive-summary-card";
import { Card } from "@/components/ui/card";
import { Monitor } from "lucide-react";

/** Mobile read-only summary per plan */
export function MobileLocationSummary() {
  const { analysis } = useLocation();
  if (!analysis) return null;

  return (
    <div className="space-y-4 dir-rtl lg:hidden">
      <Card className="p-4 border-primary/20 bg-primary/5 flex gap-3 items-start">
        <Monitor className="text-primary shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-muted-foreground leading-relaxed">
          برای آزمایشگاه مالی، نقشه پیشرفته و مقایسه کامل، از دسکتاپ استفاده کنید.
        </p>
      </Card>
      <VerdictBanner />
      <ExecutiveSummaryCard />
    </div>
  );
}
