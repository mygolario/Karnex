"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, Loader2, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboarding, trackStepView } from "./onboarding-context";
import { OnboardingShell } from "./onboarding-shell";
import { trackMissionCompleted, trackOnboardingCompleted } from "@/lib/onboarding/analytics";
import { LEVEL_NAMES } from "@/lib/onboarding/types";
import { toPersianDigits } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MissionItem {
  id: string;
  title: string;
  description: string;
  xp: number;
  href: string;
  completed: boolean;
}

export function MissionControlStep() {
  const router = useRouter();
  const { finishOnboarding, completeMission, state } = useOnboarding();
  const reduceMotion = useReducedMotion();
  const [missions, setMissions] = useState<MissionItem[]>([]);
  const [gamification, setGamification] = useState<{ xp: number; level: number; badges: string[]; streak: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  const loadMissions = async () => {
    const res = await fetch("/api/onboarding/missions");
    if (res.ok) {
      const data = await res.json();
      setMissions(data.missions ?? []);
      setGamification(data.gamification);
    }
    setLoading(false);
  };

  useEffect(() => {
    trackStepView("missions");
    loadMissions();
  }, []);

  const completedCount = missions.filter((m) => m.completed).length;
  const allDone = missions.length > 0 && completedCount >= Math.min(3, missions.length);

  const handleCompleteMission = async (mission: MissionItem) => {
    if (mission.completed) return;
    await completeMission(mission.id);
    trackMissionCompleted(mission.id, mission.xp);
    if (!reduceMotion) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    }
    await loadMissions();
  };

  const handleFinish = async () => {
    setFinishing(true);
    await finishOnboarding();
    trackOnboardingCompleted("mission_control");
    router.push("/dashboard/overview");
  };

  const levelName = LEVEL_NAMES[(gamification?.level ?? 1) - 1] ?? "تازه‌کار";

  return (
    <OnboardingShell
      phase="missions"
      title="مرکز مأموریت"
      subtitle="مأموریت‌ها را انجام دهید، XP بگیرید و با کارنکس حرفه‌ای شوید."
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      ) : (
        <div className="space-y-8 max-w-2xl">
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Zap} label="XP" value={toPersianDigits(String(gamification?.xp ?? 0))} />
            <StatCard icon={Trophy} label="سطح" value={levelName} />
            <StatCard icon={CheckCircle2} label="مأموریت" value={`${toPersianDigits(String(completedCount))}/${toPersianDigits(String(missions.length))}`} />
          </div>

          <ul className="space-y-3" role="list">
            {missions.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3",
                  m.completed ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-card/40"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm">{m.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                  <p className="text-xs text-amber-600 font-bold mt-1">+{toPersianDigits(String(m.xp))} XP</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={m.href}>برو</Link>
                  </Button>
                  <Button
                    size="sm"
                    disabled={m.completed}
                    onClick={() => handleCompleteMission(m)}
                    className={m.completed ? "" : "bg-brand-primary text-white"}
                  >
                    {m.completed ? "انجام شد" : "تکمیل"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <motion.div whileHover={{ scale: 1.01 }}>
            <Button
              size="lg"
              className="w-full bg-gradient-to-l from-brand-primary to-brand-secondary text-white font-black h-14"
              disabled={!allDone || finishing}
              onClick={handleFinish}
            >
              {finishing ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : allDone ? (
                "ورود به داشبورد — پرتاب!"
              ) : (
                `حداقل ${toPersianDigits("3")} مأموریت را تکمیل کنید`
              )}
            </Button>
          </motion.div>
        </div>
      )}
    </OnboardingShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-3 text-center">
      <Icon className="w-4 h-4 mx-auto text-brand-primary mb-1" aria-hidden />
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-black text-sm">{value}</p>
    </div>
  );
}
