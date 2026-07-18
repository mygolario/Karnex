"use client";

import { useEffect, useState } from "react";
import { Loader2, Zap, Coins, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageData {
  period: { start: string; end: string };
  totals: {
    requests: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
    failed: number;
  };
  byFeature: Record<string, { requests: number; costUsd: number; tokens: number }>;
}

const FEATURE_LABELS: Record<string, string> = {
  copilot_chat: "گفتگوی دستیار",
  ai_generate: "تولید محتوا",
  tool_call: "فراخوانی ابزار",
  customer_bot: "ربات مشتری",
  other: "سایر",
};

export function CopilotUsage({ projectId }: { projectId?: string }) {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/copilot/usage${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center py-3">
        <Loader2 className="animate-spin text-muted-foreground" size={16} />
      </div>
    );
  }
  if (!data) {
    return <p className="text-[11px] text-muted-foreground text-center py-2">داده مصرف در دسترس نیست.</p>;
  }

  const t = data.totals;
  const cost = t.costUsd.toFixed(4);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
        <Zap size={12} className="text-ai" />
        مصرف این ماه
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <Stat label="درخواست" value={String(t.requests)} />
        <Stat label="توکن" value={formatTokens(t.totalTokens)} />
        <Stat label="هزینه ($)" value={cost} />
      </div>
      {t.failed > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-500">
          <AlertCircle size={11} />
          {t.failed} درخواست ناموفق
        </div>
      )}
      {Object.keys(data.byFeature).length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="text-[10px] font-semibold text-muted-foreground/70">بر اساس قابلیت</p>
          {Object.entries(data.byFeature)
            .sort((a, b) => b[1].requests - a[1].requests)
            .map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{FEATURE_LABELS[k] || k}</span>
                <span className="font-medium tabular-nums">
                  {v.requests} · {formatTokens(v.tokens)}
                  <Coins size={10} className="inline ms-1 text-muted-foreground/60" />
                  {v.costUsd.toFixed(4)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-lg bg-muted/40 border border-border/40 px-2 py-1.5 text-center")}>
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="text-xs font-bold tabular-nums truncate">{value}</p>
    </div>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
