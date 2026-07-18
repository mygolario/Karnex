"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Minimize2,
  BarChart3,
  Wand2,
  ListPlus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PitchDeckSlide } from "@/lib/db";
import { CompletenessPanel } from "./completeness-panel";
import type { CompletenessItem } from "@/lib/pitch-deck";

export type PitchSlideAiMode =
  | "rewrite"
  | "shorten"
  | "strengthen"
  | "suggest_bullets"
  | "scorecard"
  | "regenerate_slide";

export interface StructuredSlidePatch {
  title?: string;
  bullets?: string[];
  notes?: string;
  metadata?: Record<string, unknown>;
}

interface PitchDeckAiSidebarProps {
  slide: PitchDeckSlide | undefined;
  completeness: CompletenessItem[];
  onApplyPatch: (patch: StructuredSlidePatch) => void;
  onJumpCompleteness: (index: number) => void;
  onRegenerateSlide: () => void;
  regenerating?: boolean;
  className?: string;
}

export function PitchDeckAiSidebar({
  slide,
  completeness,
  onApplyPatch,
  onJumpCompleteness,
  onRegenerateSlide,
  regenerating,
  className,
}: PitchDeckAiSidebarProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [preview, setPreview] = useState<StructuredSlidePatch | null>(null);
  const [scorecard, setScorecard] = useState<{
    score?: number;
    tips?: string[];
    summary?: string;
  } | null>(null);

  const runAction = async (mode: PitchSlideAiMode) => {
    if (!slide) return;
    setLoading(mode);
    setPreview(null);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pitch-slide-ai",
          slideContent: JSON.stringify({
            type: slide.type,
            title: slide.title,
            bullets: slide.bullets,
            notes: slide.notes,
            metadata: slide.metadata,
          }),
          mode,
          slideType: slide.type,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        if (mode === "scorecard") {
          setScorecard(data.result);
        } else {
          const patch: StructuredSlidePatch = {
            title: data.result.title,
            bullets: data.result.bullets,
            notes: data.result.notes,
            metadata: data.result.metadata,
          };
          // Fallback for legacy { text } responses
          if (!patch.title && !patch.bullets && data.result.text) {
            const lines = String(data.result.text).split("\n").filter(Boolean);
            patch.title = lines[0];
            patch.bullets = lines.slice(1);
          }
          setPreview(patch);
        }
      }
    } finally {
      setLoading(null);
    }
  };

  const actions: { id: PitchSlideAiMode; label: string; icon: typeof Sparkles }[] = [
    { id: "rewrite", label: "بازنویسی سرمایه‌گذارپسند", icon: Wand2 },
    { id: "strengthen", label: "قوی‌تر کردن پیام", icon: Sparkles },
    { id: "shorten", label: "کوتاه‌تر", icon: Minimize2 },
    { id: "suggest_bullets", label: "پیشنهاد بولت", icon: ListPlus },
  ];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-s border-border/50 bg-card/80 p-4 backdrop-blur-xl",
        className
      )}
      dir="rtl"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-primary" />
        <h3 className="text-sm font-bold">دستیار هوش مصنوعی</h3>
      </div>

      <div className="space-y-1.5">
        {actions.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="outline"
            size="sm"
            className="h-8 w-full justify-start text-xs"
            disabled={!slide || loading !== null}
            onClick={() => runAction(id)}
          >
            {loading === id ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Icon size={12} />
            )}
            {label}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-8 w-full justify-start border-dashed text-xs"
        disabled={!slide || loading !== null}
        onClick={() => runAction("scorecard")}
      >
        {loading === "scorecard" ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <BarChart3 size={12} />
        )}
        امتیاز آمادگی سرمایه‌گذار
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 w-full justify-start text-xs"
        disabled={!slide || regenerating || loading !== null}
        onClick={onRegenerateSlide}
      >
        {regenerating ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <RefreshCw size={12} />
        )}
        بازتولید این اسلاید
      </Button>

      {preview && (
        <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="text-[10px] font-bold text-primary">پیش‌نمایش تغییر</p>
          {preview.title && (
            <p className="text-xs font-bold">{preview.title}</p>
          )}
          {preview.bullets && preview.bullets.length > 0 && (
            <ul className="list-inside list-disc space-y-0.5 text-[11px] text-muted-foreground">
              {preview.bullets.slice(0, 5).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="h-7 flex-1 text-[11px]"
              onClick={() => {
                onApplyPatch(preview);
                setPreview(null);
              }}
            >
              اعمال
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[11px]"
              onClick={() => setPreview(null)}
            >
              رد
            </Button>
          </div>
        </div>
      )}

      {scorecard && (
        <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs">
          <div className="mb-1 font-bold text-primary">
            امتیاز: {scorecard.score ?? "—"}/۱۰۰
          </div>
          {scorecard.summary && (
            <p className="mb-2 text-muted-foreground">{scorecard.summary}</p>
          )}
          {scorecard.tips && (
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              {scorecard.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <CompletenessPanel items={completeness} onJump={onJumpCompleteness} />
    </div>
  );
}
