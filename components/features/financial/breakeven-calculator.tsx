"use client";

import { useState, useEffect } from "react";
import { BreakEvenAnalysis, saveFinancials } from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale, Info } from "lucide-react";
import { toast } from "sonner";

export function BreakEvenCalculator() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();

  const [input, setInput] = useState<BreakEvenAnalysis>(
    plan?.financials?.breakEven || {
      fixedCosts: 50000000, 
      variableCostPerUnit: 100000,
      pricePerUnit: 250000,
      breakEvenUnits: 0,
      breakEvenRevenue: 0,
      lastUpdated: new Date().toISOString()
    }
  );

  useEffect(() => {
    calculateBreakEven();
  }, [input.fixedCosts, input.variableCostPerUnit, input.pricePerUnit]);

  const calculateBreakEven = () => {
    const contributionMargin = input.pricePerUnit - input.variableCostPerUnit;
    
    if (contributionMargin <= 0) {
        // Impossible to break even if losing money on every unit
        setInput(prev => ({ ...prev, breakEvenUnits: -1, breakEvenRevenue: -1 }));
    } else {
        const units = Math.ceil(input.fixedCosts / contributionMargin);
        const revenue = units * input.pricePerUnit;
        setInput(prev => ({ ...prev, breakEvenUnits: units, breakEvenRevenue: revenue }));
    }
  };

  const handleSave = async () => {
    if (!user || !plan) return;
    try {
        const dataToSave = { ...input, lastUpdated: new Date().toISOString() };
        await saveFinancials(user.id!, 'breakEven', dataToSave, plan.id || 'current');
        updateActiveProject({ financials: { ...plan.financials, breakEven: dataToSave } });
        toast.success("محاسبات ذخیره شد");
    } catch (err) {
        toast.error("خطا در ذخیره سازی");
    }
  };

  return (
    <div className="space-y-6">
        <div className="bg-card border border-border p-6 rounded-3xl">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                <span className="text-secondary">Break-Even</span>
                <span>نقطه سر‌به‌سر</span>
            </h2>
            <p className="text-muted-foreground">
                چند محصول باید بفروشید تا هزینه‌ها جبران شود و وارد سود شوید؟
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">هزینه‌های ثابت ماهانه (اجاره، حقوق...)</label>
                    <Input 
                        type="number" 
                        value={input.fixedCosts}
                        onChange={(e) => setInput({...input, fixedCosts: parseInt(e.target.value) || 0})}
                        className="text-left font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">هزینه متغیر هر واحد (مواد اولیه...)</label>
                    <Input 
                        type="number" 
                        value={input.variableCostPerUnit}
                        onChange={(e) => setInput({...input, variableCostPerUnit: parseInt(e.target.value) || 0})}
                        className="text-left font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">قیمت فروش هر واحد</label>
                    <Input 
                        type="number" 
                        value={input.pricePerUnit}
                        onChange={(e) => setInput({...input, pricePerUnit: parseInt(e.target.value) || 0})}
                        className="text-left font-mono"
                    />
                </div>
                <Button onClick={handleSave} className="w-full">
                    ذخیره محاسبه
                </Button>
            </div>

            <Card className="p-8 flex flex-col items-center justify-center text-center space-y-6 bg-secondary/5 border-secondary/20">
                <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center text-secondary mb-2">
                    <Scale size={40} />
                </div>
                
                {input.breakEvenUnits === -1 ? (
                    <div className="text-red-500 font-bold">
                        <p>هشدار: قیمت فروش کمتر از هزینه تولید است!</p>
                        <p>شما روی هر فروش ضرر می‌دهید.</p>
                    </div>
                ) : (
                    <>
                        <div>
                            <p className="text-muted-foreground mb-1">تعداد فروش مورد نیاز</p>
                            <h3 className="text-5xl font-black text-foreground">
                                {input.breakEvenUnits.toLocaleString()} <span className="text-xl font-normal text-muted-foreground">عدد</span>
                            </h3>
                        </div>
                        
                        <div className="w-full h-px bg-border/50" />
                        
                        <div>
                            <p className="text-muted-foreground mb-1">درآمد سر‌به‌سر</p>
                            <h3 className="text-3xl font-bold text-foreground opacity-80">
                                {input.breakEvenRevenue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">تومان</span>
                            </h3>
                        </div>
                    </>
                )}
            </Card>
        </div>
    </div>
  );
}
