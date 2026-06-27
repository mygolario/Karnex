"use client";

import { ContentPost } from "@/lib/db";
import { motion } from "framer-motion";
import { Plus, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_MAP, STATUSES, STATUS_MAP } from "./constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns-jalali";
import { isBefore, startOfDay } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface KanbanViewProps {
  filteredEvents: ContentPost[];
  onAddClick: (date: Date, status?: string) => void;
  onEditClick: (event: ContentPost) => void;
  onMoveStatus: (event: ContentPost, direction: "next" | "prev") => void;
}

function KanbanCard({
  event,
  onEdit,
  onMove,
}: {
  event: ContentPost;
  onEdit: () => void;
  onMove: (dir: "next" | "prev") => void;
}) {
  const platform = PLATFORM_MAP[event.platform];
  const today = startOfDay(new Date());
  const isOverdue =
    event.status !== "published" && isBefore(new Date(event.date), today);

  const checklistItems = event.checklist
    ? Object.values(event.checklist)
    : [];
  const checklistDone = checklistItems.filter(Boolean).length;
  const checklistTotal = checklistItems.length;
  const checklistPct = checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0;

  if (!platform) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onEdit}
      className={cn(
        "group relative cursor-pointer rounded-2xl border bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm p-3 shadow-sm hover:shadow-md hover:border-white/20 transition-all",
        isOverdue ? "border-red-500/30" : "border-white/10"
      )}
    >
      {/* Platform + Priority row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          {/* Move buttons (show on hover) */}
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onMove("prev"); }}
              className="p-0.5 rounded hover:bg-white/10 text-muted-foreground"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMove("next"); }}
              className="p-0.5 rounded hover:bg-white/10 text-muted-foreground"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isOverdue && <AlertCircle className="w-3 h-3 text-red-400" />}
          {event.priority === "high" && (
            <Badge variant="outline" className="h-4 px-1.5 text-[9px] border-red-500/50 text-red-400">
              فوری
            </Badge>
          )}
          <div className={cn("flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border", platform.bg, platform.border, platform.color)}>
            <platform.Icon className="w-3 h-3" />
            <span>{platform.label}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-bold text-sm text-right leading-snug mb-2">{event.title}</h4>

      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2 justify-end">
          {event.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] text-muted-foreground bg-white/5 rounded-full px-1.5 py-0.5">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Checklist progress */}
      {checklistTotal > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>{checklistDone}/{checklistTotal} چک‌لیست</span>
          </div>
          <Progress value={checklistPct} className="h-1" />
        </div>
      )}

      {/* Footer: date + thumbnail preview */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-white/10">
        <div className="flex items-center gap-1">
          {event.thumbnailUrl && (
            <div className="w-6 h-6 rounded overflow-hidden border border-white/10">
              <img src={event.thumbnailUrl} className="w-full h-full object-cover" alt="" />
            </div>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(event.date), "d MMMM")}
          {event.publishTime && ` · ${event.publishTime}`}
        </span>
      </div>
    </motion.div>
  );
}

export function KanbanView({
  filteredEvents,
  onAddClick,
  onEditClick,
  onMoveStatus,
}: KanbanViewProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 items-start mobile-scroll-x snap-x" style={{ minHeight: "min(600px, 70dvh)" }}>
      {STATUSES.map((col) => {
        const colEvents = filteredEvents.filter((e) => e.status === col.id);
        return (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-[260px] w-[260px] shrink-0 flex flex-col rounded-2xl border border-white/10 bg-white/2 backdrop-blur-sm overflow-hidden snap-start"
            data-kanban-col
          >
            {/* Column header */}
            <div className={cn(
              "p-3 border-b border-white/10 bg-gradient-to-r",
              col.headerGradient
            )}>
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="bg-white/10 text-foreground text-xs border-0"
                >
                  {colEvents.length}
                </Badge>
                <div className={cn("flex items-center gap-1.5 font-bold text-sm", col.color)}>
                  <span>{col.label}</span>
                  <col.Icon className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[65vh]">
              {colEvents.map((event) => (
                <KanbanCard
                  key={event.id}
                  event={event}
                  onEdit={() => onEditClick(event)}
                  onMove={(dir) => onMoveStatus(event, dir)}
                />
              ))}

              {/* Add button */}
              <Button
                variant="ghost"
                onClick={() => onAddClick(new Date(), col.id)}
                className="w-full border-2 border-dashed border-white/10 hover:border-white/20 text-muted-foreground hover:text-foreground h-10 rounded-xl"
              >
                <Plus className="w-4 h-4 ml-2" />
                افزودن
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
