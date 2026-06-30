"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
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
  parse,
} from "date-fns-jalali";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";

export interface JalaliDatePickerProps {
  value?: string | Date | null;
  onChange?: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const parseJalaliDate = (val: any): Date | null => {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "string") {
    // Convert Farsi digits to English digits
    const englishDigitsStr = val.replace(/[۰-۹]/g, (d) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    );
    try {
      const parsed = parse(englishDigitsStr, "yyyy/MM/dd", new Date());
      if (parsed && !isNaN(parsed.getTime())) return parsed;
    } catch (e) {
      const parsed = new Date(val);
      if (parsed && !isNaN(parsed.getTime())) return parsed;
    }
  }
  return null;
};

export const JalaliDatePicker = React.forwardRef<HTMLButtonElement, JalaliDatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "انتخاب تاریخ",
      className,
      error,
      disabled,
    },
    ref
  ) => {
    const selectedDate = React.useMemo(() => parseJalaliDate(value), [value]);
    const [currentMonthDate, setCurrentMonthDate] = React.useState<Date>(
      () => selectedDate || new Date()
    );
    const [isOpen, setIsOpen] = React.useState(false);

    // Sync currentMonthDate with selectedDate when opened
    React.useEffect(() => {
      if (selectedDate && isOpen) {
        setCurrentMonthDate(selectedDate);
      }
    }, [selectedDate, isOpen]);

    const handleSelectDay = (day: number) => {
      const targetDate = setYear(
        setMonth(new Date(), getMonth(currentMonthDate)),
        getYear(currentMonthDate)
      );
      const year = getYear(currentMonthDate);
      const month = getMonth(currentMonthDate) + 1; // 1-indexed for string format
      const formattedMonth = month < 10 ? `0${month}` : `${month}`;
      const formattedDay = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `${year}/${formattedMonth}/${formattedDay}`;
      // #region agent log
      fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6ea816'},body:JSON.stringify({sessionId:'6ea816',location:'date-picker.tsx:handleSelectDay',message:'day clicked',data:{day,dateStr,hasOnChange:!!onChange,currentValue:value},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (onChange) {
        onChange(dateStr);
      }
      setIsOpen(false);
    };

    const daysInMonth = getDaysInMonth(currentMonthDate);
    const firstDay = startOfMonth(currentMonthDate);
    const firstDayOfWeek = getDay(firstDay); // Sunday = 0, Monday = 1, ...
    const padOffset = (firstDayOfWeek + 1) % 7; // Saturday = 0, Sunday = 1, ...

    const currentYear = getYear(currentMonthDate);
    const yearsList = React.useMemo(() => {
      const currentJalaliYear = getYear(new Date());
      // Dynamic list of 120 years: from currentJalaliYear - 100 to currentJalaliYear + 10
      return Array.from({ length: 120 }, (_, i) => currentJalaliYear - 100 + i);
    }, []);

    const calendarGrid = React.useMemo(() => {
      const cells = [];
      // Padding
      for (let i = 0; i < padOffset; i++) {
        cells.push(null);
      }
      // Actual days
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d);
      }
      return cells;
    }, [padOffset, daysInMonth]);

    const selectedDateString = selectedDate
      ? format(selectedDate, "yyyy/MM/dd")
      : "";

    return (
      <PopoverPrimitive.Root modal open={isOpen} onOpenChange={(open) => {
        // #region agent log
        fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6ea816'},body:JSON.stringify({sessionId:'6ea816',location:'date-picker.tsx:onOpenChange',message:'popover open change',data:{open,disabled},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setIsOpen(open);
      }}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            disabled={disabled}
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-input border border-border bg-background/50 px-4 py-3 text-sm transition-all duration-200 hover:bg-background/80 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:opacity-50 text-end font-sans",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              !selectedDate && "text-muted-foreground",
              className
            )}
          >
            <span>
              {selectedDate
                ? toPersianDigits(selectedDateString)
                : placeholder}
            </span>
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0 ms-1" />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-[200] w-72 rounded-card border border-glass-premium-border bg-glass-premium backdrop-blur-premium shadow-glass-premium p-4 animate-in fade-in-0 zoom-in-95 font-sans"
            dir="rtl"
          >
            {/* Header / Selectors */}
            <div className="flex items-center justify-between gap-1 mb-3">
              <button
                type="button"
                onClick={() => setCurrentMonthDate(subMonths(currentMonthDate, 1))}
                className="h-8 w-8 flex items-center justify-center rounded-btn hover:bg-muted text-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {/* Month Dropdown */}
                <select
                  value={getMonth(currentMonthDate)}
                  onChange={(e) =>
                    setCurrentMonthDate(
                      setMonth(currentMonthDate, parseInt(e.target.value))
                    )
                  }
                  className="bg-transparent text-sm font-bold text-foreground border-0 hover:bg-muted/50 rounded px-1.5 py-1 focus:ring-0 focus:outline-none cursor-pointer"
                >
                  {MONTHS.map((name, index) => (
                    <option
                      key={index}
                      value={index}
                      className="bg-background text-foreground"
                    >
                      {name}
                    </option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={currentYear}
                  onChange={(e) =>
                    setCurrentMonthDate(
                      setYear(currentMonthDate, parseInt(e.target.value))
                    )
                  }
                  className="bg-transparent text-sm font-bold text-foreground border-0 hover:bg-muted/50 rounded px-1.5 py-1 focus:ring-0 focus:outline-none cursor-pointer"
                >
                  {yearsList.map((yr) => (
                    <option
                      key={yr}
                      value={yr}
                      className="bg-background text-foreground"
                    >
                      {toPersianDigits(yr)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setCurrentMonthDate(addMonths(currentMonthDate, 1))}
                className="h-8 w-8 flex items-center justify-center rounded-btn hover:bg-muted text-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground mb-1.5">
              {WEEKDAYS.map((day) => (
                <div key={day} className="h-7 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-8" />;
                }

                const isSelected =
                  selectedDate &&
                  getYear(selectedDate) === getYear(currentMonthDate) &&
                  getMonth(selectedDate) === getMonth(currentMonthDate) &&
                  format(selectedDate, "d") === String(day);

                const isTodayVal =
                  getYear(new Date()) === getYear(currentMonthDate) &&
                  getMonth(new Date()) === getMonth(currentMonthDate) &&
                  format(new Date(), "d") === String(day);

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={cn(
                      "h-8 text-xs font-semibold rounded-btn transition-all duration-200 flex items-center justify-center hover:bg-brand-primary/10 hover:text-brand-primary",
                      isTodayVal &&
                        "border border-brand-primary text-brand-primary font-bold",
                      isSelected
                        ? "bg-brand-primary text-white hover:bg-brand-primary/95 shadow-md shadow-brand-primary/20"
                        : "text-foreground/90"
                    )}
                  >
                    {toPersianDigits(day)}
                  </button>
                );
              })}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
);

JalaliDatePicker.displayName = "JalaliDatePicker";
