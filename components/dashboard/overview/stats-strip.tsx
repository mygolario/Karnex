"use client";

import { TrendingUp, Award, Flame, CheckCircle2, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { toPersianDigits } from "@/lib/utils";

interface StatsStripProps {
  progress: number;
  score: string | number;
  completedCount: number;
  totalSteps: number;
  streak: number;
}

/* ── Dynamic score label based on value ── */
function getScoreLabel(score: string | number): string {
  const num = typeof score === "string" ? parseInt(score.replace(/\D/g, ""), 10) : score;
  if (isNaN(num)) return "جدید";
  if (num >= 85) return "عالی";
  if (num >= 70) return "خوب";
  if (num >= 50) return "متوسط";
  if (num >= 25) return "در حال رشد";
  return "شروع";
}

/* ── Dynamic score color ── */
function getScoreColor(score: string | number): { text: string; bg: string } {
  const num = typeof score === "string" ? parseInt(score.replace(/\D/g, ""), 10) : score;
  if (isNaN(num)) return { text: "text-gray-500", bg: "bg-gray-500/10" };
  if (num >= 85) return { text: "text-emerald-500", bg: "bg-emerald-500/10" };
  if (num >= 70) return { text: "text-purple-500", bg: "bg-purple-500/10" };
  if (num >= 50) return { text: "text-blue-500", bg: "bg-blue-500/10" };
  if (num >= 25) return { text: "text-amber-500", bg: "bg-amber-500/10" };
  return { text: "text-orange-500", bg: "bg-orange-500/10" };
}

export function StatsStrip({ progress, score, completedCount, totalSteps, streak }: StatsStripProps) {
  const scoreColors = getScoreColor(score);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" data-tour-id="stats-strip">
      <StatCard
        icon={TrendingUp}
        label="پیشرفت کل"
        value={`${toPersianDigits(progress)}%`}
        color="text-blue-500"
        bgColor="bg-blue-500/10"
        footer={<Progress value={progress} className="h-1.5 mt-2 bg-blue-100 dark:bg-blue-950" indicatorClassName="bg-blue-500" />}
      />
      <StatCard
        icon={Award}
        label="امتیاز پروژه"
        value={toPersianDigits(typeof score === 'string' ? score : score.toString())}
        color={scoreColors.text}
        bgColor={scoreColors.bg}
        subValue={getScoreLabel(score)}
      />
      <StatCard
        icon={CheckCircle2}
        label="تسک‌های انجام شده"
        value={`${toPersianDigits(completedCount)}/${toPersianDigits(totalSteps)}`}
        color="text-emerald-500"
        bgColor="bg-emerald-500/10"
      />
      <StatCard
        icon={Flame}
        label="زنجیره فعالیت"
        value={`${toPersianDigits(streak)} روز`}
        color="text-orange-500"
        bgColor="bg-orange-500/10"
        isFire
      />
    </div>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  subValue?: string;
  footer?: React.ReactNode;
  isFire?: boolean;
}

function StatCard({ icon: Icon, label, value, color, bgColor, subValue, footer, isFire }: StatCardProps) {
  return (
    <Card className="p-5 border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2.5 rounded-xl ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={20} className={isFire ? "animate-pulse" : ""} />
        </div>
        {subValue && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{subValue}</span>
        )}
      </div>
      <div>
        <div className="text-2xl font-black text-foreground tracking-tight">{value}</div>
        <div className="text-xs font-medium text-muted-foreground mt-0.5">{label}</div>
      </div>
      {footer && footer}
    </Card>
  );
}
