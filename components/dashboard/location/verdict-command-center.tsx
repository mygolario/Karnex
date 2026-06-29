"use client";

import { VerdictBanner } from "./verdict-banner";
import { useLocation } from "./location-context";
import { XCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerdictCommandCenter() {
  const { analysis } = useLocation();
  const vd = analysis?.verdictDetails;

  return (
    <div className="space-y-4">
      <VerdictBanner />
      {vd && (vd.dealBreakers?.length > 0 || vd.topReasons?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 dir-rtl">
          {vd.topReasons && vd.topReasons.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 size={14} />
                دلایل ادامه
              </div>
              <ul className="space-y-1.5">
                {vd.topReasons.slice(0, 3).map((r, i) => (
                  <li key={i} className="text-xs text-foreground/90 leading-relaxed">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {vd.dealBreakers && vd.dealBreakers.length > 0 && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
              <div className="flex items-center gap-2 mb-2 text-rose-400 text-xs font-bold">
                <XCircle size={14} />
                ریسک‌های جدی
              </div>
              <ul className="space-y-1.5">
                {vd.dealBreakers.slice(0, 3).map((r, i) => (
                  <li key={i} className="text-xs text-foreground/90 leading-relaxed">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function VerdictChip({ className }: { className?: string }) {
  const { analysis } = useLocation();
  if (!analysis?.verdict) return null;

  const v = analysis.verdict;
  const color =
    v.decision === "go"
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : v.decision === "no-go"
        ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
        : "text-amber-400 border-amber-500/30 bg-amber-500/10";

  const short =
    v.decision === "go" ? "برو" : v.decision === "no-go" ? "نرو" : "احتیاط";

  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap",
        color,
        className
      )}
    >
      {short} · {analysis.score}/10 · {v.confidence}٪
    </span>
  );
}
