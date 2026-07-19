"use client";

import { useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, toPersianDigits } from "@/lib/utils";
import type {
  CompetitorConfidence,
  CompetitorIntelItem,
  CompetitorScope,
} from "@/lib/competitors/types";
import {
  CONFIDENCE_LABEL,
  SCOPE_LABEL,
  TYPE_LABEL,
} from "./shared";

type ScopeFilter = "all" | CompetitorScope | "iranian" | "global";

type Props = {
  items: CompetitorIntelItem[];
  dismissed: CompetitorIntelItem[];
  onPersistItem: (id: string, patch: Partial<CompetitorIntelItem>) => void;
  onDismiss: (id: string) => void;
  onRestore: (id: string) => void;
};

export function RosterPanel({
  items,
  dismissed,
  onPersistItem,
  onDismiss,
  onRestore,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [showDismissed, setShowDismissed] = useState(false);

  const filtered = items.filter((c) => {
    switch (scopeFilter) {
      case "all":
        return true;
      case "iranian":
        return c.isIranian !== false;
      case "global":
        return c.isIranian === false || c.scope === "global";
      case "local":
      case "national":
      case "regional":
        return c.scope === scopeFilter;
      default: {
        const _exhaustive: never = scopeFilter;
        return _exhaustive;
      }
    }
  });

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="font-semibold">
          فهرست رقبا{" "}
          <span className="text-muted-foreground font-normal text-sm">
            ({toPersianDigits(String(items.length))})
          </span>
        </h2>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["all", "همه"],
              ["iranian", "ایرانی"],
              ["local", "محلی"],
              ["national", "ملی"],
              ["global", "جهانی"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setScopeFilter(key)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] border transition-colors",
                scopeFilter === key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((c) => {
          const open = expandedId === c.id;
          return (
            <Card
              key={c.id}
              className={cn("overflow-hidden transition-shadow", open && "ring-1 ring-primary/40")}
            >
              <button
                type="button"
                className="w-full text-start p-4 flex items-start gap-3"
                onClick={() => setExpandedId(open ? null : c.id)}
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {c.isIranian === false ? (
                    <Globe className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold truncate">{c.name}</span>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {c.isIranian === false ? "بین‌المللی" : "ایرانی"}
                    </Badge>
                    {c.scope && (
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {SCOPE_LABEL[c.scope]}
                      </Badge>
                    )}
                    {c.competitorType && (
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {TYPE_LABEL[c.competitorType]}
                      </Badge>
                    )}
                    {c.threatScore && (
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        تهدید {toPersianDigits(String(c.threatScore))}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {c.tagline || c.productSummary || c.strength || "بدون خلاصه"}
                  </p>
                </div>
                {open ? (
                  <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                )}
              </button>

              {open && (
                <div className="px-4 pb-4 space-y-3 border-t pt-3">
                  <Field
                    label="نام"
                    value={c.name}
                    onChange={(v) => onPersistItem(c.id, { name: v })}
                  />
                  <Field
                    label="تگ‌لاین"
                    value={c.tagline || ""}
                    onChange={(v) => onPersistItem(c.id, { tagline: v })}
                  />
                  <Field
                    label="خلاصه محصول"
                    value={c.productSummary || ""}
                    onChange={(v) => onPersistItem(c.id, { productSummary: v })}
                    multiline
                  />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field
                      label="قوت"
                      value={c.strength}
                      onChange={(v) => onPersistItem(c.id, { strength: v })}
                      multiline
                    />
                    <Field
                      label="ضعف"
                      value={c.weakness}
                      onChange={(v) => onPersistItem(c.id, { weakness: v })}
                      multiline
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field
                      label="سیگنال قیمت"
                      value={c.pricingSignal || ""}
                      onChange={(v) => onPersistItem(c.id, { pricingSignal: v })}
                    />
                    <Field
                      label="مخاطب هدف"
                      value={c.targetSegment || ""}
                      onChange={(v) => onPersistItem(c.id, { targetSegment: v })}
                    />
                  </div>
                  <Field
                    label="وب‌سایت"
                    value={c.url || ""}
                    onChange={(v) => onPersistItem(c.id, { url: v })}
                  />
                  <Field
                    label="کانال"
                    value={c.channel || ""}
                    onChange={(v) => onPersistItem(c.id, { channel: v })}
                  />
                  <Field
                    label="نقاط ورود شما (با ؛ جدا کنید)"
                    value={(c.entryPoints || []).join("؛ ")}
                    onChange={(v) =>
                      onPersistItem(c.id, {
                        entryPoints: v
                          .split(/[؛;]/)
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                      {CONFIDENCE_LABEL[(c.confidence || "medium") as CompetitorConfidence]}
                    </span>
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        باز کردن سایت <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {c.citations && c.citations.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">منابع</p>
                      <ul className="space-y-1">
                        {c.citations.map((cit) => (
                          <li key={cit.url}>
                            <a
                              href={cit.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline truncate block"
                            >
                              {cit.title || cit.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive gap-1.5"
                      onClick={() => onDismiss(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      کنار گذاشتن
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            رقیبی با این فیلتر نیست.
          </Card>
        )}
      </div>

      {dismissed.length > 0 && (
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowDismissed((v) => !v)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            کنارگذاشته‌ها ({toPersianDigits(String(dismissed.length))})
          </Button>
          {showDismissed && (
            <div className="mt-2 space-y-2">
              {dismissed.map((c) => (
                <Card key={c.id} className="p-3 flex items-center justify-between gap-2 opacity-80">
                  <span className="text-sm truncate">{c.name}</span>
                  <Button size="sm" variant="outline" onClick={() => onRestore(c.id)}>
                    بازگردانی
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary";
  return (
    <label className="block space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          className={cn(className, "min-h-[72px] resize-y")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
