"use client";

import { ContentPost } from "@/lib/db";
import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, CalendarClock, AlertCircle, Search, X } from "lucide-react";
import { PLATFORMS } from "./constants";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isAfter, isBefore, startOfDay } from "date-fns";
import { isSameWeek, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

interface StatsBarProps {
  events: ContentPost[];
  platformFilter: string[];
  statusFilter: string[];
  searchQuery: string;
  onPlatformFilter: (p: string) => void;
  onStatusFilter: (s: string) => void;
  onSearchChange: (q: string) => void;
  onClearFilters: () => void;
}

export function StatsBar({
  events,
  platformFilter,
  statusFilter,
  searchQuery,
  onPlatformFilter,
  onStatusFilter,
  onSearchChange,
  onClearFilters,
}: StatsBarProps) {
  const today = startOfDay(new Date());
  const published = events.filter((e) => e.status === "published").length;
  const upcoming = events.filter(
    (e) => e.status !== "published" && !isBefore(new Date(e.date), today)
  ).length;
  const overdue = events.filter(
    (e) => e.status !== "published" && isBefore(new Date(e.date), today)
  ).length;

  // Weekly frequency: published this week
  const thisWeekPublished = events.filter(
    (e) =>
      e.status === "published" &&
      isSameWeek(new Date(e.date), new Date(), { weekStartsOn: 6 })
  ).length;

  const hasActiveFilters =
    platformFilter.length > 0 || statusFilter.length > 0 || searchQuery.length > 0;

  const stats = [
    {
      label: "کل محتوا",
      value: events.length,
      Icon: TrendingUp,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      label: "منتشر شده",
      value: published,
      Icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "در پیش‌رو",
      value: upcoming,
      Icon: CalendarClock,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      label: "عقب‌افتاده",
      value: overdue,
      Icon: AlertCircle,
      color: overdue > 0 ? "text-red-400" : "text-slate-500",
      bg: overdue > 0 ? "bg-red-500/10" : "bg-white/5",
      border: overdue > 0 ? "border-red-500/20" : "border-white/10",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border",
              stat.bg,
              stat.border
            )}
          >
            <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
              <stat.Icon className="w-4 h-4" />
            </div>
            <div className="text-right">
              <div className={cn("text-2xl font-black", stat.color)}>{stat.value}</div>
              <div className="text-[11px] text-muted-foreground">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly frequency bar */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
        <span className="text-xs text-muted-foreground shrink-0">این هفته:</span>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((thisWeekPublished / 5) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
          />
        </div>
        <span className="text-xs font-bold text-emerald-400 shrink-0">{thisWeekPublished} / ۵ پست</span>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجوی محتوا..."
            className="pr-9 h-8 text-sm bg-white/5 border-white/10 focus:border-white/20 placeholder:text-muted-foreground/60 text-right"
          />
        </div>

        {/* Platform chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PLATFORMS.map((p) => {
            const isActive = platformFilter.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onPlatformFilter(p.id)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all duration-150",
                  isActive
                    ? `${p.chipClass} scale-105 shadow-sm`
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                )}
              >
                <p.Icon className="w-3 h-3" />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Status chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "idea", label: "ایده" },
            { id: "scripting", label: "نگارش" },
            { id: "filming", label: "ضبط" },
            { id: "editing", label: "تدوین" },
            { id: "scheduled", label: "زمان‌بندی" },
            { id: "published", label: "منتشر" },
          ].map((s) => {
            const isActive = statusFilter.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => onStatusFilter(s.id)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs border transition-all duration-150",
                  isActive
                    ? "bg-violet-500/25 border-violet-500/40 text-violet-300 scale-105"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5 ml-1" />
            پاک‌سازی
          </Button>
        )}
      </div>
    </div>
  );
}
