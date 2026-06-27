"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DollarSign, ArrowUpRight, TrendingDown, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialSimulatorProps {
  initialRent?: number;
}

export function FinancialSimulator({ initialRent = 25000000 }: FinancialSimulatorProps) {
  // Core Sliders
  const [rent, setRent] = useState<number>(initialRent);
  const [avgTicket, setAvgTicket] = useState<number>(250000); // 250,000 Tomans default
  const [dailyCustomers, setDailyCustomers] = useState<number>(45);

  // Advanced settings toggling
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced Variables
  const [cogsPercent, setCogsPercent] = useState<number>(35); // 35% default cost of goods sold
  const [salaries, setSalaries] = useState<number>(18000000); // 18 million Tomans staff default
  const [utilities, setUtilities] = useState<number>(4000000); // 4 million Tomans utilities default

  // Calculations
  const monthlyRevenue = avgTicket * dailyCustomers * 30;
  const variableCosts = monthlyRevenue * (cogsPercent / 100);
  const fixedCosts = rent + salaries + utilities;
  const totalCosts = fixedCosts + variableCosts;
  const netProfit = monthlyRevenue - totalCosts;
  
  const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;
  const rentToRevenue = monthlyRevenue > 0 ? (rent / monthlyRevenue) * 100 : 0;

  // Daily customers required to break even
  const marginPerCustomer = avgTicket * (1 - cogsPercent / 100);
  const dailyBreakEven = marginPerCustomer > 0 ? Math.ceil(fixedCosts / 30 / marginPerCustomer) : 0;

  const toToman = (val: number) => {
    return val.toLocaleString("fa-IR") + " تومان";
  };

  return (
    <Card className="p-6 bg-card/30 border-white/5 shadow-xl backdrop-blur-md dir-rtl text-right">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-bold text-base flex items-center gap-2">
            <DollarSign className="text-primary size-5" />
            شبیه‌ساز توجیه مالی و سودآوری محلی
          </h4>
          <p className="text-xs text-muted-foreground mt-1">تخمینی از وضعیت سر‌به‌سر هزینه‌ها و بازدهی مالی صنف شما در این محدوده</p>
        </div>
        <Badge variant={netProfit >= 0 ? "outline" : "danger"} className={cn(
          "text-xs px-2.5 py-1 font-bold",
          netProfit >= 0 && "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
        )}>
          {netProfit >= 0 ? "سودده" : "زیان‌ده"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sliders Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rent Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted-foreground">بودجه اجاره ماهانه مغازه</span>
              <span className="font-black text-foreground">{toToman(rent)}</span>
            </div>
            <Slider
              value={[rent]}
              min={0}
              max={150000000}
              step={1000000}
              onValueChange={(val) => setRent(val[0])}
              className="py-2"
            />
          </div>

          {/* Average Ticket Price */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted-foreground">میانگین مبلغ هر فاکتور مشتری</span>
              <span className="font-black text-foreground">{toToman(avgTicket)}</span>
            </div>
            <Slider
              value={[avgTicket]}
              min={20000}
              max={2500000}
              step={10000}
              onValueChange={(val) => setAvgTicket(val[0])}
              className="py-2"
            />
          </div>

          {/* Daily Customers Count */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted-foreground">تعداد مشتری روزانه پیش‌بینی شده</span>
              <span className="font-black text-foreground">{dailyCustomers.toLocaleString("fa-IR")} نفر</span>
            </div>
            <Slider
              value={[dailyCustomers]}
              min={1}
              max={300}
              step={1}
              onValueChange={(val) => setDailyCustomers(val[0])}
              className="py-2"
            />
          </div>

          {/* Advanced Toggler */}
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-muted-foreground hover:text-foreground gap-1 p-0 h-auto"
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
                    <span className="font-bold text-primary">{cogsPercent.toLocaleString("fa-IR")}٪ کل فروش</span>
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
                      <span className="font-bold">{toToman(salaries)}</span>
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
                      <span className="text-muted-foreground">قبوض، اینترنت و مصارف جاری</span>
                      <span className="font-bold">{toToman(utilities)}</span>
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
          <div className="space-y-3.5">
            <h5 className="text-xs font-semibold text-muted-foreground">خلاصه پیش‌بینی ماهانه</h5>
            
            {/* Revenue */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-muted-foreground">درآمد کل تخمینی</span>
              <span className="text-sm font-black text-emerald-400">{toToman(monthlyRevenue)}</span>
            </div>

            {/* Break-even point */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-muted-foreground">مشتری روزانه سر‌به‌سر</span>
              <span className="text-sm font-bold text-amber-500">حداقل {dailyBreakEven.toLocaleString("fa-IR")} نفر</span>
            </div>

            {/* Rent contribution */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-muted-foreground">سهم اجاره از کل درآمد</span>
              <span className={cn(
                "text-xs font-bold",
                rentToRevenue > 35 ? "text-rose-500" : rentToRevenue > 25 ? "text-amber-500" : "text-emerald-400"
              )}>
                {Number(rentToRevenue.toFixed(1)).toLocaleString("fa-IR")}٪
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
            <div className="text-[10px] text-muted-foreground mb-1">نتیجه نهایی پیش‌بینی سود ناخالص:</div>
            <div className={cn(
              "text-lg font-black tracking-tight",
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
