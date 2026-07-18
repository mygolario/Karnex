"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { ProjectType } from "@/lib/account/types";
import { PillarBadge } from "./ai-output-shell";

const STARTER_PROMPTS: Record<ProjectType, string[]> = {
  startup: [
    "ایده من را اعتبارسنجی کن",
    "یک اسلاید پیچ‌دک پیشنهاد بده",
    "رقبای اصلی را تحلیل کن",
  ],
  traditional: [
    "این مکان برای کافه من مناسب است؟",
    "مجوزهای لازم را لیست کن",
    "SWOT محلی بنویس",
  ],
  creator: [
    "۳ ایده وایرال برای این هفته",
    "اسکریپت ریلز ۶۰ ثانیه‌ای بنویس",
    "تقویم محتوای ۲ هفته‌ای بساز",
  ],
};

export function AIEmptyState({
  pillar = "startup",
  title,
  description,
  onStarterClick,
  previewLabel,
}: {
  pillar?: ProjectType | string;
  title: string;
  description: string;
  onStarterClick?: (prompt: string) => void;
  previewLabel?: string;
}) {
  const p = (pillar || "startup") as ProjectType;
  const starters = STARTER_PROMPTS[p] || STARTER_PROMPTS.startup;

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-dashed bg-muted/20">
      <div className="ai-orb flex h-14 w-14 items-center justify-center rounded-2xl mb-4">
        <Sparkles className="h-7 w-7 text-white" />
      </div>
      <PillarBadge pillar={p} className="mb-3" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {previewLabel && (
        <p className="text-xs text-muted-foreground/80 mb-4 italic">
          {previewLabel}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {starters.map((s) => (
          <Button
            key={s}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onStarterClick?.(s)}
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}
