"use client";

import { motion } from "framer-motion";
import { Award, Flame } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LevelUpModal } from "@/components/gamification/level-up-modal";
import { XpToast } from "@/components/gamification/xp-toast";
import type { GamificationState, Badge as BadgeType, XpEvent } from "@/hooks/use-gamification";
import { getRankTitle, getRoadmapTheme } from "@/lib/roadmap/themes";

interface GamificationHudProps {
  state: GamificationState;
  badges: BadgeType[];
  xpEvents: XpEvent[];
  showLevelUp: boolean;
  setShowLevelUp: (v: boolean) => void;
  projectType?: string;
}

export function GamificationHud({
  state,
  badges,
  xpEvents,
  showLevelUp,
  setShowLevelUp,
  projectType = "startup",
}: GamificationHudProps) {
  const theme = getRoadmapTheme(projectType);
  const rankTitle = getRankTitle(state.level, projectType);

  const xpPercent = Math.round(
    (state.xpInCurrentLevel / state.xpForNextLevel) * 100
  );
  const unlockedBadges = badges.filter((b) => b.unlocked);

  return (
    <>
      {/* XP Toast notifications */}
      {xpEvents.map((event) => (
        <XpToast
          key={event.id}
          xp={event.xp}
          reason={event.reason}
          isVisible={true}
          onHide={() => {}}
        />
      ))}

      {/* Level Up modal */}
      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        level={state.level}
      />

      {/* HUD card */}
      <Card variant="muted" padding="default" className="space-y-4 shadow-sm border border-border/40 text-start">
        {/* Level + XP bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative shrink-0">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                  boxShadow: `0 4px 15px ${theme.timelineGlow}`,
                }}
              >
                <span className="text-xl font-black">
                  {toPersianDigits(state.level)}
                </span>
              </div>
              <div className="absolute -bottom-1 -end-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center border-2 border-background shadow">
                <Award size={12} className="text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-black text-foreground">
                  سطح {toPersianDigits(state.level)}: {rankTitle}
                </span>
                <Badge variant="outline" className="text-[10px] py-0 border-amber-500/30 text-amber-600 bg-amber-500/5">
                  رتبه کارآفرینی
                </Badge>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-bold">
                <span>{toPersianDigits(xpPercent)}٪ تا سطح بعدی</span>
                <span className="font-mono">
                  {toPersianDigits(state.xpInCurrentLevel)} / {toPersianDigits(state.xpForNextLevel)} XP
                </span>
              </div>
            </div>
          </div>

          {/* Streak details */}
          {state.streak > 0 && (
            <div className="flex flex-row md:flex-col items-center justify-between md:justify-center shrink-0 md:border-s border-border/40 md:ps-6 gap-2">
              <div className="flex items-center gap-1">
                <Flame
                  size={20}
                  className={cn(
                    "text-orange-500",
                    state.streak >= 3 && "animate-pulse"
                  )}
                />
                <span className="text-lg font-black text-foreground">
                  {toPersianDigits(state.streak)} روز متوالی
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-bold">
                پشتکار شما عالیست {theme.streakEmoji}
              </span>
            </div>
          )}
        </div>

        {/* Badges section */}
        <div className="pt-2 border-t border-border/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-foreground flex items-center gap-1">
              <Award size={14} className="text-amber-500" />
              نشان‌های افتخار کارآفرینی
            </span>
            <Badge variant="muted" size="sm" className="font-bold">
              {toPersianDigits(unlockedBadges.length)} از {toPersianDigits(badges.length)} باز شده
            </Badge>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                title={`${badge.label} — ${badge.description}`}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 cursor-default",
                  badge.unlocked
                    ? "bg-amber-500/5 border border-amber-500/15"
                    : "bg-muted/30 border border-border/20 opacity-50"
                )}
              >
                <span className="text-xl">
                  {badge.unlocked ? badge.icon : "🔒"}
                </span>
                <span className="text-[9px] text-center text-foreground font-bold leading-tight line-clamp-1">
                  {badge.label}
                </span>
                {!badge.unlocked && badge.progress != null && badge.threshold != null && (
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{
                        width: `${Math.min((badge.progress / badge.threshold) * 100, 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}
