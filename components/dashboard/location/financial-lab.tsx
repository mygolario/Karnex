"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocation } from "./location-context";
import { ConfidenceBadge } from "./confidence-badge";
import { RevenueProjectionChart } from "./revenue-projection-chart";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialLabProps {
  initialRent?: number;
}

export function FinancialLab({ initialRent = 25000000 }: FinancialLabProps) {
  const { analysis } = useLocation();
  const rb = analysis?.rentBenchmark;

  const [rent, setRent] = useState(initialRent);
  const [avgTicket, setAvgTicket] = useState(250000);
  const [dailyCustomers, setDailyCustomers] = useState(45);
  const [cogsPercent, setCogsPercent] = useState(35);
  const [salaries, setSalaries] = useState(18000000);
  const [utilities, setUtilities] = useState(4000000);
  const [marketing, setMarketing] = useState(3000000);
  const [scenario, setScenario] = useState<"pessimistic" | "realistic" | "optimistic">("realistic");
  const [sensRent, setSensRent] = useState(false);
  const [sensFootfall, setSensFootfall] = useState(false);

  const mult =
    scenario === "pessimistic" ? 0.8 : scenario === "optimistic" ? 1.2 : 1;
  const effRent = sensRent ? rent * 1.1 : rent;
  const effCustomers = sensFootfall ? dailyCustomers * 0.8 : dailyCustomers;

  const monthlyRevenue = avgTicket * effCustomers * 30 * mult;
  const variableCosts = monthlyRevenue * (cogsPercent / 100);
  const fixedCosts = effRent + salaries + utilities + marketing;
  const netProfit = monthlyRevenue - variableCosts - fixedCosts;
  const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;
  const marginPerCustomer = avgTicket * (1 - cogsPercent / 100);
  const dailyBreakEven =
    marginPerCustomer > 0 ? Math.ceil(fixedCosts / 30 / marginPerCustomer) : 0;
  const paybackMonths =
    netProfit > 0 ? Math.ceil((effRent * 3) / netProfit) : null;
  const roiPercent =
    netProfit > 0 ? ((netProfit * 12) / (effRent * 3 + salaries)) * 100 : 0;

  const pnl12 = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const ramp = Math.min(1, 0.5 + i * 0.05) * mult;
      const rev = avgTicket * effCustomers * 30 * ramp;
      const varC = rev * (cogsPercent / 100);
      const net = rev - varC - fixedCosts;
      return { month: i + 1, revenue: rev, net };
    });
  }, [avgTicket, effCustomers, cogsPercent, fixedCosts, mult]);

  const toToman = (val: number) => val.toLocaleString("fa-IR") + " تومان";

  return (
    <div className="space-y-4 dir-rtl">
      {rb && (
        <Card className="p-4 border-white/5 bg-card/30">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-bold text-sm">بنچمارک اجاره محله</span>
            <ConfidenceBadge level={rb.confidence} />
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {toToman(rb.min)} — {toToman(rb.max)} (میانه: {toToman(rb.median)})
          </p>
          {rb.negotiationTips?.length > 0 && (
            <ul className="text-[11px] space-y-1">
              {rb.negotiationTips.slice(0, 3).map((t, i) => (
                <li key={i}>• {t}</li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Card className="p-6 bg-card/30 border-white/5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <DollarSign className="text-primary size-5" />
            آزمایشگاه مالی
          </h4>
          <div className="flex gap-1">
            {(["pessimistic", "realistic", "optimistic"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScenario(s)}
                className={cn(
                  "text-[10px] px-2 py-1 rounded-full border",
                  scenario === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 text-muted-foreground"
                )}
              >
                {s === "pessimistic" ? "بدبین" : s === "optimistic" ? "خوش‌بین" : "پایه"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[
              { label: "اجاره", val: rent, set: setRent, max: 150000000, step: 1000000 },
              { label: "میانگین فاکتور", val: avgTicket, set: setAvgTicket, max: 2500000, step: 10000 },
              { label: "مشتری روزانه", val: dailyCustomers, set: setDailyCustomers, max: 200, step: 1 },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-bold">{s.label.includes("مشتری") ? s.val : toToman(s.val)}</span>
                </div>
                <Slider
                  value={[s.val]}
                  min={s.label.includes("مشتری") ? 5 : 0}
                  max={s.max}
                  step={s.step}
                  onValueChange={(v) => s.set(v[0])}
                />
              </div>
            ))}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={sensRent} onCheckedChange={setSensRent} id="sens-rent" />
                <Label htmlFor="sens-rent" className="text-[10px]">+۱۰٪ اجاره</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={sensFootfall} onCheckedChange={setSensFootfall} id="sens-foot" />
                <Label htmlFor="sens-foot" className="text-[10px]">−۲۰٪ پاخور</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-muted-foreground mb-1">درآمد ماهانه</p>
              <p className="font-black">{toToman(Math.round(monthlyRevenue))}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-muted-foreground mb-1">سود خالص</p>
              <p className={cn("font-black", netProfit >= 0 ? "text-emerald-400" : "text-rose-400")}>
                {toToman(Math.round(netProfit))}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-muted-foreground mb-1">نقطه سربه‌سر روزانه</p>
              <p className="font-black">{dailyBreakEven} مشتری</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-muted-foreground mb-1">بازگشت سرمایه</p>
              <p className="font-black">{paybackMonths ? `${paybackMonths} ماه` : "—"}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 col-span-2">
              <p className="text-muted-foreground mb-1">ROI سالانه (تخمینی)</p>
              <Badge variant={roiPercent > 0 ? "outline" : "danger"}>{roiPercent.toFixed(0)}٪</Badge>
              <span className="mr-2 text-muted-foreground">حاشیه: {profitMargin.toFixed(1)}٪</span>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-muted-foreground border-b border-white/5">
                <th className="py-2 text-right">ماه</th>
                <th className="py-2 text-right">درآمد</th>
                <th className="py-2 text-right">سود</th>
              </tr>
            </thead>
            <tbody>
              {pnl12.map((row) => (
                <tr key={row.month} className="border-b border-white/[0.03]">
                  <td className="py-1.5">{row.month}</td>
                  <td className="py-1.5">{toToman(Math.round(row.revenue))}</td>
                  <td className={cn("py-1.5", row.net >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {toToman(Math.round(row.net))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <RevenueProjectionChart />
    </div>
  );
}
