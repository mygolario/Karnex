"use client";

import { ContentPost } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  getDaysInMonth,
  getDay,
  addMonths,
  subMonths,
  addDays,
  isSameDay,
  isToday,
} from "date-fns-jalali";
import { ChevronLeft, ChevronRight, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  PLATFORM_MAP,
  JALALI_DAY_NAMES,
  JALALI_DAY_NAMES_SHORT,
} from "./constants";
import { cn } from "@/lib/utils";
import { isBefore, startOfDay } from "date-fns";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";

interface CalendarViewProps {
  events: ContentPost[];
  filteredEvents: ContentPost[];
  currentDate: Date;
  onDateChange: (d: Date) => void;
  onAddClick: (date: Date) => void;
  onEditClick: (event: ContentPost) => void;
  onReschedule: (eventId: string, newDate: Date) => void;
}

function PostChip({
  event,
  onClick,
  isDragging = false,
}: {
  event: ContentPost;
  onClick?: () => void;
  isDragging?: boolean;
}) {
  const platform = PLATFORM_MAP[event.platform];
  const today = startOfDay(new Date());
  const isOverdue =
    event.status !== "published" && isBefore(new Date(event.date), today);

  if (!platform) return null;

  return (
    <motion.div
      layoutId={!isDragging ? event.id : undefined}
      onClick={onClick}
      whileHover={{ scale: 1.04, zIndex: 10 }}
      className={cn(
        "relative flex min-w-0 items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] border cursor-pointer transition-all shadow-sm",
        platform.chipClass,
        isOverdue && "ring-1 ring-red-500/50",
        isDragging && "opacity-80 shadow-xl scale-105"
      )}
    >
      {isOverdue && (
        <AlertCircle className="w-2.5 h-2.5 text-red-400 shrink-0" />
      )}
      {!isOverdue && <platform.Icon className="w-3 h-3 shrink-0" />}
      <span className="truncate font-medium">{event.title}</span>
      {event.priority === "high" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
      )}
    </motion.div>
  );
}

function CalendarDayCell({
  dayNumber,
  cellDate,
  dayEvents,
  isTodayDate,
  isOverdueCell,
  onAdd,
  onEdit,
  onOpenDay,
}: {
  dayNumber: number;
  cellDate: Date;
  dayEvents: ContentPost[];
  isTodayDate: boolean;
  isOverdueCell: boolean;
  onAdd: (date: Date) => void;
  onEdit: (event: ContentPost) => void;
  onOpenDay: (date: Date) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      data-droppable-date={cellDate.toISOString()}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => setIsOver(false)}
      className={cn(
        "min-h-[62px] p-1 md:min-h-[120px] md:p-1.5 border-t border-r border-white/5 transition-all duration-150 flex flex-col gap-1 group relative",
        isTodayDate
          ? "bg-gradient-to-br from-pink-500/10 to-violet-500/5"
          : "bg-transparent hover:bg-white/3",
        isOverdueCell && !isTodayDate && "bg-red-500/5",
        isOver && "bg-white/8 ring-1 ring-inset ring-white/20"
      )}
    >
      {/* Day number */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onAdd(cellDate)}
          className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10"
        >
          <Plus className="w-3 h-3 text-muted-foreground" />
        </button>
        <span
          className={cn(
            "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all",
            isTodayDate
              ? "bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30"
              : "text-muted-foreground"
          )}
        >
          {dayNumber}
        </span>
      </div>

      {/* Post chips — a 53px-wide cell can't hold a readable chip, so phones get
          platform dots and tap through to the day's agenda instead. */}
      <div className="hidden md:flex flex-col gap-1 overflow-hidden">
        {dayEvents.slice(0, 3).map((event) => (
          <PostChip key={event.id} event={event} onClick={() => onEdit(event)} />
        ))}
        {dayEvents.length > 3 && (
          <span className="text-[10px] text-muted-foreground text-right px-1">
            +{dayEvents.length - 3} بیشتر
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpenDay(cellDate)}
        aria-label={`${dayEvents.length} مورد در روز ${dayNumber}`}
        className="md:hidden absolute inset-0 flex items-end justify-center gap-0.5 pb-1.5"
      >
        {dayEvents.slice(0, 4).map((event) => {
          const platform = PLATFORM_MAP[event.platform];
          return (
            <span
              key={event.id}
              className={cn("w-1.5 h-1.5 rounded-full", platform?.dot ?? "bg-muted-foreground")}
            />
          );
        })}
      </button>
    </div>
  );
}

function DayAgendaSheet({
  date,
  events,
  onClose,
  onAdd,
  onEdit,
}: {
  date: Date | null;
  events: ContentPost[];
  onClose: () => void;
  onAdd: (date: Date) => void;
  onEdit: (event: ContentPost) => void;
}) {
  return (
    <Sheet open={date !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="md:hidden max-h-[75dvh] overflow-y-auto">
        {date && (
          <>
            <SheetHeader className="text-start">
              <SheetTitle>{format(date, "d MMMM yyyy")}</SheetTitle>
            </SheetHeader>

            <div className="mt-4 space-y-2">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  برای این روز محتوایی برنامه‌ریزی نشده است.
                </p>
              ) : (
                events.map((event) => (
                  <PostChip
                    key={event.id}
                    event={event}
                    onClick={() => {
                      onEdit(event);
                      onClose();
                    }}
                  />
                ))
              )}

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  onAdd(date);
                  onClose();
                }}
              >
                <Plus className="w-4 h-4 me-1.5" />
                افزودن محتوا
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CalendarView({
  events,
  filteredEvents,
  currentDate,
  onDateChange,
  onAddClick,
  onEditClick,
  onReschedule,
}: CalendarViewProps) {
  const [activeDragEvent, setActiveDragEvent] = useState<ContentPost | null>(null);
  const [agendaDate, setAgendaDate] = useState<Date | null>(null);
  const today = startOfDay(new Date());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Calendar grid
  const daysInMonth = getDaysInMonth(currentDate);
  const startMonthDate = startOfMonth(currentDate);
  // Map: Sat(6)->0, Sun(0)->1, Mon(1)->2, Tue(2)->3, Wed(3)->4, Thu(4)->5, Fri(5)->6
  const firstDayOfMonth = (getDay(startMonthDate) + 1) % 7;
  const paddingDays = Array.from({ length: firstDayOfMonth });

  const getDateForDay = (dayNumber: number) =>
    addDays(startOfMonth(currentDate), dayNumber - 1);

  const handleDragStart = (event: DragStartEvent) => {
    const dragged = events.find((e) => e.id === event.active.id);
    setActiveDragEvent(dragged || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragEvent(null);
    const { active, over } = event;
    if (!over) return;

    // Find the droppable cell date
    const cellEl = document.querySelector(`[data-droppable-date]`) as HTMLElement;
    // We use a custom approach: find which cell the pointer ended on
    const droppableEls = document.querySelectorAll("[data-droppable-date]");
    const clientPoint = (event.activatorEvent as PointerEvent);
    if (!clientPoint) return;

    let targetDate: Date | null = null;
    droppableEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const endX = (event.delta.x + (clientPoint?.clientX || 0));
      const endY = (event.delta.y + (clientPoint?.clientY || 0));
      if (endX >= rect.left && endX <= rect.right && endY >= rect.top && endY <= rect.bottom) {
        targetDate = new Date((el as HTMLElement).dataset.droppableDate || "");
      }
    });

    if (targetDate && active.id) {
      onReschedule(String(active.id), targetDate);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-xs">
            امروز
          </Button>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDateChange(subMonths(currentDate, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="w-36 text-center font-bold text-sm">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDateChange(addMonths(currentDate, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Platform legend */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          {["instagram", "youtube", "tiktok", "telegram", "blog"].map((pid) => {
            const p = PLATFORM_MAP[pid];
            return p ? (
              <span key={pid} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className={cn("w-2 h-2 rounded-full", p.dot)} />
                {p.label}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm bg-white/2 shadow-2xl">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/10">
          {JALALI_DAY_NAMES.map((day, i) => (
            <div
              key={day}
              className="py-2 md:p-3 text-center text-[11px] md:text-xs font-semibold text-muted-foreground bg-white/3"
            >
              <span className="md:hidden">{JALALI_DAY_NAMES_SHORT[i]}</span>
              <span className="hidden md:inline">{day}</span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Padding cells */}
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[62px] md:min-h-[120px] bg-white/1 border-t border-r border-white/5" />
          ))}

          {/* Actual day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
            const cellDate = getDateForDay(dayNum);
            const dayEvents = filteredEvents.filter((e) =>
              isSameDay(new Date(e.date), cellDate)
            );
            const isTodayDate = isToday(cellDate);
            const isOverdueCell = dayEvents.some(
              (e) => e.status !== "published" && isBefore(new Date(e.date), today)
            );

            return (
              <CalendarDayCell
                key={dayNum}
                dayNumber={dayNum}
                cellDate={cellDate}
                dayEvents={dayEvents}
                isTodayDate={isTodayDate}
                isOverdueCell={isOverdueCell}
                onAdd={onAddClick}
                onEdit={onEditClick}
                onOpenDay={setAgendaDate}
              />
            );
          })}
        </div>
      </div>

      <DayAgendaSheet
        date={agendaDate}
        events={
          agendaDate
            ? filteredEvents.filter((e) => isSameDay(new Date(e.date), agendaDate))
            : []
        }
        onClose={() => setAgendaDate(null)}
        onAdd={onAddClick}
        onEdit={onEditClick}
      />

      {/* Drag overlay */}
      <DragOverlay>
        {activeDragEvent && (
          <PostChip event={activeDragEvent} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  );
}
