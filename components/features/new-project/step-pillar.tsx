"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PILLARS, ProjectType } from "@/app/new-project/genesis-constants";
import { useGenesisWizard } from "./genesis-wizard-context";

export function StepPillar() {
  const { pillar, selectPillar, advance } = useGenesisWizard();

  const handleStart = () => {
    if (pillar) advance();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-12 space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tight text-foreground"
        >
          چه چیزی می‌سازید؟
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          نوع پروژه خود را انتخاب کنید تا ابزارهای مناسب برای شما بارگذاری شود.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {PILLARS.map((p, index) => {
          const isSelected = pillar === p.id;
          return (
            <motion.button
              key={p.id}
              type="button"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              onClick={() => selectPillar(p.id as ProjectType)}
              className={cn(
                "group relative h-[450px] rounded-3xl overflow-hidden text-end transition-all duration-500",
                "border border-border/50 hover:border-brand-primary/50",
                isSelected
                  ? "ring-4 ring-brand-primary/20 scale-[1.02]"
                  : "hover:scale-[1.02]"
              )}
            >
              {/* Brand-tinted hover wash */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br",
                  p.accent
                )}
              />
              {/* Glass surface */}
              <div className="absolute inset-0 bg-card/60 backdrop-blur-sm group-hover:bg-card/40 transition-colors duration-500" />

              {/* Selection indicator */}
              <div
                className={cn(
                  "absolute top-6 start-6 z-30 transition-all duration-300",
                  isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                )}
              >
                <div className="bg-brand-primary text-primary-foreground rounded-full p-2 shadow-lg shadow-primary/30">
                  <Check className="w-6 h-6" />
                </div>
              </div>

              <div className="relative h-full flex flex-col p-8 z-20">
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl transition-transform duration-500 group-hover:scale-110 bg-gradient-to-br text-white",
                    p.accent
                  )}
                >
                  <p.icon className="w-8 h-8" />
                </div>

                <h3 className="text-3xl font-bold text-foreground mb-3">
                  {p.title}
                </h3>
                <div className="inline-flex w-fit px-3 py-1 rounded-full bg-brand-secondary/15 text-brand-secondary text-xs font-medium mb-6 backdrop-blur-md">
                  {p.subtitle}
                </div>

                <p className="text-muted-foreground leading-relaxed text-lg">
                  {p.description}
                </p>

                <div className="mt-auto pt-8">
                  <div
                    className={cn(
                      "flex items-center text-brand-primary font-bold transition-all duration-300",
                      isSelected
                        ? "translate-x-0 opacity-100"
                        : "translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    )}
                  >
                    <span>انتخاب این مسیر</span>
                    <ArrowLeft className="me-2 w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explicit start button (no auto-advance) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex justify-center"
      >
        <Button
          size="lg"
          rounded="lg"
          onClick={handleStart}
          disabled={!pillar}
          className={cn(
            "h-14 px-10 text-lg font-bold transition-all duration-300",
            pillar
              ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              : "opacity-50 cursor-not-allowed"
          )}
        >
          شروع کنید
          <ArrowLeft className="me-2 w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}
