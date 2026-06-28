"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Map, LayoutGrid, ListChecks, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding, trackStepView } from "./onboarding-context";
import { OnboardingShell } from "./onboarding-shell";
import { trackGenesisRevealCompleted } from "@/lib/onboarding/analytics";
import { Loader2 } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";

const REVEAL_STEPS = [
  { id: "roadmap", icon: Map, title: "نقشه راه", desc: "مسیر گام‌به‌گام ۴–۱۲ هفته‌ای شما آماده است." },
  { id: "canvas", icon: LayoutGrid, title: "بوم مدل کسب‌وکار", desc: "۹ بلوک استراتژیک بر اساس ایده شما ساخته شد." },
  { id: "tasks", icon: ListChecks, title: "گام‌های هفته اول", desc: "۳ اقدام اولویت‌دار برای شروع فوری." },
  { id: "ready", icon: Sparkles, title: "آماده پرتاب!", desc: "وارد مرکز مأموریت شوید و اولین XP را بگیرید." },
];

export function CinematicRevealStep() {
  const router = useRouter();
  const { state, completeReveal, loading } = useOnboarding();
  const reduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    trackStepView("reveal");
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    if (stepIndex >= REVEAL_STEPS.length - 1) return;
    const t = setTimeout(() => setStepIndex((i) => i + 1), 2200);
    return () => clearTimeout(t);
  }, [stepIndex, reduceMotion]);

  const handleContinue = async () => {
    if (stepIndex < REVEAL_STEPS.length - 1) {
      setStepIndex((i) => Math.min(i + 1, REVEAL_STEPS.length - 1));
      return;
    }
    setFinishing(true);
    if (state?.project?.projectId) {
      trackGenesisRevealCompleted(state.project.projectId);
    }
    await completeReveal();
    router.push("/onboarding/missions");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  const step = REVEAL_STEPS[stepIndex];
  const Icon = step.icon;
  const projectName = state?.project?.projectName ?? "پروژه شما";

  return (
    <OnboardingShell
      phase="reveal"
      title="آشکارسازی طرح"
      subtitle={`${projectName} — آنچه کارنکس برای شما ساخت`}
      showStepper
    >
      <div className="max-w-lg mx-auto text-center space-y-8 py-8">
        <div className="flex justify-center gap-2">
          {REVEAL_STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-brand-primary" : "bg-muted"
              }`}
              aria-hidden
            />
          ))}
        </div>

        <motion.div
          key={step.id}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="frosted-glass rounded-3xl border border-border p-10"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <Icon className="w-10 h-10 text-white" aria-hidden />
          </div>
          <h2 className="text-2xl font-black mb-3">{step.title}</h2>
          <p className="text-muted-foreground">{step.desc}</p>
          <p className="text-xs text-muted-foreground mt-4">
            مرحله {toPersianDigits(String(stepIndex + 1))} از {toPersianDigits(String(REVEAL_STEPS.length))}
          </p>
        </motion.div>

        <Button
          size="lg"
          className="w-full bg-gradient-to-l from-brand-primary to-brand-secondary text-white font-black h-14"
          onClick={handleContinue}
          disabled={finishing}
        >
          {finishing ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : stepIndex < REVEAL_STEPS.length - 1 ? (
            "بعدی"
          ) : (
            "ورود به مرکز مأموریت"
          )}
        </Button>
      </div>
    </OnboardingShell>
  );
}
