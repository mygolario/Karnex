"use client";

import { useState } from "react";
import { Sparkles, Loader2, Languages, Maximize2, Minimize2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PitchDeckSlide } from "@/lib/db";

interface PitchDeckAiSidebarProps {
  slide: PitchDeckSlide | undefined;
  onApplyText: (text: string) => void;
  className?: string;
}

export function PitchDeckAiSidebar({ slide, onApplyText, className }: PitchDeckAiSidebarProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [scorecard, setScorecard] = useState<{ score?: number; tips?: string[]; summary?: string } | null>(null);

  const slideContent = slide
    ? `${slide.title}\n${(slide.bullets ?? []).join("\n")}`
    : "";

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
    { id: "rewrite", label: "بازنویسی حرفه‌ای", icon: Sparkles },
    { id: "lengthen", label: "طولانی‌تر", icon: Maximize2 },
    { id: "shorten", label: "کوتاه‌تر", icon: Minimize2 },
    { id: "translate_fa", label: "ترجمه فارسی", icon: Languages },
    { id: "translate_en", label: "Translate EN", icon: Languages },
  ];

  return (
    <div className={cn("flex flex-col gap-3 p-4 border-s border-border/50 bg-background/80 backdrop-blur-xl", className)}>
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-purple-500" />
        <h3 className="text-sm font-bold">دستیار هوش مصنوعی</h3>
      </div>

      <div className="space-y-1.5">
        {actions.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs h-8"
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
        className="w-full justify-start text-xs h-8 border-dashed"
        disabled={!slide || loading !== null}
        onClick={() => runAction("scorecard")}
      >
        {loading === "scorecard" ? <Loader2 size={12} className="animate-spin" /> : <BarChart3 size={12} />}
        امتیاز آمادگی سرمایه‌گذار
      </Button>

      {scorecard && (
        <div className="p-3 rounded-xl bg-muted/50 border border-border/50 space-y-2">
          {scorecard.score !== undefined && (
            <p className="text-lg font-black text-primary">{scorecard.score}/100</p>
          )}
          {scorecard.summary && <p className="text-xs text-muted-foreground">{scorecard.summary}</p>}
          {scorecard.tips?.map((tip, i) => (
            <p key={i} className="text-[11px] text-muted-foreground">• {tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}
