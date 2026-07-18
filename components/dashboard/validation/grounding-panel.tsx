"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Building2, Globe2, Loader2, RefreshCw } from "lucide-react";
import type { GroundingMarketSnippet } from "@/lib/validation/types";

export function GroundingPanel({
  competitorsSummary,
  competitorCount,
  marketSnippet,
  onPullMarket,
  marketLoading,
  onMarkCompetitorsVisited,
}: {
  competitorsSummary: string;
  competitorCount: number;
  marketSnippet?: GroundingMarketSnippet | null;
  onPullMarket: () => void;
  marketLoading?: boolean;
  onMarkCompetitorsVisited: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold">بازار و رقبا</h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          نقد را با داده واقعی پروژه زمین‌گیر کن — عددسازی جعلی ممنوع.
        </p>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-500" />
            رقبا
          </h4>
          {competitorCount > 0 ? (
            <Badge variant="outline" className="text-[10px]">
              {competitorCount} رقیب
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-amber-600">
              هنوز خالی
            </Badge>
          )}
        </div>
        {competitorsSummary ? (
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
            {competitorsSummary.slice(0, 800)}
          </pre>
        ) : (
          <p className="text-xs text-muted-foreground">
            هنوز رقیب ذخیره‌شده‌ای نیست. اول فضای رقبا را پر کن، بعد بازامتیاز بگیر.
          </p>
        )}
        <Button asChild size="sm" variant="outline" onClick={onMarkCompetitorsVisited}>
          <Link href="/dashboard/competitors?from=validation">
            باز کردن تحلیل رقبا
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-ai" />
            سیگنال بازار (روندها)
          </h4>
          {marketSnippet?.pulledAt && (
            <Badge variant="outline" className="text-[10px]">
              دریافت‌شده
            </Badge>
          )}
        </div>
        {marketSnippet?.summary ? (
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {marketSnippet.summary}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            یک برداشت سبک از روندهای مرتبط بگیر (هزینه اعتبار جداگانهٔ تحلیل بازار).
          </p>
        )}
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={marketLoading}
          onClick={onPullMarket}
        >
          {marketLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {marketSnippet ? "بروزرسانی روند بازار" : "دریافت روند بازار"}
        </Button>
      </div>
    </div>
  );
}
