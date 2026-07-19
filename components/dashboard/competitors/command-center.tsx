"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, toPersianDigits } from "@/lib/utils";
import type { CompetitorIntel, CompetitorIntelItem } from "@/lib/competitors/types";
import { ensureActionableMoves, isIntelStale, sortByThreat } from "@/lib/competitors/normalize";
import {
  ANALYZE_COMPETITORS_CREDIT_COST,
  formatRelativeFa,
  TYPE_LABEL,
} from "./shared";
import type { StudioMode } from "./types-ui";

type Props = {
  intel: CompetitorIntel;
  active: CompetitorIntelItem[];
  analyzing: boolean;
  stageHint?: string;
  onRefresh: () => void;
  onOpenWizard: () => void;
  onSetMode: (mode: StudioMode) => void;
  fromValidation?: boolean;
};

export function CommandCenter({
  intel,
  active,
  analyzing,
  stageHint,
  onRefresh,
  onOpenWizard,
  onSetMode,
  fromValidation,
}: Props) {
  const topThreats = sortByThreat(active).slice(0, 3);
  const moves = ensureActionableMoves(intel).filter((m) => m.status === "todo").slice(0, 3);
  const stale = isIntelStale(intel);
  const headline =
    stageHint === "growth"
      ? "جایگاه رقابتی بازار اولیه‌ات"
      : "جایگاه رقابتی ایده‌ات";

  return (
    <div className="space-y-4" dir="rtl">
      {fromValidation && (
        <Card className="p-3 flex items-center justify-between gap-3 border-primary/25 bg-primary/5">
          <p className="text-sm">آمده از اعتبارسنجی — رقبایت را اینجا تکمیل کن.</p>
          <Link href="/dashboard/validation">
            <Button size="sm" variant="outline" className="gap-1.5">
              بازگشت به اعتبارسنجی
            </Button>
          </Link>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">{headline}</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                آخرین پژوهش: {formatRelativeFa(intel.lastResearchedAt || intel.updatedAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {stale && (
                <Badge variant="secondary" className="gap-1 font-normal text-[11px]">
                  <AlertTriangle className="w-3 h-3" />
                  نیاز به تازه‌سازی
                </Badge>
              )}
              <Badge variant="outline" className="font-normal text-[11px]">
                {toPersianDigits(String(active.length))} رقیب فعال
              </Badge>
            </div>
          </div>

          {intel.wedge ? (
            <blockquote className="rounded-xl bg-muted/40 border px-4 py-3 text-sm leading-relaxed">
              <span className="text-xs text-muted-foreground block mb-1">زاویه تمایز</span>
              {intel.wedge}
            </blockquote>
          ) : (
            <p className="text-sm text-muted-foreground">
              هنوز wedge مشخص نیست — یک کشف هوشمند اجرا کن.
            </p>
          )}

          {intel.brief && (
            <p className="text-sm text-muted-foreground leading-relaxed">{intel.brief}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={onRefresh}
              disabled={analyzing}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", analyzing && "animate-spin")} />
              بازتحلیل
              <span className="opacity-70 text-[10px]">
                ({toPersianDigits(String(ANALYZE_COMPETITORS_CREDIT_COST))})
              </span>
            </Button>
            <Button size="sm" variant="outline" onClick={onOpenWizard}>
              <Sparkles className="w-3.5 h-3.5 ms-1" />
              کشف جدید
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onSetMode("compare")}>
              <ArrowLeftRight className="w-3.5 h-3.5 ms-1" />
              مقایسه
            </Button>
            <Link href="/dashboard/validation">
              <Button size="sm" variant="ghost">
                ارسال به اعتبارسنجی
              </Button>
            </Link>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="w-4 h-4 text-primary" />
              بزرگ‌ترین تهدیدها
            </div>
            {topThreats.length === 0 ? (
              <p className="text-xs text-muted-foreground">رقیبی ثبت نشده.</p>
            ) : (
              <ul className="space-y-2">
                {topThreats.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                    <button
                      type="button"
                      className="text-start truncate hover:text-primary"
                      onClick={() => onSetMode("roster")}
                    >
                      {c.name}
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.competitorType && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {TYPE_LABEL[c.competitorType]}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {toPersianDigits(String(c.threatScore || "—"))}/۵
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                قدم بعدی
              </div>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onSetMode("moves")}>
                همه
              </Button>
            </div>
            {moves.length === 0 ? (
              <p className="text-xs text-muted-foreground">قدم فعالی نیست.</p>
            ) : (
              <ul className="space-y-2">
                {moves.map((m) => (
                  <li key={m.id} className="text-sm text-muted-foreground leading-snug">
                    • {m.text}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {intel.whiteSpace && intel.whiteSpace.length > 0 && (
            <Card className="p-4 space-y-2">
              <p className="text-sm font-semibold">فضای سفید</p>
              <ul className="space-y-1">
                {intel.whiteSpace.slice(0, 3).map((w) => (
                  <li key={w} className="text-xs text-muted-foreground">
                    • {w}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
