"use client";

import { useState } from "react";
import { BrandCanvas, saveBrandCanvas } from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import { SectionRegenerator } from "@/components/shared/section-regenerator";
import { Select } from "@/components/ui/select";
import { Target, Users, Grid, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function PersonalBrandCanvas() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();

  const [data, setData] = useState<BrandCanvas>(plan?.brandCanvas || {
      niche: "حوزه تخصصی خود را مشخص کنید...",
      audienceAvatar: "پرسونای مخاطب ایده‌آل شما کیست؟",
      contentPillars: "۳-۴ موضوع اصلی محتوای شما چیست؟",
      revenueChannels: "چگونه درآمد کسب می‌کنید؟ (تبلیغات، دوره، خدمات)"
  });

  const handleUpdate = async (field: keyof BrandCanvas, content: string) => {
    if (!user || !plan) return;
    
    const newData = { ...data, [field]: content };
    setData(newData);
    updateActiveProject({ brandCanvas: newData });

    try {
        await saveBrandCanvas(user.id!, newData, plan.id || 'current');
        toast.success("بوم برند شخصی ذخیره شد");
    } catch (err) {
        toast.error("خطا در ذخیره سازی");
    }
  };

  const sections = [
    {
       key: 'niche' as const,
       title: "نیچ مارکت (Niche)",
       icon: Target,
       desc: "تخصص دقیق شما چیست و چه مشکلی حل می‌کنید؟",
       color: "text-purple-500",
       bg: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
       key: 'audienceAvatar' as const,
       title: "آواتار مخاطب",
       icon: Users,
       desc: "مخاطب رویایی شما چه ویژگی‌هایی دارد؟",
       color: "text-blue-500",
       bg: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
       key: 'contentPillars' as const,
       title: "ستون‌های محتوایی",
       icon: Grid,
       desc: "موضوعات اصلی که در مورد آنها صحبت می‌کنید",
       color: "text-pink-500",
       bg: "bg-pink-100 dark:bg-pink-900/20"
    },
    {
       key: 'revenueChannels' as const,
       title: "کانال‌های درآمدی",
       icon: DollarSign,
       desc: "محصولات، خدمات یا روش های درآمدزایی",
       color: "text-emerald-500",
       bg: "bg-emerald-100 dark:bg-emerald-900/20"
    }
  ];

  return (
    <div className="space-y-6">
         <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-6 rounded-3xl">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                <span className="text-purple-600 dark:text-purple-400">Personal Brand</span>
                <span>بوم برند شخصی</span>
            </h2>
            <p className="text-muted-foreground">
                به عنوان یک تولید کننده محتوا، "شما" بیزینس هستید. این بوم به شما کمک می‌کند هویت و مسیر درآمدی خود را شفاف کنید.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {sections.map((section) => (
                <Card 
                    key={section.key} 
                    className="p-6 border-2 border-transparent hover:border-purple-500/20 transition-all group"
                >
                    <div className="flex items-start justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center shrink-0`}>
                                <section.icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-foreground">{section.title}</h3>
                                <p className="text-xs text-muted-foreground">{section.desc}</p>
                            </div>
                        </div>
                        <SectionRegenerator 
                            sectionTitle={section.title}
                            currentContent={data[section.key]}
                            onUpdate={(val) => handleUpdate(section.key, val)}
                        />
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-2xl min-h-[140px] border border-border/50">
                        <textarea
                            value={data[section.key]}
                            onChange={(e) => handleUpdate(section.key, e.target.value)}
                            className="w-full h-full bg-transparent resize-none outline-none text-foreground/90 leading-relaxed placeholder:text-muted-foreground/40"
                            placeholder="اینجا بنویسید..."
                        />
                    </div>
                </Card>
             ))}
        </div>
    </div>
  );
}
