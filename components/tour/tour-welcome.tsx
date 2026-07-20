"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTourStore } from "@/lib/tour/store";
import { tourI18n } from "@/lib/tour/i18n";
import type { TourExperienceLevel, TourPersona, TourPrimaryGoal } from "@/lib/tour/types";
import { TourMascot } from "./tour-mascot";
import { trackOnboardingCompleted, trackWelcomeCompleted } from "@/lib/tour/analytics";
import { cn } from "@/lib/utils";
import {
  Rocket,
  LayoutGrid,
  Sparkles as SparklesIcon,
  Zap,
  Trophy,
  Target,
  TrendingUp,
  Compass,
} from "lucide-react";

const PERSONAS: { id: TourPersona; icon: typeof Rocket; color: string }[] = [
  { id: "founder", icon: Rocket, color: "from-blue-500 to-indigo-600" },
  { id: "general", icon: LayoutGrid, color: "from-slate-500 to-slate-700" },
];

const EXPERIENCE_LEVELS: { id: TourExperienceLevel; icon: typeof SparklesIcon; color: string }[] = [
  { id: "beginner", icon: SparklesIcon, color: "from-emerald-500 to-teal-600" },
  { id: "intermediate", icon: Zap, color: "from-amber-500 to-orange-600" },
  { id: "pro", icon: Trophy, color: "from-violet-500 to-purple-700" },
];

const PRIMARY_GOALS: { id: TourPrimaryGoal; icon: typeof Target; color: string }[] = [
  { id: "validate-idea", icon: Target, color: "from-sky-500 to-blue-600" },
  { id: "launch-product", icon: Rocket, color: "from-indigo-500 to-violet-600" },
  { id: "raise-funding", icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
  { id: "just-exploring", icon: Compass, color: "from-slate-500 to-slate-700" },
];

const TOTAL_STEPS = 3;

export function TourWelcome() {
  const { showWelcome, closeWelcome, startTour, skipTourById, completeOnboarding } = useTourStore();
  const [step, setStep] = useState(0);
  const [persona, setPersonaChoice] = useState<TourPersona | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<TourExperienceLevel | null>(null);

  if (!showWelcome) return null;

  const finish = (goal: TourPrimaryGoal) => {
    const finalPersona = persona ?? "general";
    const finalExperience = experienceLevel ?? "beginner";
    completeOnboarding(finalPersona, finalExperience, goal);
    trackWelcomeCompleted(finalPersona);
    trackOnboardingCompleted(finalPersona, finalExperience, goal);
    startTour("dashboard", 0, true);
  };

  const handleSkip = () => {
    completeOnboarding("general", "beginner", "just-exploring");
    closeWelcome();
    skipTourById("dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      dir="rtl"
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card border border-border rounded-[2rem] p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-center mb-5">
            <TourMascot mood="welcome" size="lg" />
          </div>

          {step === 0 && (
            <>
              <h1 className="text-3xl font-black text-foreground mb-2">{tourI18n.welcomeTitle}</h1>
              <p className="text-muted-foreground mb-6">{tourI18n.welcomeSubtitle}</p>
            </>
          )}

          {/* Step progress */}
          <div className="flex justify-center gap-1.5 mb-6">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-8 bg-primary" : "w-1.5 bg-muted"
                )}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="persona"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <p className="text-sm font-bold text-foreground mb-4">{tourI18n.pickPersona}</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {PERSONAS.map(({ id, icon: Icon, color }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setPersonaChoice(id);
                        setStep(1);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group",
                        persona === id ? "border-primary/60 shadow-lg" : "border-border/50 hover:border-primary/40 hover:shadow-lg"
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg group-hover:scale-110 transition-transform",
                          color
                        )}
                      >
                        <Icon size={22} />
                      </div>
                      <span className="text-xs font-medium text-foreground">{tourI18n.personas[id]}</span>
                    </button>
                  ))}
                </div>
                <Button variant="ghost" onClick={handleSkip}>
                  {tourI18n.skipToDashboard}
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="experience"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <p className="text-sm font-bold text-foreground mb-1">{tourI18n.onboardingExperienceTitle}</p>
                <p className="text-xs text-muted-foreground mb-4">{tourI18n.onboardingExperienceSubtitle}</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {EXPERIENCE_LEVELS.map(({ id, icon: Icon, color }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setExperienceLevel(id);
                        setStep(2);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all group",
                        experienceLevel === id ? "border-primary/60 shadow-lg" : "border-border/50 hover:border-primary/40 hover:shadow-lg"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg group-hover:scale-110 transition-transform",
                          color
                        )}
                      >
                        <Icon size={18} />
                      </div>
                      <span className="text-[11px] font-medium text-foreground">
                        {tourI18n.experienceLevels[id]}
                      </span>
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
                  {tourI18n.onboardingBack}
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="goal"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <p className="text-sm font-bold text-foreground mb-1">{tourI18n.onboardingGoalTitle}</p>
                <p className="text-xs text-muted-foreground mb-4">{tourI18n.onboardingGoalSubtitle}</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {PRIMARY_GOALS.map(({ id, icon: Icon, color }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => finish(id)}
                      className="flex items-center gap-2.5 p-3 rounded-2xl border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all group text-start"
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-md shrink-0 group-hover:scale-110 transition-transform",
                          color
                        )}
                      >
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-medium text-foreground">{tourI18n.primaryGoals[id]}</span>
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  {tourI18n.onboardingBack}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
