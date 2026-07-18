"use client";

import type { ReactNode } from "react";
import { PageTourHelp } from "@/components/tour/page-tour-help";
import { PitchDeckSlide } from "@/lib/db";
import { resolveTheme, getSlideTypeLabel } from "@/lib/pitch-deck";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Edit3,
  Trash2,
  Presentation,
  Sparkles,
  Zap,
  ShieldAlert,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Layers,
  Milestone,
  Users,
  Plus,
  Play,
  Link2,
  Activity,
} from "lucide-react";

interface DeckPreviewProps {
  slides: PitchDeckSlide[];
  onEditSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onRegenerate: () => void;
  onDownload: () => void;
  onOpenWorkspace?: () => void;
  onShare?: () => void;
  onPresent?: () => void;
}

export function DeckPreview({
  slides,
  onEditSlide,
  onDeleteSlide,
  onRegenerate,
  onDownload,
  onOpenWorkspace,
  onShare,
  onPresent,
}: DeckPreviewProps) {
  const renderMiniature = (slide: PitchDeckSlide) => {
    const title = slide.title || "بدون عنوان";
    const activeTheme = resolveTheme(slide.metadata?.theme);
    const fg = activeTheme.isLight ? "#18181B" : "#e2e8f0";

    const shell = (children: ReactNode) => (
      <div
        className="flex h-full w-full flex-col justify-between border-b p-3"
        style={{
          backgroundColor: activeTheme.bg,
          borderColor: activeTheme.border,
          color: fg,
        }}
      >
        {children}
      </div>
    );

    switch (slide.type) {
      case "title":
        return shell(
          <>
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <Zap className="mb-1 h-5 w-5 animate-pulse" style={{ color: activeTheme.primary }} />
              <h4 className="w-full truncate text-[10px] font-extrabold" style={{ color: fg }}>
                {title}
              </h4>
            </div>
          </>
        );
      case "problem":
        return shell(
          <>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold text-rose-400">چالش</span>
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <h4 className="truncate text-[9px] font-bold" style={{ color: fg }}>
              {title}
            </h4>
          </>
        );
      case "solution":
        return shell(
          <>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold text-emerald-400">راهکار</span>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <h4 className="truncate text-[9px] font-bold" style={{ color: fg }}>
              {title}
            </h4>
          </>
        );
      case "market":
      case "market_size":
        return shell(
          <>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold" style={{ color: activeTheme.primary }}>
                بازار
              </span>
              <TrendingUp className="h-3.5 w-3.5" style={{ color: activeTheme.primary }} />
            </div>
            <h4 className="truncate text-[8px] opacity-70">{title}</h4>
          </>
        );
      case "business_model":
        return shell(
          <>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold" style={{ color: activeTheme.secondary }}>
                درآمدزایی
              </span>
              <DollarSign className="h-3.5 w-3.5" style={{ color: activeTheme.secondary }} />
            </div>
            <h4 className="truncate text-[8px] opacity-70">{title}</h4>
          </>
        );
      case "competition":
        return shell(
          <>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold" style={{ color: activeTheme.secondary }}>
                رقبا
              </span>
              <Layers className="h-3.5 w-3.5" style={{ color: activeTheme.secondary }} />
            </div>
            <h4 className="truncate text-[8px] opacity-70">{title}</h4>
          </>
        );
      case "roadmap":
        return shell(
          <>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold" style={{ color: activeTheme.primary }}>
                نقشه راه
              </span>
              <Milestone className="h-3.5 w-3.5" style={{ color: activeTheme.primary }} />
            </div>
            <h4 className="truncate text-[8px] opacity-70">{title}</h4>
          </>
        );
      case "team":
        return shell(
          <>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold" style={{ color: activeTheme.primary }}>
                تیم
              </span>
              <Users className="h-3.5 w-3.5" style={{ color: activeTheme.primary }} />
            </div>
            <h4 className="truncate text-[8px] opacity-70">{title}</h4>
          </>
        );
      case "traction":
        return shell(
          <>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold" style={{ color: activeTheme.primary }}>
                تراکشن
              </span>
              <Activity className="h-3.5 w-3.5" style={{ color: activeTheme.primary }} />
            </div>
            <h4 className="truncate text-[8px] opacity-70">{title}</h4>
          </>
        );
      case "ask":
        return shell(
          <>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold" style={{ color: activeTheme.primary }}>
                جذب سرمایه
              </span>
              <DollarSign className="h-3.5 w-3.5" style={{ color: activeTheme.primary }} />
            </div>
            <h4 className="truncate text-[8px] opacity-70">{title}</h4>
          </>
        );
      default:
        return shell(
          <>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold opacity-60">اسلاید</span>
              <Zap className="h-3.5 w-3.5 opacity-50" />
            </div>
            <h4 className="truncate text-[9px] font-bold" style={{ color: fg }}>
              {title}
            </h4>
          </>
        );
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 duration-500" dir="rtl">
      <div
        className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-lg backdrop-blur md:flex-row"
        data-tour-id="deck-header"
      >
        <div className="flex items-center gap-4">
          <PageTourHelp tourId="pitch-deck" />
          <div className="text-right">
            <h2 className="text-2xl font-black">داستان استارتاپ شما</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              روی هر اسلاید کلیک کنید تا وارد کارگاه ویرایش شوید.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" data-tour-id="deck-actions">
          {onPresent && (
            <Button variant="outline" onClick={onPresent} className="h-11 rounded-xl px-4">
              <Play size={16} className="ms-2" />
              ارائه
            </Button>
          )}
          {onShare && (
            <Button variant="outline" onClick={onShare} className="h-11 rounded-xl px-4">
              <Link2 size={16} className="ms-2" />
              لینک مشاهده
            </Button>
          )}
          {onOpenWorkspace && (
            <Button variant="outline" onClick={onOpenWorkspace} className="h-11 rounded-xl px-4">
              <Edit3 size={16} className="ms-2" />
              کارگاه ویرایش
            </Button>
          )}
          <Button variant="outline" onClick={onRegenerate} className="h-11 rounded-xl px-4">
            <Sparkles size={16} className="ms-2 animate-pulse text-primary" />
            تولید مجدد
          </Button>
          <Button
            onClick={onDownload}
            className="h-11 rounded-xl bg-gradient-to-l from-primary to-orange-500 px-5 font-bold text-white shadow-lg shadow-primary/15"
          >
            <Presentation size={16} className="ms-2" />
            دانلود PPTX
          </Button>
        </div>
      </div>

      <div
        className="grid grid-cols-1 gap-5 pb-20 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        data-tour-id="deck-grid"
      >
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onEditSlide(index)}
            className={`group relative aspect-[1.777] cursor-pointer overflow-hidden rounded-xl border shadow-md transition-all ${
              slide.isHidden
                ? "border-dashed border-border opacity-40 hover:opacity-75"
                : "border-border/60 hover:border-primary/50 hover:shadow-primary/10"
            }`}
          >
            {renderMiniature(slide)}
            <div className="absolute bottom-0 left-0 flex w-full items-center justify-between border-t border-border/40 bg-background/90 p-2 text-[10px] backdrop-blur-sm">
              <span className="max-w-[120px] truncate font-bold text-muted-foreground">
                {getSlideTypeLabel(slide.type)}
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground">
                {index + 1}
              </span>
            </div>
            <div className="absolute inset-0 hidden flex-col items-center justify-center gap-2 bg-background/85 transition-all group-hover:flex animate-in fade-in duration-200">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 rounded-lg bg-primary font-bold text-primary-foreground hover:brightness-110"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSlide(index);
                }}
              >
                <Edit3 size={12} className="ms-1.5" />
                ویرایش اسلاید
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 w-7 rounded-lg p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSlide(index);
                }}
              >
                <Trash2 size={12} />
              </Button>
            </div>
          </motion.div>
        ))}

        <button
          type="button"
          className="group flex aspect-[1.777] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          data-tour-id="add-slide-btn"
          onClick={() => onEditSlide(-1)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card transition-colors group-hover:bg-primary/10">
            <Plus size={18} />
          </div>
          <span className="text-xs font-bold">افزودن اسلاید جدید</span>
        </button>
      </div>
    </div>
  );
}
