"use client";

import { useState } from "react";
import { Globe2, Layers, MapPinned, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, toPersianDigits } from "@/lib/utils";
import type {
  CompetitorDiscoveryOptions,
  DiscoveryFocus,
  DiscoveryGeography,
} from "@/lib/competitors/types";
import { ANALYZE_COMPETITORS_CREDIT_COST } from "./shared";

const GEO_OPTIONS: { id: DiscoveryGeography; label: string; hint: string }[] = [
  { id: "both", label: "ایران و بین‌الملل", hint: "بهترین برای استراتژی محصول" },
  { id: "iran", label: "تمرکز ایران", hint: "رقبای فارسی‌زبان و محلی" },
  { id: "international", label: "تمرکز بین‌الملل", hint: "الگوهای جهانی و SaaS" },
];

const FOCUS_OPTIONS: { id: DiscoveryFocus; label: string }[] = [
  { id: "all", label: "همه انواع" },
  { id: "direct", label: "مستقیم" },
  { id: "indirect", label: "غیرمستقیم" },
  { id: "substitutes", label: "جایگزین" },
];

const COUNT_OPTIONS = [4, 6, 8] as const;

type Props = {
  projectName?: string;
  analyzing: boolean;
  onDiscover: (options: CompetitorDiscoveryOptions) => void;
  onManual: () => void;
  onImportSeeds: () => void;
  onCancel?: () => void;
};

export function DiscoveryWizard({
  projectName,
  analyzing,
  onDiscover,
  onManual,
  onImportSeeds,
  onCancel,
}: Props) {
  const [step, setStep] = useState(0);
  const [geography, setGeography] = useState<DiscoveryGeography>("both");
  const [focus, setFocus] = useState<DiscoveryFocus>("all");
  const [count, setCount] = useState<number>(6);

  const run = () => onDiscover({ geography, focus, count });

  return (
    <div className="rounded-xl border bg-card overflow-hidden" dir="rtl">
      <div className="relative px-6 sm:px-10 pt-10 pb-8 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="absolute inset-0 pointer-events-none opacity-[0.35] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative max-w-xl mx-auto space-y-4 text-center">
          <Badge variant="outline" className="font-normal">
            {projectName || "پروژه"}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            رقبای واقعی بازارت را پیدا کن
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            با جستجوی زنده وب (ایران و بین‌الملل) جایگاهت را روشن کن — نه فقط یک لیست اسم.
          </p>
        </div>
      </div>

      <div className="px-6 sm:px-10 pb-8 space-y-6 max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-10 rounded-full transition-colors",
                step >= i ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPinned className="w-4 h-4 text-primary" />
              پوشش جغرافیایی
            </div>
            <div className="grid gap-2">
              {GEO_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGeography(opt.id)}
                  className={cn(
                    "text-start rounded-xl border p-3 transition-colors",
                    geography === opt.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.hint}</p>
                </button>
              ))}
            </div>
            <Button className="w-full" onClick={() => setStep(1)}>
              ادامه
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layers className="w-4 h-4 text-primary" />
              نوع رقبا
            </div>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFocus(opt.id)}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm border transition-colors",
                    focus === opt.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                قبلی
              </Button>
              <Button className="flex-1" onClick={() => setStep(2)}>
                ادامه
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4 text-primary" />
              چند رقیب پیدا کنیم؟
            </div>
            <div className="flex gap-2">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={cn(
                    "flex-1 py-3 rounded-xl border text-sm font-medium transition-colors",
                    count === n
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  {toPersianDigits(String(n))}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
              <Globe2 className="w-3.5 h-3.5" />
              هزینه این کشف: {toPersianDigits(String(ANALYZE_COMPETITORS_CREDIT_COST))} اعتبار
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                قبلی
              </Button>
              <Button className="flex-1 gap-2" onClick={run} disabled={analyzing}>
                <Sparkles className="w-4 h-4" />
                {analyzing ? "در حال کشف…" : "کشف با هوش مصنوعی"}
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onManual}>
            افزودن دستی
          </Button>
          <Button variant="ghost" size="sm" onClick={onImportSeeds}>
            وارد کردن از پلن / برند
          </Button>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              انصراف
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
