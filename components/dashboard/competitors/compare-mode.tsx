"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, toPersianDigits } from "@/lib/utils";
import type { CompetitorIntel, CompetitorIntelItem } from "@/lib/competitors/types";

type Props = {
  intel: CompetitorIntel;
  active: CompetitorIntelItem[];
};

export function CompareMode({ intel, active }: Props) {
  const dimensions =
    intel.matrixDimensions?.length
      ? intel.matrixDimensions
      : ["عمق محصول", "دسترسی قیمت", "حضور محلی", "اعتماد برند", "توزیع و کانال"];

  const [selected, setSelected] = useState<string[]>(() =>
    active.slice(0, Math.min(3, active.length)).map((c) => c.id)
  );

  const cols = useMemo(() => {
    const rivals = active.filter((c) => selected.includes(c.id)).slice(0, 4);
    return rivals;
  }, [active, selected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const youRatings = intel.yourRatings || {};

  const verdict = (dim: string, rival: CompetitorIntelItem) => {
    const yours = youRatings[dim] || 0;
    const theirs = rival.ratings?.[dim] || 0;
    if (!yours || !theirs) return "—";
    if (yours > theirs) return "شما";
    if (yours < theirs) return "آن‌ها";
    return "مساوی";
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h2 className="font-semibold">مقایسه رودررو</h2>
        <p className="text-xs text-muted-foreground mt-1">
          تا ۴ رقیب انتخاب کن و ببین کجا می‌بری.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {active.map((c) => {
          const on = selected.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs border transition-colors",
                on
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted"
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {cols.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          حداقل یک رقیب انتخاب کن.
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-muted/40 text-start">
                  <th className="p-3 font-medium">بُعد</th>
                  <th className="p-3 font-medium">شما</th>
                  {cols.map((c) => (
                    <th key={c.id} className="p-3 font-medium">
                      {c.name}
                    </th>
                  ))}
                  <th className="p-3 font-medium">برنده</th>
                </tr>
              </thead>
              <tbody>
                {dimensions.map((dim) => (
                  <tr key={dim} className="border-t">
                    <td className="p-3 text-muted-foreground">{dim}</td>
                    <td className="p-3">
                      {toPersianDigits(String(youRatings[dim] || "—"))}
                    </td>
                    {cols.map((c) => (
                      <td key={c.id} className="p-3">
                        {toPersianDigits(String(c.ratings?.[dim] || "—"))}
                      </td>
                    ))}
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {cols.map((c) => {
                          const v = verdict(dim, c);
                          return (
                            <Badge
                              key={c.id}
                              variant={v === "شما" ? "default" : "outline"}
                              className="text-[10px] font-normal"
                            >
                              {v}
                            </Badge>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Card className="p-4 space-y-3">
            <p className="text-sm font-medium">نمای رادار (ساده)</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <RadarBars label="شما" values={dimensions.map((d) => youRatings[d] || 0)} dims={dimensions} />
              {cols.map((c) => (
                <RadarBars
                  key={c.id}
                  label={c.name}
                  values={dimensions.map((d) => c.ratings?.[d] || 0)}
                  dims={dimensions}
                />
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function RadarBars({
  label,
  values,
  dims,
}: {
  label: string;
  values: number[];
  dims: string[];
}) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <p className="text-xs font-medium truncate">{label}</p>
      {dims.map((d, i) => (
        <div key={d} className="space-y-0.5">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span className="truncate">{d}</span>
            <span>{toPersianDigits(String(values[i] || 0))}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${((values[i] || 0) / 5) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
