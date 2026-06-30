"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, ChevronUp, Sparkles, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RoadmapDailyBriefingProps {
  projectName?: string;
  projectType?: string;
  completedCount: number;
  remainingCount: number;
  currentStepTitle?: string;
  onGenerateBriefing: () => Promise<string | null>;
}

export function RoadmapDailyBriefing({
  projectName,
  projectType,
  completedCount,
  remainingCount,
  currentStepTitle,
  onGenerateBriefing,
}: RoadmapDailyBriefingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `karnex-briefing-${today}`;

    const cached = sessionStorage.getItem(cacheKey);
    // #region agent log
    fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0aaf34'},body:JSON.stringify({sessionId:'0aaf34',location:'roadmap-daily-briefing.tsx:useEffect',message:'briefing effect run',data:{hasCached:!!cached,cacheLen:cached?.length??0,isOpen},timestamp:Date.now(),hypothesisId:'E,G'})}).catch(()=>{});
    // #endregion
    if (cached) {
      setBriefing(cached);
    } else {
      setIsLoading(true);
      onGenerateBriefing()
        .then((result) => {
          // #region agent log
          fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0aaf34'},body:JSON.stringify({sessionId:'0aaf34',location:'roadmap-daily-briefing.tsx:onGenerate',message:'briefing generate done',data:{hasResult:!!result,resultLen:result?.length??0},timestamp:Date.now(),hypothesisId:'F,H'})}).catch(()=>{});
          // #endregion
          if (result) {
            sessionStorage.setItem(cacheKey, result);
            setBriefing(result);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [onGenerateBriefing]);

  if (isDismissed) return null;

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-indigo-500/5 to-violet-500/5",
        "border border-indigo-500/10 rounded-2xl overflow-hidden transition-all duration-300"
      )}
    >
      {/* Header row — always visible */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 shrink-0">
          <Brain className="w-4 h-4 text-indigo-400" />
        </div>

        <span className="flex-1 text-sm font-medium text-foreground/90 select-none">
          بینش هوشمند امروز
        </span>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? "بستن بینش" : "باز کردن بینش"}
            >
              {isOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
            onClick={() => setIsDismissed(true)}
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="briefing-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4 pt-1">
              {isLoading ? (
                /* Skeleton lines */
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-3 rounded-full bg-indigo-500/10 animate-pulse",
                        i === 3 ? "w-3/5" : "w-full"
                      )}
                    />
                  ))}
                </div>
              ) : briefing ? (
                <p className="leading-relaxed text-sm text-muted-foreground whitespace-pre-line">
                  {briefing}
                </p>
              ) : (
                <p className="leading-relaxed text-sm text-muted-foreground">
                  برای دریافت بینش هوشمندانه روی دکمه کلیک کنید
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
