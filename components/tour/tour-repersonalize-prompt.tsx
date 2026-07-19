"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTourStore } from "@/lib/tour/store";
import { tourI18n } from "@/lib/tour/i18n";
import {
  trackRepersonalizationAccepted,
  trackRepersonalizationDismissed,
} from "@/lib/tour/analytics";

/**
 * Opt-in prompt shown when the user's project type or subscription plan changes
 * meaningfully. Never silently re-personalizes — always asks first.
 */
export function TourRepersonalizePrompt() {
  const { repersonalizePrompt, acceptRepersonalize, dismissRepersonalize } = useTourStore();

  return (
    <AnimatePresence>
      {repersonalizePrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-[var(--mobile-bottom-nav-offset)] md:bottom-6 end-3 start-3 sm:start-auto z-[9500] w-auto sm:w-[320px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-primary/30 bg-card shadow-2xl p-4 md:end-6"
          dir="rtl"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground mb-1">
                {repersonalizePrompt.kind === "projectType"
                  ? tourI18n.repersonalizeProjectTypeTitle
                  : tourI18n.repersonalizePlanTitle}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {tourI18n.repersonalizeBody}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="gradient"
                  className="h-8 text-xs"
                  onClick={() => {
                    trackRepersonalizationAccepted(repersonalizePrompt.kind);
                    acceptRepersonalize();
                  }}
                >
                  {tourI18n.repersonalizeAccept}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={() => {
                    trackRepersonalizationDismissed(repersonalizePrompt.kind);
                    dismissRepersonalize();
                  }}
                >
                  {tourI18n.repersonalizeDismiss}
                </Button>
              </div>
            </div>
            <button
              onClick={() => {
                trackRepersonalizationDismissed(repersonalizePrompt.kind);
                dismissRepersonalize();
              }}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 shrink-0"
              aria-label={tourI18n.repersonalizeDismiss}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
