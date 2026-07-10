"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Play,
  Share2,
  Download,
  Sparkles,
  Pencil,
  History,
  FileText,
  RefreshCw,
} from "lucide-react";
import type { PitchDeckV2 } from "@/lib/pitch-deck/types";
import { cn } from "@/lib/utils";

interface DeckHubProps {
  deck: PitchDeckV2;
  projectName: string;
  onContinue: () => void;
  onPresent: () => void;
  onShare: () => void;
  onExportPptx: () => void;
  onExportPdf: () => void;
  onImprove: () => void;
  onRegenerate: () => void;
  onVersions: () => void;
  onScripts: () => void;
  downloading?: boolean;
}

export function DeckHub({
  deck,
  projectName,
  onContinue,
  onPresent,
  onShare,
  onExportPptx,
  onExportPdf,
  onImprove,
  onRegenerate,
  onVersions,
  onScripts,
  downloading,
}: DeckHubProps) {
  const score = deck.readiness?.score ?? 0;
  const tips = deck.readiness?.tips || [];
  const slideCount = deck.slides.filter((s) => !s.isHidden).length;
  const lastVersion = deck.versions?.[0];

  return (
    <div className="h-full relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-pink-50/80 via-background to-orange-50/60 dark:from-pink-950/20 dark:via-background dark:to-orange-950/10">
      <div className="absolute -top-24 -end-24 w-80 h-80 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -start-24 w-80 h-80 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col justify-center p-8 md:p-12 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-bold text-primary mb-3 tracking-wide"
        >
          کارنکس · پیچ‌دک سرمایه‌گذاری
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl md:text-5xl font-black mb-3 bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent"
        >
          {projectName || "پیچ‌دک شما"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mb-8 max-w-xl mx-auto"
        >
          داستان جذب سرمایه شما — {slideCount} اسلاید
          {lastVersion ? ` · آخرین نسخه: ${lastVersion.label}` : ""}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8 mx-auto"
        >
          <div className="relative w-36 h-36 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#karnexGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - score / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="karnexGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black">{score}</span>
              <span className="text-[10px] text-muted-foreground">آمادگی</span>
            </div>
          </div>
          {tips[0] && (
            <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{tips[0]}</p>
          )}
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Button
            size="lg"
            onClick={onContinue}
            className="rounded-2xl bg-gradient-to-l from-primary to-secondary text-white border-0 px-8"
            data-tour="deck-header"
          >
            <Pencil size={16} />
            ادامه ویرایش
          </Button>
          <Button size="lg" variant="outline" onClick={onPresent} className="rounded-2xl">
            <Play size={16} />
            ارائه
          </Button>
          <Button size="lg" variant="outline" onClick={onShare} className="rounded-2xl">
            <Share2 size={16} />
            اشتراک
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2" data-tour="deck-actions">
          <Button variant="ghost" size="sm" onClick={onExportPptx} disabled={downloading} className="rounded-xl">
            <Download size={14} />
            PPTX
          </Button>
          <Button variant="ghost" size="sm" onClick={onExportPdf} className="rounded-xl">
            <FileText size={14} />
            PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={onScripts} className="rounded-xl">
            <Sparkles size={14} />
            اسکریپت ارائه
          </Button>
          <Button variant="ghost" size="sm" onClick={onImprove} className="rounded-xl">
            <Sparkles size={14} />
            بهبود با AI
          </Button>
          <Button variant="ghost" size="sm" onClick={onVersions} className="rounded-xl">
            <History size={14} />
            نسخه‌ها
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            className={cn("rounded-xl text-secondary")}
          >
            <RefreshCw size={14} />
            تولید مجدد
          </Button>
        </div>
      </div>
    </div>
  );
}
