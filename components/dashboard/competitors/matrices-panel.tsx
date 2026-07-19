"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, toPersianDigits } from "@/lib/utils";
import type {
  CompetitorIntel,
  CompetitorIntelItem,
  FeatureCell,
} from "@/lib/competitors/types";

type MatrixTab = "ratings" | "features" | "swot";

type SwotArrays = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

type Props = {
  intel: CompetitorIntel;
  active: CompetitorIntelItem[];
  swotArrays: SwotArrays;
  onSetRating: (target: "you" | string, dim: string, value: 1 | 2 | 3 | 4 | 5) => void;
  onCycleFeature: (rowId: string, colId: string) => void;
  onAddFeatureRow: () => void;
  onSwotChange: (next: SwotArrays) => void;
};

export function MatricesPanel({
  intel,
  active,
  swotArrays,
  onSetRating,
  onCycleFeature,
  onAddFeatureRow,
  onSwotChange,
}: Props) {
  const [tab, setTab] = useState<MatrixTab>("ratings");
  const dimensions =
    intel.matrixDimensions?.length
      ? intel.matrixDimensions
      : ["عمق محصول", "دسترسی قیمت", "حضور محلی", "اعتماد برند", "توزیع و کانال"];

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap gap-1">
        {(
          [
            ["ratings", "امتیازها"],
            ["features", "ویژگی‌ها"],
            ["swot", "SWOT"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs border transition-colors",
              tab === id
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "ratings" && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="bg-muted/40">
                <th className="p-3 text-start font-medium">بُعد</th>
                <th className="p-3 text-start font-medium">شما</th>
                {active.map((c) => (
                  <th key={c.id} className="p-3 text-start font-medium truncate max-w-[120px]">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dim) => (
                <tr key={dim} className="border-t">
                  <td className="p-3 text-muted-foreground">{dim}</td>
                  <td className="p-3">
                    <RatingPicker
                      value={intel.yourRatings?.[dim]}
                      onPick={(v) => onSetRating("you", dim, v)}
                    />
                  </td>
                  {active.map((c) => (
                    <td key={c.id} className="p-3">
                      <RatingPicker
                        value={c.ratings?.[dim]}
                        onPick={(v) => onSetRating(c.id, dim, v)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {active.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              ابتدا رقیب اضافه کن.
            </p>
          )}
        </div>
      )}

      {tab === "features" && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-muted/40">
                  <th className="p-3 text-start font-medium">ویژگی</th>
                  <th className="p-3 text-start font-medium">شما</th>
                  {active.map((c) => (
                    <th key={c.id} className="p-3 text-start font-medium">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(intel.featureRows || []).map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-3">{row.label}</td>
                    <td className="p-3">
                      <FeatureChip
                        value={row.cells.you || "no"}
                        onClick={() => onCycleFeature(row.id, "you")}
                      />
                    </td>
                    {active.map((c) => (
                      <td key={c.id} className="p-3">
                        <FeatureChip
                          value={row.cells[c.id] || "no"}
                          onClick={() => onCycleFeature(row.id, c.id)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {(intel.featureRows || []).length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                هنوز ردیف ویژگی نداری.
              </p>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={onAddFeatureRow}>
            افزودن ردیف ویژگی
          </Button>
        </div>
      )}

      {tab === "swot" && (
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              ["strengths", "قوت‌ها"],
              ["weaknesses", "ضعف‌ها"],
              ["opportunities", "فرصت‌ها"],
              ["threats", "تهدیدها"],
            ] as const
          ).map(([key, label]) => (
            <Card key={key} className="p-3 space-y-2">
              <p className="text-sm font-medium">{label}</p>
              <textarea
                className="w-full min-h-[100px] rounded-lg border bg-background px-3 py-2 text-sm resize-y"
                value={swotArrays[key].join("\n")}
                onChange={(e) =>
                  onSwotChange({
                    ...swotArrays,
                    [key]: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="هر خط یک مورد"
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RatingPicker({
  value,
  onPick,
}: {
  value?: number;
  onPick: (v: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPick(n)}
          className={cn(
            "w-6 h-6 rounded text-[10px] border",
            value === n
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:bg-muted"
          )}
        >
          {toPersianDigits(String(n))}
        </button>
      ))}
    </div>
  );
}

function FeatureChip({
  value,
  onClick,
}: {
  value: FeatureCell;
  onClick: () => void;
}) {
  const label =
    value === "yes" ? "بله" : value === "partial" ? "نسبی" : "خیر";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2 py-1 rounded-md text-[11px] border",
        value === "yes" && "bg-primary/10 border-primary/30",
        value === "partial" && "bg-muted",
        value === "no" && "opacity-70"
      )}
    >
      {label}
    </button>
  );
}
