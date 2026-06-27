"use client";

import { useState, useMemo } from "react";
import {
  format,
  getDaysInMonth,
  startOfMonth,
  getDay,
  addMonths,
  subMonths,
  getYear,
  getMonth,
  setMonth,
  setYear,
} from "date-fns-jalali";
import { ChevronRight, ChevronLeft, CalendarDays, Circle } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RoadmapPhase, RoadmapStep } from "@/lib/db";
import {
  StepStatus,
  STATUS_CONFIG,
  getCategoryConfig,
} from "@/lib/roadmap/constants";

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

interface RoadmapCalendarProps {
  roadmap: RoadmapPhase[];
  completedSteps: string[];
  stepStatuses: Record<string, { status?: string }>;
  getStepStatus: (step: string | RoadmapStep) => StepStatus;
  onOpenStepDetail: (step: string | RoadmapStep, phase?: RoadmapPhase) => void;
}

interface CalendarStep {
  step: RoadmapStep;
  phase: RoadmapPhase;
  status: StepStatus;
}

export function RoadmapCalendar({
  roadmap,
  completedSteps: _completedSteps,
  stepStatuses: _stepStatuses,
  getStepStatus,
  onOpenStepDetail,
}: RoadmapCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Map steps by their Jalali date string (yyyy/MM/dd)
  const stepsByDate = useMemo(() => {
    const map: Record<string, CalendarStep[]> = {};
    for (const phase of roadmap) {
      for (const s of phase.steps) {
        const step = typeof s === "string" ? { title: s } : (s as RoadmapStep);
        if (step.dueDate) {
          const dateStr = normalizeJalali(step.dueDate);
          if (!map[dateStr]) map[dateStr] = [];
          map[dateStr].push({
            step,
            phase,
            status: getStepStatus(step),
          });
        }
      }
    }
    return map;
  }, [roadmap, getStepStatus]);

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = startOfMonth(currentMonth);
  const firstDayOfWeek = getDay(firstDay);
  const padOffset = (firstDayOfWeek + 1) % 7;

  const grid = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < padOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [padOffset, daysInMonth]);

  const currentYear = getYear(currentMonth);
  const yearsList = useMemo(() => {
    const base = getYear(new Date());
    return Array.from({ length: 20 }, (_, i) => base - 5 + i);
  }, []);

  const todayStr = format(new Date(), "yyyy/MM/dd");

  const stepsWithoutDates = useMemo(() => {
    const arr: CalendarStep[] = [];
    for (const phase of roadmap) {
      for (const s of phase.steps) {
        const step = typeof s === "string" ? { title: s } : (s as RoadmapStep);
        if (!step.dueDate) {
          arr.push({ step, phase, status: getStepStatus(step) });
        }
      }
    }
    return arr;
  }, [roadmap, getStepStatus]);

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronRight size={16} />
          </Button>
          <div className="flex items-center gap-1.5">
            <select
              value={getMonth(currentMonth)}
              onChange={(e) =>
                setCurrentMonth(setMonth(currentMonth, parseInt(e.target.value)))
              }
              className="bg-transparent text-sm font-bold border-0 hover:bg-muted/50 rounded px-2 py-1 cursor-pointer"
            >
              {MONTHS.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) =>
                setCurrentMonth(setYear(currentMonth, parseInt(e.target.value)))
              }
              className="bg-transparent text-sm font-bold border-0 hover:bg-muted/50 rounded px-2 py-1 cursor-pointer"
            >
              {yearsList.map((y) => (
                <option key={y} value={y}>{toPersianDigits(y)}</option>
              ))}
            </select>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronLeft size={16} />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(new Date())}
        >
          امروز
        </Button>
      </div>

      {/* Calendar grid */}
      <Card padding="sm">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="h-7 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {grid.map((day, i) => {
            if (day === null)
              return <div key={`empty-${i}`} className="min-h-[80px]" />;

            const dateStr = `${currentYear}/${String(getMonth(currentMonth) + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
            const daySteps = stepsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isPast = new Date(dateStr) < new Date() && daySteps.length > 0;

            return (
              <div
                key={`day-${day}`}
                className={cn(
                  "min-h-[80px] p-1 rounded-lg border transition-all",
                  isToday
                    ? "border-primary bg-primary/5"
                    : daySteps.length > 0
                      ? "border-border/60 bg-muted/20"
                      : "border-transparent hover:bg-muted/20"
                )}
              >
                <div
                  className={cn(
                    "text-xs font-semibold mb-1",
                    isToday ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {toPersianDigits(day)}
                </div>
                <div className="space-y-1">
                  {daySteps.slice(0, 3).map(({ step, phase, status }) => {
                    const cfg = STATUS_CONFIG[status];
                    const catCfg = getCategoryConfig(step.category);
                    return (
                      <button
                        key={step.title}
                        onClick={() => onOpenStepDetail(step, phase)}
                        className={cn(
                          "w-full text-start text-[10px] px-1.5 py-1 rounded truncate transition-all hover:scale-[1.02]",
                          cfg.badgeClass,
                          isPast && status !== "done" && "ring-1 ring-red-500/30"
                        )}
                        title={step.title}
                      >
                        {catCfg && <span className="me-1">{catCfg.label}</span>}
                        {step.title}
                      </button>
                    );
                  })}
                  {daySteps.length > 3 && (
                    <div className="text-[10px] text-muted-foreground text-center">
                      +{toPersianDigits(daySteps.length - 3)} مورد دیگر
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Unscheduled steps */}
      {stepsWithoutDates.length > 0 && (
        <Card padding="default">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-bold">گام‌های بدون موعد</h3>
            <Badge variant="muted" size="sm">
              {toPersianDigits(stepsWithoutDates.length)}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {stepsWithoutDates.map(({ step, phase, status }) => {
              const cfg = STATUS_CONFIG[status];
              return (
                <button
                  key={step.title}
                  onClick={() => onOpenStepDetail(step, phase)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full transition-all hover:scale-105",
                    cfg.badgeClass
                  )}
                >
                  <Circle size={8} className="inline-block ms-1" />
                  {step.title}
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function normalizeJalali(dateStr: string): string {
  const english = dateStr.replace(/[۰-۹]/g, (d) =>
    String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))
  );
  return english;
}
