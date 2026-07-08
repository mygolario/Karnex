"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, ChevronDown, ChevronUp, AlertOctagon, TrendingDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialSimulatorProps {
  initialRent?: number;
}

type StressScenario = "normal" | "traffic_drop" | "inflation" | "crisis";

export function FinancialSimulator({ initialRent = 25000000 }: FinancialSimulatorProps) {
  // Core Sliders
  const [rent, setRent] = useState<number>(initialRent);
  const [avgTicket, setAvgTicket] = useState<number>(200000); // 200,000 Tomans default
  const [dailyCustomers, setDailyCustomers] = useState<number>(45);

  // Advanced settings toggling
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced Variables
  const [cogsPercent, setCogsPercent] = useState<number>(35); // 35% default cost of goods sold
  const [salaries, setSalaries] = useState<number>(20000000); // 20 million Tomans staff default
  const [utilities, setUtilities] = useState<number>(4000000); // 4 million Tomans utilities default

  // Stress Testing Scenario State
  const [stressScenario, setStressScenario] = useState<StressScenario>("normal");

  // Apply Stress Modifiers
  let trafficModifier = 1.0;
  let costModifier = 1.0;

  if (stressScenario === "traffic_drop") {
    trafficModifier = 0.75; // 25% drop
  } else if (stressScenario === "inflation") {
    costModifier = 1.20; // 20% increase
  } else if (stressScenario === "crisis") {
    trafficModifier = 0.70; // 30% drop
    costModifier = 1.20; // 20% cost increase
  }

  // Adjusted Calculations
  const adjustedCustomers = Math.round(dailyCustomers * trafficModifier);
  const monthlyRevenue = avgTicket * adjustedCustomers * 30;
  const variableCosts = monthlyRevenue * ((cogsPercent * costModifier) / 100);
  const fixedCosts = rent + (salaries + utilities) * costModifier;
  const totalCosts = fixedCosts + variableCosts;
  const netProfit = monthlyRevenue - totalCosts;
  
  const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;
  const rentToRevenue = monthlyRevenue > 0 ? (rent / monthlyRevenue) * 100 : 0;

  // Daily customers required to break even
  const marginPerCustomer = avgTicket * (1 - (cogsPercent * costModifier) / 100);
  const dailyBreakEven = marginPerCustomer > 0 ? Math.ceil((rent + (salaries + utilities) * costModifier) / 30 / marginPerCustomer) : 0;

  // Maximum sustainable rent (Safe limit: rent shouldn't exceed 15% of revenue, or profit margin must be at least 15%)
  // Max Rent = (Revenue * (1 - COGS/100)) - Salaries - Utilities - (Revenue * 0.15 [Desired Margin])
  const maxSustainableRent = Math.max(
    0,
    Math.round(
      (monthlyRevenue * (1 - (cogsPercent * costModifier) / 100)) - 
      (salaries + utilities) * costModifier - 
      (monthlyRevenue * 0.15)
    )
  );

  const toToman = (val: number) => {
    return val.toLocaleString("fa-IR") + " تومان";
  };

  return (
    <Card className="p-6 bg-slate-900/30 border-white/5 shadow-xl backdrop-blur-md dir-rtl text-right">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h4 className="font-bold text-base flex items-center gap-2 text-white">
            <DollarSign className="text-violet-400 size-5" />
            شبیه‌ساز توجیه مالی و سودآوری محلی
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            سنجش وضعیت سر‌به‌سر، سود خالص صنف شما و بررسی سناریوهای بحران در این لوکیشن.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stressScenario !== "normal" && (
            <Badge variant="outline" className="border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] gap-1 flex items-center">
              <AlertOctagon size={10} />
              شبیه‌ساز بحران فعال
            </Badge>
          )}
          <Badge variant={netProfit >= 0 ? "outline" : "outline"} className={cn(
            "text-xs px-2.5 py-1 font-bold border",
            netProfit >= 0 ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-rose-500/20 bg-rose-500/10 text-rose-400"
          )}>
            {netProfit >= 0 ? "سودده" : "زیان‌ده"}
          </Badge>
        </div>
      </div>

      {/* Stress Testing Scenarios Bar */}
      <div className="mb-6 p-2 bg-slate-950/40 border border-white/5 rounded-xl flex flex-wrap gap-2 items-center">
        <span className="text-[10px] text-muted-foreground px-2 font-medium">سناریوی سنجش ریسک:</span>
        <button
          type="button"
          onClick={() => setStressScenario("normal")}
          className={cn(
            "text-[10px] px-3 py-1.5 rounded-lg border transition-all",
            stressScenario === "normal"
              ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
              : "bg-slate-900/40 border-white/5 text-muted-foreground hover:bg-slate-900"
          )}
        >
          عادی (پیش‌فرض)
        </button>
        <button
          type="button"
          onClick={() => setStressScenario("traffic_drop")}
          className={cn(
            "text-[10px] px-3 py-1.5 rounded-lg border transition-all",
            stressScenario === "traffic_drop"
              ? "bg-rose-600/10 border-rose-500 text-white font-bold"
              : "bg-slate-900/40 border-white/5 text-muted-foreground hover:bg-slate-900"
          )}
        >
          کاهش ۲۵ درصدی پاخور
        </button>
        <button
          type="button"
          onClick={() => setStressScenario("inflation")}
          className={cn(
            "text-[10px] px-3 py-1.5 rounded-lg border transition-all",
            stressScenario === "inflation"
              ? "bg-rose-600/10 border-rose-500 text-white font-bold"
              : "bg-slate-900/40 border-white/5 text-muted-foreground hover:bg-slate-900"
          )}
        >
          تورم ۲۰ درصدی هزینه‌ها
        </button>
        <button
          type="button"
          onClick={() => setStressScenario("crisis")}
          className={cn(
            "text-[10px] px-3 py-1.5 rounded-lg border transition-all",
            stressScenario === "crisis"
              ? "bg-rose-600/20 border-rose-500 text-rose-300 font-bold"
              : "bg-slate-900/40 border-white/5 text-muted-foreground hover:bg-slate-900"
          )}
        >
          شرایط بحرانی (کاهش پاخور + تورم)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sliders Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rent Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted-foreground">میزان اجاره پیشنهادی ملک</span>
              <span className="font-black text-foreground">{toToman(rent)}</span>
            </div>
            <Slider
              value={[rent]}
              min={0}
              max={150000000}
              step={1000000}
              onValueChange={(val) => setRent(val[0])}
              className="py-2 animate-pulse-once"
            />
          </div>

          {/* Average Ticket Price */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted-foreground">میانگین مبلغ فاکتور مشتری</span>
              <span className="font-black text-foreground">{toToman(avgTicket)}</span>
            </div>
            <Slider
              value={[avgTicket]}
              min={20000}
              max={2500000}
              step={10000}
              onValueChange={(val) => setAvgTicket(val[0])}
              className="py-2 animate-pulse-once"
            />
          </div>

          {/* Daily Customers Count */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted-foreground">تعداد مشتری روزانه صنف</span>
              <span className="font-black text-foreground">
                {dailyCustomers.toLocaleString("fa-IR")} نفر 
                {stressScenario !== "normal" && (
                  <span className="text-[10px] text-rose-400 mr-1">
                    (تعدیل شده به {adjustedCustomers.toLocaleString("fa-IR")} نفر)
                  </span>
                )}
              </span>
            </div>
            <Slider
              value={[dailyCustomers]}
              min={1}
              max={300}
              step={1}
              onValueChange={(val) => setDailyCustomers(val[0])}
              className="py-2 animate-pulse-once"
            />
          </div>

          {/* Advanced Toggler */}
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-muted-foreground hover:text-foreground gap-1 p-0 h-auto hover:bg-transparent"
            >
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              تنظیمات پیشرفته هزینه‌ها (حقوق پرسنل، قبوض و مواد اولیه)
            </Button>

            {showAdvanced && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* COGS Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">بهای تمام‌شده کالا/خدمات (مواد اولیه و خرید محصول)</span>
                    <span className="font-bold text-indigo-400">
                      {Math.round(cogsPercent * costModifier).toLocaleString("fa-IR")}٪ کل فروش
                    </span>
                  </div>
                  <Slider
                    value={[cogsPercent]}
                    min={5}
                    max={80}
                    step={1}
                    onValueChange={(val) => setCogsPercent(val[0])}
                    className="py-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Salaries Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground">حقوق ماهانه پرسنل</span>
                      <span className="font-bold">{toToman(Math.round(salaries * costModifier))}</span>
                    </div>
                    <Slider
                      value={[salaries]}
                      min={0}
                      max={60000000}
                      step={500000}
                      onValueChange={(val) => setSalaries(val[0])}
                      className="py-1"
                    />
                  </div>

                  {/* Utilities Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground">قبوض، اینترنت و جاری</span>
                      <span className="font-bold">{toToman(Math.round(utilities * costModifier))}</span>
                    </div>
                    <Slider
                      value={[utilities]}
                      min={0}
                      max={20000000}
                      step={500000}
                      onValueChange={(val) => setUtilities(val[0])}
                      className="py-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Panel (1 col) */}
        <div className="rounded-xl p-5 bg-slate-950/60 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-muted-foreground border-b border-white/5 pb-2">خلاصه پیش‌بینی ماهانه</h5>
            
            {/* Revenue */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-muted-foreground">درآمد کل تخمینی</span>
              <span className="text-xs font-black text-emerald-400">{toToman(monthlyRevenue)}</span>
            </div>

            {/* Break-even point */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-muted-foreground">مشتری روزانه سر‌به‌سر</span>
              <span className="text-xs font-bold text-amber-500">حداقل {dailyBreakEven.toLocaleString("fa-IR")} نفر</span>
            </div>

            {/* Rent contribution */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-muted-foreground">سهم اجاره از درآمد</span>
              <span className={cn(
                "text-xs font-bold",
                rentToRevenue > 30 ? "text-rose-500" : rentToRevenue > 20 ? "text-amber-500" : "text-emerald-400"
              )}>
                {Number(rentToRevenue.toFixed(1)).toLocaleString("fa-IR")}٪
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help" title="بر اساس حداقل ۱۵٪ سوددهی مطلوب و هزینه‌های جاری">
                حداکثر اجاره توجیه‌پذیر
                <HelpCircle size={10} className="text-muted-foreground" />
              </span>
              <span className="text-xs font-bold text-violet-400">
                {maxSustainableRent > 0 ? toToman(maxSustainableRent) : "فاقد توجیه"}
              </span>
            </div>

            {/* Profit margin */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">حاشیه سود خالص</span>
              <span className={cn(
                "text-xs font-bold",
                netProfit > 0 ? "text-emerald-400" : "text-rose-500"
              )}>
                {Number(profitMargin.toFixed(1)).toLocaleString("fa-IR")}٪
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="text-[9px] text-muted-foreground mb-1">سود یا زیان خالص ماهانه:</div>
            <div className={cn(
              "text-base font-black tracking-tight",
              netProfit >= 0 ? "text-emerald-400" : "text-rose-500"
            )}>
              {netProfit >= 0 ? "+" : ""}
              {toToman(netProfit)}
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
}
