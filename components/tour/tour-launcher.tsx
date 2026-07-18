"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleHelp,
  Check,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { useTourStore } from "@/lib/tour/store";
import { getToursForProjectType, ACCENT_CLASSES } from "@/lib/tour/registry";
import { tourI18n } from "@/lib/tour/i18n";
import { useProject } from "@/contexts/project-context";

export function TourLauncher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { activeProject } = useProject();
  const { persisted, startTour, isOpen } = useTourStore();

  const tours = getToursForProjectType(activeProject?.projectType).filter(
    (t) => t.id !== "whats-new"
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const completed = persisted.completedTours.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors relative"
        title={tourI18n.tourLauncher}
        data-tour-id="help-button"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <CircleHelp size={20} />
        {completed < tours.length && (
          <span className="absolute top-1 end-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute end-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
            dir="rtl"
          >
            <div className="p-4 border-b border-border bg-gradient-to-l from-primary/10 to-violet-500/10">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                <div>
                  <h3 className="font-bold text-sm">{tourI18n.tourLauncher}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {toPersianDigits(completed)}/{toPersianDigits(tours.length)} {tourI18n.completed}
                  </p>
                </div>
              </div>
            </div>

            <ul className="max-h-72 overflow-y-auto p-2">
              {tours.map((tour) => {
                const done = persisted.completedTours.includes(tour.id);
                const accent = ACCENT_CLASSES[tour.accent] ?? ACCENT_CLASSES.primary;
                const inProgress =
                  persisted.activeTourId === tour.id && isOpen;

                return (
                  <li key={tour.id}>
                    <button
                      type="button"
                      disabled={isOpen && persisted.activeTourId !== tour.id}
                      onClick={() => {
                        startTour(tour.id, inProgress ? persisted.activeStepIndex : 0, true);
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-start disabled:opacity-50"
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                          accent.bg
                        )}
                      >
                        {done ? (
                          <Check size={16} className="text-emerald-500" />
                        ) : inProgress ? (
                          <Play size={14} className={accent.text} />
                        ) : (
                          <CircleHelp size={14} className={accent.text} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tour.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {inProgress
                            ? tourI18n.resumeTour
                            : done
                              ? tourI18n.completed
                              : tour.description}
                        </p>
                      </div>
                      <span className="text-[10px] text-amber-500 font-bold shrink-0">
                        +{tour.xpReward}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="p-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  startTour("dashboard", 0, true);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                <RotateCcw size={14} />
                بازپخش تور پیشخوان
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
