"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PILLARS, ProjectType } from "@/app/new-project/genesis-constants";
import {
  isPillarAvailableAtLaunch,
  isPillarComingSoon,
} from "@/lib/launch/config";
import { useGenesisWizard } from "./genesis-wizard-context";

export function StepPillar() {
  const { pillar, selectPillar, advance, retreat } = useGenesisWizard();

  const handleStart = () => {
    if (pillar && isPillarAvailableAtLaunch(pillar)) advance();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-12 space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-tight text-foreground"
        >
          چه چیزی می‌سازی؟
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          الان مسیر استارتاپ آماده است. مسیرهای دیگر به‌زودی فعال می‌شوند.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 pb-24 md:pb-0">
        {PILLARS.map((p, index) => {
          const available = isPillarAvailableAtLaunch(p.id);
          const comingSoon = isPillarComingSoon(p.id);
          const isSelected = pillar === p.id && available;

          return (
            <motion.button
              key={p.id}
              type="button"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              onClick={() => {
                if (!available) return;
                selectPillar(p.id as ProjectType);
              }}
              disabled={comingSoon}
              aria-disabled={comingSoon}
              className={cn(
                "group relative h-[280px] sm:h-[360px] md:h-[450px] rounded-3xl overflow-hidden text-end transition-all duration-500",
                "border border-border/50",
                available && "hover:border-brand-primary/50",
                isSelected
                  ? "ring-4 ring-brand-primary/20 scale-[1.02]"
                  : available && "hover:scale-[1.02]",
                comingSoon && "opacity-70 cursor-not-allowed",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-500 bg-gradient-to-br",
                  p.accent,
                  available && "group-hover:opacity-10",
                )}
              />
              <div className="absolute inset-0 bg-card/60 backdrop-blur-sm group-hover:bg-card/40 transition-colors duration-500" />

              {comingSoon && (
                <div className="absolute top-6 end-6 z-30">
                  <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold">
                    به‌زودی
                  </span>
                </div>
              )}

              <div
                className={cn(
                  "absolute top-6 start-6 z-30 transition-all duration-300",
                  isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50",
                )}
              >
                <div className="bg-brand-primary text-primary-foreground rounded-full p-2 shadow-lg shadow-primary/30">
                  <Check className="w-6 h-6" />
                </div>
              </div>

              <div className="relative h-full flex flex-col p-5 sm:p-8 z-20">
                <div
                  className={cn(
                    "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-8 shadow-xl transition-transform duration-500 bg-gradient-to-br text-white",
                    p.accent,
                    available && "group-hover:scale-110",
                  )}
                >
                  <p.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3">{p.title}</h3>
                {!comingSoon && (
                  <div className="inline-flex w-fit px-3 py-1 rounded-full bg-brand-secondary/15 text-brand-secondary text-xs font-medium mb-3 sm:mb-6 backdrop-blur-md">
                    {p.subtitle}
                  </div>
                )}
                {comingSoon && <div className="mb-3 sm:mb-6" />}

                <p className="text-muted-foreground leading-relaxed text-sm sm:text-lg line-clamp-3 sm:line-clamp-none">
                  {p.description}
                </p>

                <div className="mt-auto pt-4 sm:pt-8">
                  {available ? (
                    <div
                      className={cn(
                        "flex items-center text-brand-primary font-bold transition-all duration-300",
                        isSelected
                          ? "translate-x-0 opacity-100"
                          : "translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                      )}
                    >
                      <span>انتخاب این مسیر</span>
                      <ArrowLeft className="me-2 w-5 h-5" />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground font-medium">
                      بعد از لانچ رسمی فعال می‌شود
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex justify-center gap-3",
          "md:static md:mt-12 md:border-0 md:bg-transparent md:backdrop-blur-none md:p-0 md:pb-0",
        )}
      >
        <Button
          variant="outline"
          size="lg"
          rounded="lg"
          onClick={retreat}
          className="h-14 px-6 hidden md:inline-flex"
        >
          قبلی
        </Button>
        <Button
          size="lg"
          rounded="lg"
          onClick={handleStart}
          disabled={!pillar || !isPillarAvailableAtLaunch(pillar)}
          className={cn(
            "h-14 w-full max-w-md md:w-auto md:px-10 text-lg font-bold transition-all duration-300",
            pillar && isPillarAvailableAtLaunch(pillar)
              ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              : "opacity-50 cursor-not-allowed",
          )}
        >
          ادامه
          <ArrowLeft className="me-2 w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}
