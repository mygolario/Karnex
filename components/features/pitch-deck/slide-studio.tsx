"use client";

import { useState } from "react";
import { SlideVisualizer } from "./slide-templates";
import { InvestorCoach } from "./ai-sidebar";
import type { PitchDeckSlide, PitchDeckV2, PitchDeckThemeId } from "@/lib/pitch-deck/types";
import { SLIDE_INTENT } from "@/lib/pitch-deck/types";
import { THEME_OPTIONS } from "@/lib/pitch-deck/themes";
import { getSlideBullets } from "@/lib/pitch-deck/migrate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Save,
  Trash2,
  Play,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";

type StudioTab = "content" | "design" | "coach";
type MobilePanel = "slides" | "editor" | "preview";

interface SlideStudioProps {
  deck: PitchDeckV2;
  projectName: string;
  currentIndex: number;
  onIndexChange: (i: number) => void;
  onChangeSlides: (slides: PitchDeckSlide[]) => void;
  onSave: () => void;
  onPresent: () => void;
  onBackStoryboard: () => void;
  saving?: boolean;
}

export function SlideStudio({
  deck,
  projectName,
  currentIndex,
  onIndexChange,
  onChangeSlides,
  onSave,
  onPresent,
  onBackStoryboard,
  saving,
}: SlideStudioProps) {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<StudioTab>("content");
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("editor");
  const slides = deck.slides;
  const slide = slides[currentIndex];

  const updateSlide = (patch: Partial<PitchDeckSlide>, overrideKeys: string[] = []) => {
    if (!slide) return;
    const next = slides.map((s, i) => {
      if (i !== currentIndex) return s;
      const userOverrides = Array.from(
        new Set([...(s.userOverrides || []), ...overrideKeys])
      );
      const merged = { ...s, ...patch, userOverrides };
      if (patch.bullets) {
        merged.blocks = [
          { id: `blk-${s.id}`, type: "bullets", items: patch.bullets },
        ];
      }
      return merged;
    });
    onChangeSlides(next);
  };

  const moveSlide = (dir: -1 | 1) => {
    const to = currentIndex + dir;
    if (to < 0 || to >= slides.length) return;
    const next = [...slides];
    const [item] = next.splice(currentIndex, 1);
    next.splice(to, 0, item);
    onChangeSlides(next);
    onIndexChange(to);
  };

  const duplicateSlide = () => {
    if (!slide) return;
    const copy = {
      ...slide,
      id: `slide-${Date.now()}`,
      title: `${slide.title} (کپی)`,
      metadata: { ...slide.metadata },
    };
    const next = [...slides];
    next.splice(currentIndex + 1, 0, copy);
    onChangeSlides(next);
    onIndexChange(currentIndex + 1);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, i) => i !== currentIndex);
    onChangeSlides(next);
    onIndexChange(Math.max(0, currentIndex - 1));
  };

  const applyTheme = (theme: PitchDeckThemeId, all = false) => {
    if (all) {
      onChangeSlides(
        slides.map((s) => ({
          ...s,
          theme,
          metadata: { ...s.metadata, theme },
        }))
      );
    } else {
      updateSlide({ theme, metadata: { ...slide?.metadata, theme } });
    }
  };

  const applyAiText = (text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.replace(/^[-•*\d.\s]+/, "").trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    if (lines.length === 1 && slide) {
      updateSlide({ title: lines[0] }, ["title"]);
    } else {
      updateSlide({ bullets: lines }, ["bullets"]);
    }
  };

  const nav = (
    <div className="flex flex-col gap-1 p-3 overflow-y-auto h-full border-e border-border/50 bg-muted/20">
      <p className="text-[10px] font-bold text-muted-foreground mb-2 px-1">اسلایدها</p>
      {slides.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => {
            onIndexChange(i);
            setMobilePanel("editor");
          }}
          className={cn(
            "text-start rounded-xl px-3 py-2 text-xs transition-all border",
            i === currentIndex
              ? "border-primary bg-primary/10 text-primary"
              : "border-transparent hover:bg-muted/60"
          )}
        >
          <span className="block font-bold truncate">{s.title || "بدون عنوان"}</span>
          <span className="text-[10px] opacity-70">
            {s.intent || SLIDE_INTENT[s.type] || s.type}
            {s.isHidden ? " · مخفی" : ""}
          </span>
        </button>
      ))}
    </div>
  );

  const editor = slide && (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
        {(
          [
            ["content", "محتوا"],
            ["design", "طراحی"],
            ["coach", "مربی"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              tab === id ? "bg-background shadow text-primary" : "text-muted-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "content" && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold mb-1 block">عنوان</label>
            <Input
              value={slide.title}
              onChange={(e) => updateSlide({ title: e.target.value }, ["title"])}
              className="rounded-xl"
              dir="rtl"
            />
          </div>
          <div>
            <label className="text-xs font-bold mb-1 block">نوع اسلاید</label>
            <select
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
              value={slide.type}
              onChange={(e) => updateSlide({ type: e.target.value, intent: SLIDE_INTENT[e.target.value] })}
            >
              {Object.entries(SLIDE_INTENT).map(([k, v]) => (
                <option key={k} value={k}>
                  {v} ({k})
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold">نکات کلیدی</label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() =>
                  updateSlide({ bullets: [...getSlideBullets(slide), ""] }, ["bullets"])
                }
              >
                <Plus size={12} /> افزودن
              </Button>
            </div>
            <div className="space-y-2">
              {getSlideBullets(slide).map((b, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={b}
                    onChange={(e) => {
                      const bullets = [...getSlideBullets(slide)];
                      bullets[i] = e.target.value;
                      updateSlide({ bullets }, ["bullets"]);
                    }}
                    className="rounded-xl"
                    dir="rtl"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => {
                      const bullets = getSlideBullets(slide).filter((_, j) => j !== i);
                      updateSlide({ bullets }, ["bullets"]);
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Type-specific metadata */}
          {slide.type === "market" && (
            <div className="grid grid-cols-3 gap-2">
              {(["tam", "sam", "som"] as const).map((k) => (
                <div key={k}>
                  <label className="text-[10px] font-bold uppercase">{k}</label>
                  <Input
                    value={slide.metadata?.[k] || ""}
                    onChange={(e) =>
                      updateSlide(
                        { metadata: { ...slide.metadata, [k]: e.target.value } },
                        [k]
                      )
                    }
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {slide.type === "ask" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold">مبلغ Ask</label>
                <Input
                  value={slide.metadata?.amount || ""}
                  onChange={(e) =>
                    updateSlide(
                      { metadata: { ...slide.metadata, amount: e.target.value } },
                      ["amount"]
                    )
                  }
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold">Runway</label>
                <Input
                  value={slide.metadata?.runway || ""}
                  onChange={(e) =>
                    updateSlide(
                      { metadata: { ...slide.metadata, runway: e.target.value } },
                      ["runway"]
                    )
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
          )}

          {slide.type === "competition" && (
            <div>
              <label className="text-xs font-bold mb-1 block">چیدمان رقابت</label>
              <select
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
                value={slide.metadata?.competitionLayout || "matrix"}
                onChange={(e) =>
                  updateSlide({
                    metadata: { ...slide.metadata, competitionLayout: e.target.value },
                  })
                }
              >
                <option value="matrix">ماتریس کارت</option>
                <option value="table">جدول مقایسه</option>
                <option value="swot">SWOT</option>
              </select>
            </div>
          )}

          {slide.type === "product" && (
            <div>
              <label className="text-xs font-bold">آدرس تصویر محصول</label>
              <Input
                value={slide.metadata?.imageUrl || ""}
                onChange={(e) =>
                  updateSlide(
                    { metadata: { ...slide.metadata, imageUrl: e.target.value } },
                    ["imageUrl"]
                  )
                }
                placeholder="https://..."
                className="rounded-xl"
                dir="ltr"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold mb-1 block">یادداشت سخنران</label>
            <Textarea
              value={slide.notes || ""}
              onChange={(e) => updateSlide({ notes: e.target.value })}
              className="rounded-xl min-h-[80px]"
              placeholder="نکاتی که فقط شما در ارائه می‌بینید..."
              dir="rtl"
            />
          </div>

          {(slide.sources || []).length > 0 && (
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
              <p className="text-[10px] font-bold text-primary mb-1">به‌روز از پروژه</p>
              {(slide.sources || []).slice(0, 4).map((s, i) => (
                <p key={i} className="text-[10px] text-muted-foreground">
                  {s.field} ← {s.path}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "design" && (
        <div className="space-y-4">
          <p className="text-xs font-bold">تم کارنکس</p>
          <div className="grid grid-cols-2 gap-2">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTheme(t.id as PitchDeckThemeId)}
                className={cn(
                  "rounded-2xl border p-3 text-start transition-all",
                  (slide.theme || slide.metadata?.theme) === t.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border/60"
                )}
                style={{ background: t.bg }}
              >
                <span className="text-xs font-bold" style={{ color: t.text }}>
                  {t.label}
                </span>
                <div className="flex gap-1 mt-2">
                  <span className="w-4 h-4 rounded-full" style={{ background: t.primary }} />
                  <span className="w-4 h-4 rounded-full" style={{ background: t.secondary }} />
                </div>
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl"
            onClick={() =>
              applyTheme(
                (slide.theme || slide.metadata?.theme || "karnex_light") as PitchDeckThemeId,
                true
              )
            }
          >
            اعمال تم فعلی به همه اسلایدها
          </Button>
        </div>
      )}

      {tab === "coach" && (
        <InvestorCoach
          slide={slide}
          deck={deck}
          onApplyText={applyAiText}
          className="border-0 p-0 bg-transparent"
        />
      )}
    </div>
  );

  const preview = slide && (
    <div className="flex items-center justify-center p-4 h-full bg-muted/30">
      <div className="w-full max-w-3xl aspect-[16/9] rounded-2xl overflow-hidden shadow-xl border border-border/40">
        <SlideVisualizer
          slide={slide}
          index={currentIndex}
          total={slides.length}
          projectName={projectName}
        />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col rounded-3xl border border-border/50 overflow-hidden bg-background">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBackStoryboard} className="rounded-xl">
            <LayoutGrid size={14} />
            استوری‌بورد
          </Button>
          <span className="text-xs text-muted-foreground hidden md:inline">
            {slide?.intent || slide?.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => moveSlide(-1)} disabled={currentIndex === 0}>
            <ChevronUp size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => moveSlide(1)}
            disabled={currentIndex >= slides.length - 1}
          >
            <ChevronDown size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={duplicateSlide}>
            <Copy size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => updateSlide({ isHidden: !slide?.isHidden })}
          >
            {slide?.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
          </Button>
          <Button variant="ghost" size="icon" onClick={deleteSlide} disabled={slides.length <= 1}>
            <Trash2 size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={onPresent} className="rounded-xl">
            <Play size={14} />
            ارائه
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={saving}
            className="rounded-xl bg-gradient-to-l from-primary to-secondary text-white border-0"
          >
            <Save size={14} />
            ذخیره
          </Button>
        </div>
      </div>

      {isMobile ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex gap-1 p-2 border-b">
            {(
              [
                ["slides", "اسلایدها"],
                ["editor", "ویرایش"],
                ["preview", "پیش‌نمایش"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMobilePanel(id)}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg",
                  mobilePanel === id ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            {mobilePanel === "slides" && nav}
            {mobilePanel === "editor" && editor}
            {mobilePanel === "preview" && preview}
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-12 min-h-0">
          <div className="col-span-2 min-h-0 overflow-hidden">{nav}</div>
          <div className="col-span-4 min-h-0 overflow-hidden border-e border-border/40">
            {editor}
          </div>
          <div className="col-span-6 min-h-0 overflow-hidden">{preview}</div>
        </div>
      )}
    </div>
  );
}
