"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, MapPin, Trash2, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLocation } from "./location-context";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";
import type { LocationAnalysis } from "@/lib/db";

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function HistorySidebarContent({ onClose }: { onClose: () => void }) {
  const {
    history,
    analysis,
    loadFromHistory,
    addToComparison,
    deleteFromHistory,
    comparisonMode,
    comparisonItems,
  } = useLocation();

  const renderItem = (item: LocationAnalysis) => {
    const isActive = analysis?.createdAt === item.createdAt;
    const inComparison = comparisonItems.some((c) => c.createdAt === item.createdAt);

    return (
      <Card
        key={item.createdAt}
        className={cn(
          "p-3 cursor-pointer transition-all hover:border-primary/30",
          isActive && "border-primary/50 bg-primary/5",
          inComparison && "ring-1 ring-primary/30"
        )}
        onClick={() => {
          loadFromHistory(item);
          onClose();
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={12} className="text-primary shrink-0" />
              <span className="text-xs font-bold truncate">{item.address || item.city}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{formatDate(item.createdAt)}</p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {item.score != null && (
                <Badge variant="secondary" className="text-[10px]">
                  امتیاز: {item.score}
                </Badge>
              )}
              {item.verdict?.decision && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] font-bold px-1.5",
                    item.verdict.decision === "go" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    item.verdict.decision === "caution" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                    item.verdict.decision === "no-go" && "bg-rose-500/10 text-rose-400 border-rose-500/20",
                  )}
                >
                  {item.verdict.decision === "go" ? "✓ برو" : item.verdict.decision === "caution" ? "⚠ احتیاط" : "✕ نرو"}
                </Badge>
              )}
              {item.businessCategory && (
                <span className="text-[9px] bg-violet-500/10 border border-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded-full">
                  {item.businessCategory}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {comparisonMode && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  addToComparison(item);
                }}
              >
                <GitCompare size={13} className={inComparison ? "text-primary" : ""} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive/70"
              onClick={(e) => {
                e.stopPropagation();
                void deleteFromHistory(item.createdAt);
              }}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={16} className="text-primary" />
            <h3 className="font-bold text-sm">تاریخچه تحلیل‌ها</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7 px-2 text-muted-foreground">
            بستن
          </Button>
        </div>
        {history.length > 0 && (
          <p className="text-[10px] text-muted-foreground mt-1">{history.length} تحلیل ذخیره شده</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <History size={32} className="mx-auto mb-3 opacity-30" />
            <p>هنوز تحلیلی ذخیره نشده</p>
          </div>
        ) : (
          history.map(renderItem)
        )}
      </div>
    </>
  );
}

export function HistorySidebar({ isOpen, onClose }: HistorySidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[75dvh] p-0 rounded-t-2xl flex flex-col">
          <HistorySidebarContent onClose={onClose} />
        </SheetContent>
      </Sheet>
    );
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 60 }}
        className="w-[300px] shrink-0 h-full border-r border-border bg-card/30 backdrop-blur-xl overflow-hidden flex flex-col"
      >
        <HistorySidebarContent onClose={onClose} />
      </motion.div>
    </AnimatePresence>
  );
}
