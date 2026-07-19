"use client";

import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BusinessPlan } from "@/lib/db";
import type { CompetitorIntel, CompetitorIntelItem } from "@/lib/competitors/types";
import { buildBattleCardMarkdown } from "@/lib/competitors/normalize";
import { TYPE_LABEL } from "./shared";
import { cn } from "@/lib/utils";

type Props = {
  plan: BusinessPlan;
  intel: CompetitorIntel;
  active: CompetitorIntelItem[];
};

export function BattleCardsPanel({ plan, intel, active }: Props) {
  const [selectedId, setSelectedId] = useState(active[0]?.id || "");
  const [copied, setCopied] = useState(false);
  const selected = active.find((c) => c.id === selectedId) || active[0];

  if (!selected) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground" dir="rtl">
        برای ساخت کارت نبرد ابتدا رقیب اضافه کن.
      </Card>
    );
  }

  const md = buildBattleCardMarkdown(plan, intel, selected);

  const copy = async () => {
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("کارت نبرد کپی شد");
  };

  const download = () => {
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `battle-${selected.name}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("دانلود شد");
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h2 className="font-semibold">کارت‌های نبرد</h2>
        <p className="text-xs text-muted-foreground mt-1">
          یک صفحه «چطور از این رقیب می‌بریم» برای تیم محصول و فروش.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {active.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs border",
              selected.id === c.id
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{selected.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {selected.competitorType && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  {TYPE_LABEL[selected.competitorType]}
                </Badge>
              )}
              {selected.pricingSignal && (
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {selected.pricingSignal}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={copy}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              کپی
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={download}>
              <Download className="w-3.5 h-3.5" />
              دانلود
            </Button>
          </div>
        </div>

        {intel.wedge && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 text-sm">
            <p className="text-xs text-muted-foreground mb-1">زاویه تمایز ما</p>
            {intel.wedge}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">قوت آن‌ها</p>
            <p>{selected.strength || "—"}</p>
          </div>
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">ضعف آن‌ها</p>
            <p>{selected.weakness || "—"}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">چطور می‌بریم</p>
          <ul className="space-y-2">
            {(selected.entryPoints?.length
              ? selected.entryPoints
              : ["روی ضعف‌های آن‌ها تمرکز کن و wedge خودت را برجسته کن."]
            ).map((e) => (
              <li key={e} className="text-sm flex gap-2">
                <span className="text-primary">✓</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
