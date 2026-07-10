"use client";

import { useState } from "react";
import { Sparkles, Loader2, Languages, Maximize2, Minimize2, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PitchDeckSlide, PitchDeckV2 } from "@/lib/pitch-deck/types";
import { getSlideBullets } from "@/lib/pitch-deck/migrate";
import { perSlideTips } from "@/lib/pitch-deck/readiness";

interface InvestorCoachProps {
  slide: PitchDeckSlide | undefined;
  deck: PitchDeckV2;
  onApplyText: (text: string) => void;
  className?: string;
}

export function InvestorCoach({ slide, deck, onApplyText, className }: InvestorCoachProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [scorecard, setScorecard] = useState<{ score?: number; tips?: string[]; summary?: string } | null>(null);

  const slideContent = slide
    ? `${slide.title}\n${getSlideBullets(slide).join("\n")}`
    : "";

  const gentleTips = slide ? perSlideTips(slide) : [];
  const deckTips = deck.readiness?.tips || [];

  const runAction = async (mode: string) => {
    if (!slideContent.trim()) return;
    setLoading(mode);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pitch-slide-ai", slideContent, mode }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        if (mode === "scorecard") {
          setScorecard(data.result);
        } else if (data.result.text) {
          onApplyText(data.result.text);
        }
      }
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    { id: "rewrite", label: "بازنویسی سرمایه‌گذارپسند", icon: Sparkles },
    { id: "lengthen", label: "تقویت شواهد", icon: Maximize2 },
    { id: "shorten", label: "کوتاه برای ارائه ۳ دقیقه‌ای", icon: Minimize2 },
    { id: "translate_fa", label: "صیقل فارسی", icon: Languages },
  ];

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-4 border-s border-border/50 bg-background/90 backdrop-blur-xl overflow-y-auto",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[hsl(var(--ai-muted))] flex items-center justify-center">
          <Shield size={14} className="text-[hsl(var(--ai))]" />
        </div>
        <div>
          <h3 className="text-sm font-bold">مربی سرمایه‌گذار</h3>
          <p className="text-[10px] text-muted-foreground">نکات ملایم · بدون مسدود کردن خروجی</p>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold">آمادگی کل دک</span>
          <span className="font-black text-primary">{deck.readiness?.score ?? 0}</span>
        </div>
        {deckTips.slice(0, 2).map((t, i) => (
          <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">
            • {t}
          </p>
        ))}
      </div>

      {gentleTips.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-secondary">نکات این اسلاید</p>
          {gentleTips.map((t, i) => (
            <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">
              • {t}
            </p>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-xs font-bold">اقدامات AI</p>
        {actions.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs h-8 rounded-xl"
            disabled={!slide || loading !== null}
            onClick={() => runAction(id)}
          >
            {loading === id ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
            {label}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start text-xs h-8 border-dashed rounded-xl"
        disabled={!slide || loading !== null}
        onClick={() => runAction("scorecard")}
      >
        {loading === "scorecard" ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <BarChart3 size={12} />
        )}
        امتیاز آمادگی این اسلاید
      </Button>

      {scorecard && (
        <div className="rounded-2xl border border-[hsl(var(--ai-border))] bg-[hsl(var(--ai-muted))] p-3 space-y-2">
          <p className="text-sm font-black text-[hsl(var(--ai))]">امتیاز: {scorecard.score ?? "—"}</p>
          {scorecard.summary && (
            <p className="text-[11px] text-muted-foreground">{scorecard.summary}</p>
          )}
          {(scorecard.tips || []).slice(0, 3).map((t, i) => (
            <p key={i} className="text-[11px]">
              • {t}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/** @deprecated use InvestorCoach */
export const PitchDeckAiSidebar = InvestorCoach;
