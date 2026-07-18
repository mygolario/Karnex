"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  LayoutTemplate,
  PenLine,
  FileSpreadsheet,
  Users,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeckHomeProps {
  projectName: string;
  contextLabels: string[];
  onSmartGenerate: () => void;
  onFromCanvas: () => void;
  onManual: () => void;
  className?: string;
}

export function DeckHome({
  projectName,
  contextLabels,
  onSmartGenerate,
  onFromCanvas,
  onManual,
  className,
}: DeckHomeProps) {
  return (
    <div
      className={cn(
        "relative h-full min-h-[70vh] overflow-hidden rounded-3xl border border-border/60",
        "bg-gradient-to-br from-background via-background to-primary/5",
        className
      )}
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 -start-16 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute -bottom-20 -end-10 h-64 w-64 rounded-full bg-orange-400/15 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/25"
        >
          <LayoutTemplate className="h-8 w-8 text-white" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-2 text-sm font-bold tracking-wide text-primary"
        >
          کارنکس · پیچ‌دک
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-3 max-w-xl text-3xl font-black leading-tight md:text-4xl"
        >
          ساخت پیچ‌دک سرمایه‌گذاری
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base"
        >
          برای «{projectName || "پروژه شما"}» یک ارائه فارسی حرفه‌ای بسازید، ویرایش کنید و
          به‌صورت پاورپوینت دانلود کنید.
        </motion.p>

        {contextLabels.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mb-8 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-xs text-muted-foreground">زمینه آماده:</span>
            {contextLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {label === "بوم ناب" && <FileSpreadsheet size={12} />}
                {label === "رقبا" && <Users size={12} />}
                {label === "نقشه راه" && <Map size={12} />}
                {label}
              </span>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Button
            size="lg"
            onClick={onSmartGenerate}
            className="h-12 flex-1 rounded-xl bg-gradient-to-l from-primary to-orange-500 font-bold text-white shadow-lg shadow-primary/20 hover:brightness-110"
          >
            <Sparkles className="ms-2" size={18} />
            تولید هوشمند
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onFromCanvas}
            className="h-12 flex-1 rounded-xl border-primary/30 font-bold"
          >
            <FileSpreadsheet className="ms-2" size={18} />
            شروع از بوم
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={onManual}
            className="h-12 rounded-xl font-medium text-muted-foreground"
          >
            <PenLine className="ms-2" size={16} />
            ساخت دستی
          </Button>
        </motion.div>

        <p className="mt-6 text-[11px] text-muted-foreground">
          تولید هوشمند از اعتبار هوش مصنوعی استفاده می‌کند — قبل از شروع تأیید می‌کنید.
        </p>
      </div>
    </div>
  );
}
