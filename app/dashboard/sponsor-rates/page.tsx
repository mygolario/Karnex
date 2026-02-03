"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, Calculator, Globe, Briefcase, 
  HelpCircle, Check, X, TrendingUp, Search,
  Users, MessageSquare, Video, Instagram, Youtube
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export default function SponsorRatesPage() {
  const { activeProject: plan } = useProject();
  const [platform, setPlatform] = useState<"instagram" | "youtube">("instagram");
  const [followers, setFollowers] = useState(10000);
  const [engagement, setEngagement] = useState(5);
  const [niche, setNiche] = useState("tech");

  // Check project type
  if (plan?.projectType !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <DollarSign size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">محاسبه‌گر تعرفه اسپانسر برای تولیدکنندگان محتوا</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های Creator فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Calculation Logic (Simplified)
  const calculateRate = () => {
    let baseRate = 0;
    if (platform === "instagram") {
      // Instagram: ~$10 per 1,000 followers, adjusted by engagement
      baseRate = (followers / 1000) * 10 * (engagement / 2);
    } else {
      // YouTube: ~$20 per 1,000 subscribers, adjusted by engagement
      baseRate = (followers / 1000) * 20 * (engagement / 2);
    }
    
    // Niche multiplier
    const nicheMultiplier: Record<string, number> = {
      tech: 1.5,
      finance: 2.0,
      lifestyle: 1.0,
      gaming: 0.8,
      beauty: 1.2
    };

    const finalRate = baseRate * (nicheMultiplier[niche] || 1);
    // Convert to Toman (approx 60,000 rate)
    return Math.round(finalRate * 60000);
  };

  const rate = calculateRate();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">ماشین حساب تعرفه اسپانسر</h1>
              <p className="text-muted-foreground">محاسبه قیمت منصفانه و حرفه‌ای برای تبلیغات</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="p-6 space-y-8">
          <div>
            <Label className="mb-3 block text-base">پلتفرم شما</Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${platform === 'instagram' ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/20' : 'border-border hover:border-muted-foreground/50'}`}
                onClick={() => setPlatform('instagram')}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center">
                  <Instagram size={20} />
                </div>
                <span className="font-bold">اینستاگرام</span>
              </div>
              <div 
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${platform === 'youtube' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border hover:border-muted-foreground/50'}`}
                onClick={() => setPlatform('youtube')}
              >
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
                  <Youtube size={20} />
                </div>
                <span className="font-bold">یوتیوب</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-3 text-base flex justify-between">
              <span>تعداد دنبال‌کننده / سابسکرایبر</span>
              <span className="text-primary font-bold">{followers.toLocaleString()}</span>
            </Label>
            <Slider 
              value={[followers]} 
              onValueChange={(val) => setFollowers(val[0])} 
              max={1000000} 
              step={1000} 
              className="mb-6"
            />
          </div>

          <div>
            <Label className="mb-3 text-base flex justify-between">
              <span>نرخ تعامل (Engagement Rate)</span>
              <span className="text-primary font-bold">{engagement}%</span>
            </Label>
            <Slider 
              value={[engagement]} 
              onValueChange={(val) => setEngagement(val[0])} 
              max={20} 
              step={0.1} 
              className="mb-6"
            />
            <p className="text-xs text-muted-foreground mt-1">
              میانگین تعامل برای اکانت‌های مشابه حدود ۳٪ تا ۶٪ است.
            </p>
          </div>

          <div>
            <Label className="mb-3 block text-base">حوزه فعالیت (Niche)</Label>
            <select 
              className="input-premium w-full"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            >
              <option value="tech">تکنولوژی و گجت (×1.5)</option>
              <option value="finance">مالی و سرمایه‌گذاری (×2.0)</option>
              <option value="beauty">زیبایی و سلامت (×1.2)</option>
              <option value="lifestyle">لایف استایل و ولاگ (×1.0)</option>
              <option value="gaming">گیمینگ (×0.8)</option>
            </select>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <Card className="p-8 bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground text-center relative overflow-hidden border-none shadow-xl">
            <div className="relative z-10">
              <h3 className="text-xl font-medium opacity-90 mb-2">ارزش پیشنهادی هر پست/ویدیو</h3>
              <div className="text-5xl font-black mb-2 tracking-tight">
                {(rate / 1000000).toFixed(1)} <span className="text-2xl font-normal opacity-80">میلیون تومان</span>
              </div>
              <p className="text-sm opacity-70 mb-8">
                {(rate).toLocaleString()} تومان دقیق
              </p>

              <div className="grid grid-cols-3 gap-4 text-center border-t border-white/20 pt-6">
                <div>
                  <div className="text-xs opacity-70 mb-1">استوری</div>
                  <div className="font-bold text-lg">{(rate * 0.3 / 1000000).toFixed(1)} M</div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">پست اصلی</div>
                  <div className="font-bold text-lg">{(rate / 1000000).toFixed(1)} M</div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">پکیج (۳تایی)</div>
                  <div className="font-bold text-lg">{(rate * 2.5 / 1000000).toFixed(1)} M</div>
                </div>
              </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-primary" />
              نکات مذاکره با برندها
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} />
                </div>
                <p className="text-sm text-muted-foreground">
                  همیشه روی "نرخ تعامل" خود تاکید کنید، نه فقط تعداد فالوور. برندها دنبال نتیجه هستند.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} />
                </div>
                <p className="text-sm text-muted-foreground">
                  برای قراردادهای بلندمدت (مثلاً ۳ ماهه) تخفیف ۱۰ تا ۲۰ درصدی پیشنهاد دهید.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp size={12} />
                </div>
                <p className="text-sm text-muted-foreground">
                  اگر برند درخواست مالکیت محتوا (Usage Rights) کرد، ۳۰٪ به مبلغ اضافه کنید.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
