"use client";

import { ContentPost } from "@/lib/db";
import { motion } from "framer-motion";
import { format } from "date-fns-jalali";
import {
  AlertCircle, CheckCircle2, Clock, Edit3,
  ArrowUp, ArrowDown, ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLATFORM_MAP, STATUS_MAP } from "./constants";
import { cn } from "@/lib/utils";
import { isBefore, startOfDay, isThisWeek, startOfWeek, addDays } from "date-fns";

// Simple groupBy without lodash
function groupByWeek(events: ContentPost[]) {
  const today = startOfDay(new Date());
  const groups: Record<string, ContentPost[]> = {};

  events.forEach((e) => {
    const d = new Date(e.date);
    let key: string;
    if (isBefore(d, today) && e.status !== "published") {
      key = "⚠️ عقب‌افتاده";
    } else if (isThisWeek(d, { weekStartsOn: 6 })) {
      key = "📅 این هفته";
    } else if (isThisWeek(addDays(d, -7), { weekStartsOn: 6 })) {
      key = "🗓️ هفته آینده";
    } else {
      key = `📌 ${format(d, "MMMM yyyy")}`;
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });

  return groups;
}

interface ListViewProps {
  filteredEvents: ContentPost[];
  onEditClick: (event: ContentPost) => void;
}

export function ListView({ filteredEvents, onEditClick }: ListViewProps) {
  const today = startOfDay(new Date());
  const sorted = [...filteredEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const groups = groupByWeek(sorted);

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([groupLabel, groupEvents]) => (
        <motion.div
          key={groupLabel}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Group header */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-bold text-muted-foreground">{groupLabel}</h3>
            <div className="flex-1 h-px bg-white/10" />
            <Badge variant="secondary" className="bg-white/5 text-xs border border-white/10">
              {groupEvents.length}
            </Badge>
          </div>

          {/* Event rows */}
          <div className="space-y-2">
            {groupEvents.map((event, i) => {
              const platform = PLATFORM_MAP[event.platform];
              const statusInfo = STATUS_MAP[event.status];
              const isOverdue =
                event.status !== "published" && isBefore(new Date(event.date), today);

              if (!platform || !statusInfo) return null;

              const checklistItems = event.checklist ? Object.values(event.checklist) : [];
              const checklistDone = checklistItems.filter(Boolean).length;
              const checklistTotal = checklistItems.length;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onEditClick(event)}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-white/5",
                    isOverdue
                      ? "bg-red-500/5 border-red-500/20 hover:border-red-500/30"
                      : "bg-white/2 border-white/10 hover:border-white/20"
                  )}
                >
                  {/* Platform icon */}
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    platform.bg, platform.border, "border"
                  )}>
                    <platform.Icon className={cn("w-4 h-4", platform.color)} />
                  </div>

                  {/* Date */}
                  <div className="w-20 shrink-0 text-right">
                    <div className="text-xs font-bold text-foreground">
                      {format(new Date(event.date), "d MMMM")}
                    </div>
                    {event.publishTime && (
                      <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {event.publishTime}
                      </div>
                    )}
                  </div>

                  {/* Title + tags */}
                  <div className="flex-1 text-right min-w-0">
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <p className="font-semibold text-sm truncate">{event.title}</p>
                      {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                    </div>
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex gap-1 mt-0.5 justify-end flex-wrap">
                        {event.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] text-muted-foreground">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Checklist progress */}
                  {checklistTotal > 0 && (
                    <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      {checklistDone}/{checklistTotal}
                    </div>
                  )}

                  {/* Status badge */}
                  <div className={cn(
                    "shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] border",
                    statusInfo.bg, statusInfo.border, statusInfo.color
                  )}>
                    <statusInfo.Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{statusInfo.label}</span>
                  </div>

                  {/* Priority */}
                  {event.priority === "high" && (
                    <ArrowUp className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  {event.priority === "medium" && (
                    <ArrowRight className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  )}
                  {event.priority === "low" && (
                    <ArrowDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}

                  {/* Edit icon */}
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">محتوایی یافت نشد.</p>
        </div>
      )}
    </div>
  );
}
