"use client";

import { useState } from "react";
import { RateCard, ServicePackage, saveFinancials } from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function RateCardCalculator() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();

  const [data, setData] = useState<RateCard>(
    plan?.financials?.rateCard || {
      packages: [
          { title: "استوری تبلیغاتی", deliverables: "۱ اسلاید با لینک و منشن", price: 2000000 },
          { title: "پست اختصاصی", deliverables: "ریلز یا پست تصویری با سناریو شما", price: 8000000 }
      ],
      currency: "IRT",
      terms: "۵۰٪ پیش‌پرداخت، تسویه قبل از انتشار",
      lastUpdated: new Date().toISOString()
    }
  );

  const updatePackage = (index: number, field: keyof ServicePackage, value: any) => {
      const newPackages = [...data.packages];
      newPackages[index] = { ...newPackages[index], [field]: value };
      setData({ ...data, packages: newPackages });
  };

  const addPackage = () => {
      setData({
          ...data,
          packages: [...data.packages, { title: "پکیج جدید", deliverables: "", price: 0 }]
      });
  };

  const removePackage = (index: number) => {
      const newPackages = data.packages.filter((_, i) => i !== index);
      setData({ ...data, packages: newPackages });
  };

  const handleSave = async () => {
    if (!user || !plan) return;
    try {
        const dataToSave = { ...data, lastUpdated: new Date().toISOString() };
        await saveFinancials(user.id!, 'rateCard', dataToSave, plan.id || 'current');
        updateActiveProject({ financials: { ...plan.financials, rateCard: dataToSave } });
        toast.success("تعرفه‌ها ذخیره شد");
    } catch (err) {
        toast.error("خطا در ذخیره سازی");
    }
  };

  return (
    <div className="space-y-6">
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 p-6 rounded-3xl">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                <span className="text-pink-600">Rate Card</span>
                <span>تعرفه خدمات</span>
            </h2>
            <p className="text-muted-foreground">
                شفافیت در قیمت‌گذاری نشانه حرفه‌ای بودن شماست. پکیج‌های خود را تعریف کنید.
            </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {data.packages.map((pkg, idx) => (
                <Card key={idx} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1 w-full space-y-2">
                        <Input 
                            value={pkg.title} 
                            onChange={(e) => updatePackage(idx, 'title', e.target.value)}
                            placeholder="عنوان (مثلا: استوری)"
                            className="font-bold border-transparent hover:border-border focus:border-border"
                        />
                        <Input 
                            value={pkg.deliverables} 
                            onChange={(e) => updatePackage(idx, 'deliverables', e.target.value)}
                            placeholder="شرح خدمات..."
                            className="text-sm border-transparent hover:border-border focus:border-border"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-40">
                             <Input 
                                type="number"
                                value={pkg.price}
                                onChange={(e) => updatePackage(idx, 'price', parseInt(e.target.value))}
                                className="pl-12 text-left font-mono"
                            />
                            <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">تومان</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removePackage(idx)} className="text-muted-foreground hover:text-red-500">
                            <Trash2 size={18} />
                        </Button>
                    </div>
                </Card>
            ))}

            <Button onClick={addPackage} variant="outline" className="border-dashed py-6 gap-2 text-muted-foreground">
                <Plus size={18} />
                افزودن پکیج جدید
            </Button>
        </div>

        <div className="flex justify-end pt-4">
             <Button onClick={handleSave} size="lg" className="min-w-[150px]">
                ذخیره تعرفه‌ها
            </Button>
        </div>
    </div>
  );
}
