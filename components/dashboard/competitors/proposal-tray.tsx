"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/utils";
import type { CompetitorIntelItem } from "@/lib/competitors/types";

type Props = {
  proposed: CompetitorIntelItem[];
  canUndo: boolean;
  onAcceptAll: () => void;
  onDismissAll: () => void;
  onDismissOne: (id: string) => void;
  onAcceptOne: (item: CompetitorIntelItem) => void;
  onUndo: () => void;
};

export function ProposalTray({
  proposed,
  canUndo,
  onAcceptAll,
  onDismissAll,
  onDismissOne,
  onAcceptOne,
  onUndo,
}: Props) {
  return (
    <AnimatePresence>
      {(proposed.length > 0 || canUndo) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-2"
        >
          {canUndo && proposed.length === 0 && (
            <div className="flex justify-end">
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={onUndo}>
                <Undo2 className="w-3.5 h-3.5" />
                برگرداندن آخرین پذیرش
              </Button>
            </div>
          )}

          {proposed.length > 0 && (
            <Card className="p-4 border-primary/30 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="font-semibold text-sm">پیشنهادهای بازتحلیل</h3>
                  <p className="text-xs text-muted-foreground">
                    ویرایش‌های دستی حفظ می‌شوند — موارد را بپذیر یا رد کن.
                  </p>
                </div>
                <div className="flex gap-2">
                  {canUndo && (
                    <Button size="sm" variant="ghost" className="gap-1" onClick={onUndo}>
                      <Undo2 className="w-3.5 h-3.5" />
                      Undo
                    </Button>
                  )}
                  <Button size="sm" onClick={onAcceptAll}>
                    پذیرش همه ({toPersianDigits(String(proposed.length))})
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onDismissAll}>
                    رد همه
                  </Button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {proposed.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border bg-background p-3 text-sm flex justify-between gap-2"
                  >
                    <button
                      type="button"
                      className="min-w-0 text-start"
                      onClick={() => onAcceptOne(p)}
                    >
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {p.tagline || p.strength}
                      </p>
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-8 w-8"
                      onClick={() => onDismissOne(p.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
