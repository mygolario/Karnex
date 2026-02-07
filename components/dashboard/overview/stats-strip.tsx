"use client";

import { motion } from "framer-motion";
import { TrendingUp, Award, Flame, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatsStripProps {
  progress: number;
  score: string | number; // Allow legacy number score or new grade
  completedCount: number;
  totalSteps: number;
  streak: number;
}

export function StatsStrip({ progress, score, completedCount, totalSteps, streak }: StatsStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      <StatCard 
        icon={TrendingUp} 
        label="پیشرفت کل" 
        value={`${progress}%`} 
        color="text-blue-500" 
        bgColor="bg-blue-500/10"
        footer={<Progress value={progress} className="h-1.5 mt-2 bg-blue-100 dark:bg-blue-950" indicatorClassName="bg-blue-500" />}
      />
      <StatCard 
        icon={Award} 
        label="امتیاز پروژه" 
        value={typeof score === 'string' ? score : score.toString()} 
        color="text-purple-500"
        bgColor="bg-purple-500/10"
        subValue="خوب" 
      />
      <StatCard 
        icon={CheckCircle2} 
        label="تسک‌های انجام شده" 
        value={`${completedCount}/${totalSteps}`} 
        color="text-emerald-500" 
        bgColor="bg-emerald-500/10"
      />
      <StatCard 
        icon={Flame} 
        label="زنجیره فعالیت" 
        value={`${streak} روز`} 
        color="text-orange-500" 
        bgColor="bg-orange-500/10"
        isFire
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor, subValue, footer, isFire }: any) {
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
