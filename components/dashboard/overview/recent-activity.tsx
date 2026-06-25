"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2, Target, Bot, Presentation, MapPin,
  Calendar, Sparkles, FileText, TrendingUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "roadmap" | "canvas" | "copilot" | "pitch-deck" | "location" | "content" | "brand";
  title: string;
  time: string;
}

interface RecentActivityProps {
  plan: { completedSteps?: string[]; leanCanvas?: unknown } | null;
}

/* Generate activity from project data */
function getActivityFromProject(plan: RecentActivityProps["plan"]): ActivityItem[] {
  if (!plan) return [];

  const activities: ActivityItem[] = [];
  const completed = (plan.completedSteps as string[]) || [];

  // Recent completed roadmap steps
  const recentCompleted = completed.slice(-3).reverse();
  recentCompleted.forEach((step: string, i: number) => {
    activities.push({
      id: `roadmap-${i}`,
      type: "roadmap",
      title: `تسک تکمیل شد: ${step}`,
      time: `${i + 1} ساعت پیش`,
    });
  });

  // Canvas activity
  const canvas = plan.leanCanvas as Record<string, unknown> | undefined;
  if (canvas && Object.keys(canvas).length > 0) {
    activities.push({
      id: "canvas-1",
      type: "canvas",
      title: "بوم کسب‌وکار به‌روزرسانی شد",
      time: "دیروز",
    });
  }

  // Copilot activity
  activities.push({
    id: "copilot-1",
    type: "copilot",
    title: "گفتگو با دستیار کارنکس",
    time: "۲ روز پیش",
  });

  return activities;
}

const activityConfig: Record<ActivityItem["type"], { icon: typeof Target; color: string; bg: string }> = {
  roadmap: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  canvas: { icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
  copilot: { icon: Bot, color: "text-primary", bg: "bg-primary/10" },
  "pitch-deck": { icon: Presentation, color: "text-violet-500", bg: "bg-violet-500/10" },
  location: { icon: MapPin, color: "text-amber-500", bg: "bg-amber-500/10" },
  content: { icon: Calendar, color: "text-pink-500", bg: "bg-pink-500/10" },
  brand: { icon: Sparkles, color: "text-rose-500", bg: "bg-rose-500/10" },
};

export function RecentActivity({ plan }: RecentActivityProps) {
  const activities = getActivityFromProject(plan);

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-bold text-foreground">فعالیت‌های اخیر</h3>
        </div>
        <div className="text-center py-8">
          <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">هنوز فعالیتی ثبت نشده</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">فعالیت‌های اخیر</h3>
        </div>
        <span className="text-xs text-muted-foreground">{activities.length} مورد</span>
      </div>

      <div className="space-y-1">
        {activities.map((activity, i) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.bg, config.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {activity.title}
                </p>
                <p className="text-[10px] text-muted-foreground">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
