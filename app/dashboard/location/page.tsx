"use client";

import { useState } from "react";
import { useProject } from "@/contexts/project-context";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Users, Store, TrendingUp, Search, 
  Navigation, Map as MapIcon, Loader2, Sparkles,
  Building2, Car, Clock, DollarSign, Target,
  BarChart3, CheckCircle2, AlertTriangle, Info
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function LocationAnalyzerPage() {
  const { activeProject: plan } = useProject();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [address, setAddress] = useState("");
  const [selectedCity, setSelectedCity] = useState("tehran");

  // Check project type
  if (plan?.projectType !== "traditional") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <MapPin size={64} className="mx-auto mb-4 text-muted-foreground/40" />
          <h2 className="text-xl font-bold mb-2">تحلیل منطقه برای کسب‌وکار سنتی</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های کسب‌وکار سنتی فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button>بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleAnalyze = async () => {
    if (!address) {
      toast.error("آدرس یا محله را وارد کنید");
      return;
    }

    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setHasAnalysis(true);
      setIsAnalyzing(false);
      toast.success("تحلیل منطقه آماده شد");
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">تحلیلگر منطقه هوشمند</h1>
              <p className="text-muted-foreground">شناسایی بهترین مکان‌ها، تحلیل رقبا و پیش‌بینی مشتریان</p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="text-sm font-medium mb-1 block">شهر</label>
            <select 
              className="input-premium w-full"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="tehran">تهران</option>
              <option value="mashhad">مشهد</option>
              <option value="isfahan">اصفهان</option>
              <option value="shiraz">شیراز</option>
              <option value="tabriz">تبریز</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">محله یا آدرس دقیق</label>
            <div className="relative">
              <MapPin className="absolute right-3 top-3 text-muted-foreground max-w-[20px]" />
              <input 
                className="input-premium w-full pr-10"
                placeholder="مثال: سعادت‌آباد، خیابان علامه طباطبایی"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <Button 
              className="w-full h-[42px] bg-gradient-to-r from-primary to-secondary gap-2"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <Loader2 className="animate-spin" /> : <Search size={18} />}
              تحلیل منطقه
            </Button>
          </div>
        </div>
      </Card>

      {/* Analysis Results */}
      {hasAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-700 dark:text-emerald-400">امتیاز مکان</h3>
                  <p className="text-xs text-muted-foreground">مناسب برای {plan?.projectName}</p>
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">۸.۵<span className="text-sm font-normal text-muted-foreground">/۱۰</span></div>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                این منطقه پتانسیل بالایی برای کسب‌وکار شما دارد.
              </p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-blue-700 dark:text-blue-400">جمعیت هدف</h3>
                  <p className="text-xs text-muted-foreground">تراکم جمعیت در شعاع ۱km</p>
                </div>
              </div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">۴۵,۰۰۰<span className="text-sm font-normal text-muted-foreground">نفر</span></div>
              <p className="text-sm text-blue-700/80 dark:text-blue-400/80">
                تراکم جمعیت بالا با قدرت خرید متوسط رو به بالا.
              </p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-amber-700 dark:text-amber-400">رقبای منطقه</h3>
                  <p className="text-xs text-muted-foreground">کسب‌وکارهای مشابه فعال</p>
                </div>
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">۱۲<span className="text-sm font-normal text-muted-foreground">کسب‌وکار</span></div>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                رقابت متوسط است. فرصت برای ارائه خدمات بهتر وجود دارد.
              </p>
            </Card>
          </div>

          {/* Detailed Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Users className="text-primary" size={20} />
                  تحلیل جمعیت‌شناسی
                </h3>
                <Badge variant="secondary">دقیق</Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>گروه سنی ۲۰ تا ۳۵ سال</span>
                    <span className="font-bold">۴۵٪</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[45%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>خانواده‌های جوان</span>
                    <span className="font-bold">۳۰٪</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[30%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>دانشجویان</span>
                    <span className="font-bold">۱۵٪</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 w-[15%]" />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  تحلیل دستیار کارنکس:
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  با توجه به درصد بالای جمعیت جوان منطقه، طراحی دکوراسیون مدرن و ارائه منوی دیجیتال می‌تواند جذابیت بالایی ایجاد کند. همچنین کمپین‌های اینستاگرامی در این منطقه بازدهی بالایی خواهند داشت.
                </p>
              </div>
            </Card>

            {/* Traffic & Access */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <Car className="text-primary" size={20} />
                  تراکم و دسترسی
                </h3>
                <Badge variant="secondary">Peak Hours</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-muted/30 rounded-xl text-center">
                  <Clock className="mx-auto mb-2 text-primary" size={20} />
                  <p className="text-xs text-muted-foreground mb-1">ساعات اوج شلوغی</p>
                  <p className="font-bold">۱۸:۰۰ تا ۲۱:۰۰</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl text-center">
                  <Navigation className="mx-auto mb-2 text-primary" size={20} />
                  <p className="text-xs text-muted-foreground mb-1">دسترسی محلی</p>
                  <p className="font-bold">عالی</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-sm">نزدیک به ایستگاه مترو (۵ دقیقه پیاده)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-sm">دارای جای پارک عمومی مناسب</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="text-sm">ترافیک سنگین در عصرها</span>
                </div>
              </div>
            </Card>

            {/* AI Recommendations */}
            <Card className="p-6 lg:col-span-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-primary/20">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                <Target className="text-primary" size={24} />
                پیشنهادات استراتژیک برای موفقیت در این منطقه
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                  <h4 className="font-bold mb-2 text-primary">قیمت‌گذاری</h4>
                  <p className="text-sm text-muted-foreground">
                    با توجه به قدرت خرید منطقه، استراتژی قیمت‌گذاری متوسط رو به بالا (Premium Economy) پیشنهاد می‌شود. کیفیت را فدای قیمت نکنید.
                  </p>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                  <h4 className="font-bold mb-2 text-primary">تبلیغات محلی</h4>
                  <p className="text-sm text-muted-foreground">
                    توزیع تراکت در مجتمع‌های مسکونی اطراف و همکاری با سوپرمارکت‌های محلی برای معرفی اولیه بسیار موثر است.
                  </p>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                  <h4 className="font-bold mb-2 text-primary">ساعات کاری</h4>
                  <p className="text-sm text-muted-foreground">
                    حتماً تا ساعت ۲۳:۰۰ باز باشید تا مشتریان شبانه منطقه را از دست ندهید. روزهای تعطیل شلوغ‌ترین روزها خواهند بود.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {!hasAnalysis && !isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50 pointer-events-none filter blur-sm select-none">
           {/* Placeholder blurred content to show what it looks like */}
           <Card className="p-32 col-span-full border-dashed"></Card>
        </div>
      )}
    </div>
  );
}
