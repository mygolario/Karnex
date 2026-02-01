"use client";

import { useState, useEffect } from "react";
import { RunwayCalculation, saveFinancials } from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export function RunwayCalculator() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();

  const [input, setInput] = useState<RunwayCalculation>(
    plan?.financials?.runway || {
      currentCash: 100000000, // 100M Toman default
      monthlyBurn: 15000000,
      monthlyRevenue: 0,
      runwayMonths: 0,
      lastUpdated: new Date().toISOString()
    }
  );

  useEffect(() => {
    calculateRunway();
  }, [input.currentCash, input.monthlyBurn, input.monthlyRevenue]);

  const calculateRunway = () => {
    const netBurn = input.monthlyBurn - input.monthlyRevenue;
    if (netBurn <= 0) {
       setInput(prev => ({ ...prev, runwayMonths: 999 })); // Infinite/Profitable
    } else {
       const months = input.currentCash / netBurn;
       setInput(prev => ({ ...prev, runwayMonths: parseFloat(months.toFixed(1)) }));
    }
  };

  const handleSave = async () => {
    if (!user || !plan) return;
    try {
        const dataToSave = { ...input, lastUpdated: new Date().toISOString() };
        await saveFinancials(user.uid, 'runway', dataToSave, plan.id || 'current');
        updateActiveProject({ financials: { ...plan.financials, runway: dataToSave } });
        toast.success("محاسبات ذخیره شد");
    } catch (err) {
        toast.error("خطا در ذخیره سازی");
    }
  };

  const statusColor = input.runwayMonths < 3 ? "text-red-500" : input.runwayMonths < 6 ? "text-amber-500" : "text-emerald-500";
  const progressValue = Math.min(100, (input.runwayMonths / 18) * 100);

  return (
    <div className="space-y-6">
        <div className="bg-card border border-border p-6 rounded-3xl">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                <span className="text-primary">Runway</span>
                <span>محاسبه‌گر مرگ و زندگی</span>
            </h2>
            <p className="text-muted-foreground">
                استارتاپ شما چقدر زنده می‌ماند؟ این ابزار به شما می‌گوید چند ماه تا پایان نقدینگی فرصت دارید.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">نقدینگی فعلی (تومان)</label>
                    <Input 
                        type="number" 
                        value={input.currentCash}
                        onChange={(e) => setInput({...input, currentCash: parseInt(e.target.value) || 0})}
                        className="text-left font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">هزینه ماهانه (Burn Rate)</label>
                    <Input 
                        type="number" 
                        value={input.monthlyBurn}
                        onChange={(e) => setInput({...input, monthlyBurn: parseInt(e.target.value) || 0})}
                        className="text-left font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">درآمد ماهانه (Revenue)</label>
                    <Input 
                        type="number" 
                        value={input.monthlyRevenue}
                        onChange={(e) => setInput({...input, monthlyRevenue: parseInt(e.target.value) || 0})}
                        className="text-left font-mono"
                    />
                </div>
                <Button onClick={handleSave} className="w-full">
                    ذخیره وضعیت مالی
                </Button>
            </div>

            <Card className="p-8 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                {input.runwayMonths >= 999 ? (
                    <div className="text-emerald-500 flex flex-col items-center animate-in zoom-in">
                        <CheckCircle2 size={64} className="mb-4" />
                        <h3 className="text-3xl font-black">سودده (Profitable)</h3>
                        <p className="text-muted-foreground mt-2">دخل شما از خرجتان بیشتر است. عالی!</p>
                    </div>
                ) : (
                    <>
                        <div className="relative">
                             <h3 className={`text-6xl font-black ${statusColor}`}>
                                {input.runwayMonths}
                            </h3>
                            <span className="text-xl text-muted-foreground absolute -right-8 top-0">ماه</span>
                        </div>
                        <p className="text-lg font-medium">زمان باقی‌مانده</p>
                        
                        <div className="w-full max-w-xs space-y-2">
                            <Progress value={progressValue} className="h-3" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>خطرناک</span>
                                <span>امن (۱۸+ ماه)</span>
                            </div>
                        </div>

                        {input.runwayMonths < 3 && (
                            <div className="flex items-center gap-2 bg-red-500/10 text-red-600 px-4 py-2 rounded-xl mt-4">
                                <AlertTriangle size={18} />
                                <span className="font-bold">وضعیت اضطراری! هزینه‌ها را کاهش دهید.</span>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    </div>
  );
}
