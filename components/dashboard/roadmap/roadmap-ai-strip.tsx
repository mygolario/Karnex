"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, X, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AskCopilotButton } from "@/components/copilot/ask-copilot-button";
import { PageTourHelp } from "@/components/tour/page-tour-help";

const DISMISS_PREFIX = "karnex-briefing-dismissed-";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDismissKey(day = todayKey()) {
  return `${DISMISS_PREFIX}${day}`;
}

export interface RoadmapAiStripAskContext {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  data?: unknown;
  icon?: string;
}

interface RoadmapAiStripProps {
  insight: string | null;
  isLoading: boolean;
  onRetry: () => Promise<string | null>;
  askPrompt: string;
  askContexts: RoadmapAiStripAskContext[];
  className?: string;
}

export function RoadmapAiStrip({
  insight,
  isLoading,
  onRetry,
  askPrompt,
  askContexts,
  className,
}: RoadmapAiStripProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsDismissed(sessionStorage.getItem(getDismissKey()) === "1");
  }, []);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(getDismissKey(), "1");
    }
    setIsDismissed(true);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  if (isDismissed) return null;

  const showSkeleton = isLoading || isRetrying;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-ai/20 bg-ai/5 overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ai/10 text-ai">
            {showSkeleton ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                بینش هوشمند امروز
              </span>
              <PageTourHelp tourId="roadmap" size="icon-sm" />
            </div>

            {showSkeleton ? (
              <div className="space-y-2 pt-0.5">
                <div className="h-3 w-full animate-pulse rounded-full bg-ai/10" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-ai/10" />
                <div className="h-3 w-3/5 animate-pulse rounded-full bg-ai/10" />
              </div>
            ) : insight ? (
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {insight}
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <p className="text-sm text-muted-foreground">
                  دریافت بینش امروز ممکن نشد.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-ai hover:bg-ai/10 hover:text-ai"
                  onClick={handleRetry}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  تلاش مجدد
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:pt-0.5">
          <AskCopilotButton
            prompt={askPrompt}
            contexts={askContexts}
            label="بپرس از دستیار"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
            onClick={handleDismiss}
            aria-label="بستن بینش امروز"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
