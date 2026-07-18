"use client";

import { PageTourHelp } from "@/components/tour/page-tour-help";
import { useState, useEffect, useRef } from "react";
import { useProject } from "@/contexts/project-context";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, Calculator, Globe, Briefcase, 
  Check, TrendingUp, HelpCircle, ArrowLeftRight,
  Percent, Calendar, Share2, Plus, Minus, UserCheck,
  Instagram, Youtube, Twitter, Linkedin, AlertCircle, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

// --- Types & Interfaces ---
interface PlatformFormat {
  id: string;
  name: string;
  multiplier: number;
  description: string;
}

interface PlatformConfig {
  name: string;
  icon: any;
  themeClass: string;
  accentColor: string;
  gradient: string;
  glow: string;
  baseCpm: number; // in Toman
  standardEngagement: number; // in %
  formats: PlatformFormat[];
}

// --- Platform Configuration Data ---
const PLATFORMS: Record<string, PlatformConfig> = {
  instagram: {
    name: "اینستاگرام",
    icon: Instagram,
    themeClass: "instagram",
    accentColor: "#d946ef",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    glow: "shadow-pink-500/20 dark:shadow-pink-500/10",
    baseCpm: 80000,
    standardEngagement: 3.5,
    formats: [
      { id: "story", name: "استوری (ساده)", multiplier: 0.4, description: "استوری تصویری بدون لینک" },
      { id: "story_link", name: "استوری با لینک (Sticker)", multiplier: 0.6, description: "استوری دارای لینک ارجاع مستقیم" },
      { id: "reel", name: "ریلز (Reels)", multiplier: 1.2, description: "پست ویدیویی کوتاه با دسترسی بالا" },
      { id: "post_carousel", name: "پست اسلایدی (Carousel)", multiplier: 0.8, description: "پست تصویری یا اسلایدی در فید" },
      { id: "live", name: "لایو مشترک (Live Campaign)", multiplier: 1.5, description: "پخش زنده مشترک همراه با حامی مالی" },
    ]
  },
  youtube: {
    name: "یوتیوب",
    icon: Youtube,
    themeClass: "youtube",
    accentColor: "#ef4444",
    gradient: "from-red-600 to-rose-700",
    glow: "shadow-red-500/20 dark:shadow-red-500/10",
    baseCpm: 150000,
    standardEngagement: 4.0,
    formats: [
      { id: "dedicated", name: "ویدیو اختصاصی (Dedicated Video)", multiplier: 2.2, description: "کل ویدیو با تمرکز روی محصول اسپانسر" },
      { id: "integrated", name: "اسپانسرشیپ ادغام‌شده (60s Mid-roll)", multiplier: 0.8, description: "معرفی ۶۰ ثانیه‌ای در بخش میانی ویدیو" },
      { id: "shorts", name: "یوتیوب شورتس (Shorts)", multiplier: 0.5, description: "ویدیوی کوتاه عمودی با پتانسیل وایرال بالا" },
      { id: "community_post", name: "پست کامیونیتی (Community Tab)", multiplier: 0.25, description: "پست متنی/تصویری در تب جامعه کاربران" },
    ]
  },
  telegram: {
    name: "تلگرام",
    icon: Globe,
    themeClass: "telegram",
    accentColor: "#0ea5e9",
    gradient: "from-sky-400 to-blue-600",
    glow: "shadow-sky-500/20 dark:shadow-sky-500/10",
    baseCpm: 30000,
    standardEngagement: 15.0, // Ratio of average post views to total members
    formats: [
      { id: "post_12h", name: "پست ۱۲ ساعته", multiplier: 0.35, description: "پست معمولی با ماندگاری ۱۲ ساعت در کانال" },
      { id: "post_24h", name: "پست ۲۴ ساعته", multiplier: 0.5, description: "پست معمولی با ماندگاری ۲۴ ساعت" },
      { id: "post_permanent", name: "پست دائمی (Permanent)", multiplier: 1.0, description: "پست بدون حذف شدن از کانال" },
      { id: "pinned_24h", name: "پین شده ۲۴ ساعته", multiplier: 0.8, description: "پین شده در بالای کانال به مدت ۲۴ ساعت" },
    ]
  },
  twitter: {
    name: "توئیتر / X",
    icon: Twitter,
    themeClass: "twitter",
    accentColor: "#f3f4f6",
    gradient: "from-neutral-700 via-neutral-800 to-neutral-950 dark:from-neutral-800 dark:via-neutral-900 dark:to-black",
    glow: "shadow-neutral-500/20 dark:shadow-neutral-800/10",
    baseCpm: 40000,
    standardEngagement: 2.0,
    formats: [
      { id: "single_tweet", name: "تک توییت معمولی", multiplier: 0.5, description: "یک توییت متنی یا تصویری کوتاه" },
      { id: "thread", name: "رشته توییت (Thread)", multiplier: 1.1, description: "زنجیره‌ای از توییت‌های متوالی برای توضیح عمیق" },
      { id: "quote_retweet", name: "نقل‌قول (Quote Retweet)", multiplier: 0.7, description: "کوت توییت اسپانسر همراه با نظر شما" },
    ]
  },
  linkedin: {
    name: "لینکدین",
    icon: Linkedin,
    themeClass: "linkedin",
    accentColor: "#2563eb",
    gradient: "from-blue-600 to-indigo-800",
    glow: "shadow-blue-500/20 dark:shadow-blue-500/10",
    baseCpm: 120000,
    standardEngagement: 2.5,
    formats: [
      { id: "text_post", name: "پست متنی/تصویری معمولی", multiplier: 0.6, description: "پست استاندارد فید لینکدین" },
      { id: "image_carousel", name: "پست اسلایدی (PDF Carousel)", multiplier: 1.3, description: "پست‌های چنداسلایدی جذاب و آموزشی" },
      { id: "video_post", name: "پست ویدیویی بومی", multiplier: 1.5, description: "ویدیوی حرفه‌ای آپلود شده مستقیم در فید" },
      { id: "article", name: "مقاله تخصصی لینکدین", multiplier: 1.0, description: "مقاله عمیق با قابلیت ایندکس بالا در گوگل" },
    ]
  }
};

// --- Animated Counter Component ---
function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    let start = prevValueRef.current;
    const end = value;
    if (start === end) return;

    const duration = 400; // ms
    const startTime = performance.now();

    let animationFrameId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuad)
      const ease = progress * (2 - progress);
      const current = Math.round(start + (end - start) * ease);
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(update);
      } else {
        prevValueRef.current = end;
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export default function SponsorRatesPage() {
  const { activeProject: plan, updateActiveProject } = useProject();
  
  // Base State
  const [platform, setPlatform] = useState<keyof typeof PLATFORMS>("instagram");
  const [followers, setFollowers] = useState(25000);
  const [engagement, setEngagement] = useState(4.5);
  const [niche, setNiche] = useState("tech");
  
  // Modifiers State
  const [audienceLocation, setAudienceLocation] = useState<"iran" | "diaspora" | "global">("iran");
  const [urgency, setUrgency] = useState(false);
  const [exclusivity, setExclusivity] = useState(false);
  const [usageRights, setUsageRights] = useState(false);
  const [productionCost, setProductionCost] = useState<number>(0);
  
  // Agency / Net vs Gross State
  const [pricingMode, setPricingMode] = useState<"gross" | "net">("gross");
  const [agencyCommission, setAgencyCommission] = useState(0);
  
  // Quantities for custom packages
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isSyncing, setIsSyncing] = useState(false);

  // Load default quantities when platform shifts
  useEffect(() => {
    const defaultQuantities: Record<string, number> = {};
    const config = PLATFORMS[platform];
    if (config) {
      config.formats.forEach((f, idx) => {
        defaultQuantities[f.id] = idx === 0 ? 1 : 0;
      });
    }
    setQuantities(defaultQuantities);
  }, [platform]);

  // Check project type
  if (plan?.projectType !== "creator") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md border border-white/10 bg-slate-900/50 backdrop-blur-md">
          <DollarSign size={64} className="mx-auto mb-4 text-muted-foreground/40 animate-pulse" />
          <h2 className="text-xl font-bold mb-2">محاسبه‌گر تعرفه اسپانسر برای تولیدکنندگان محتوا</h2>
          <p className="text-muted-foreground mb-4">
            این امکان فقط برای پروژه‌های Creator فعال است.
          </p>
          <Link href="/dashboard/overview">
            <Button className="bg-primary hover:bg-primary/95 text-white">بازگشت به داشبورد</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const activeConfig = PLATFORMS[platform];

  // Niche multipliers
  const nicheMultipliers: Record<string, number> = {
    tech: 1.5,
    finance: 2.0,
    beauty: 1.25,
    lifestyle: 1.0,
    gaming: 0.85,
    education: 1.3,
    entertainment: 0.9
  };
  const nicheMultiplier = nicheMultipliers[niche] || 1.0;

  // Location multipliers
  const locationMultipliers = {
    iran: 1.0,
    diaspora: 3.2,
    global: 4.8
  };
  const locationMultiplier = locationMultipliers[audienceLocation];

  // Calculation Logic per single Format
  const getFormatPrice = (formatId: string) => {
    const format = activeConfig.formats.find(f => f.id === formatId);
    if (!format) return 0;

    // 1. Base price based on CPM
    const basePrice = (followers / 1000) * activeConfig.baseCpm * format.multiplier;
    
    // 2. Adjust by engagement rate factor
    const engagementFactor = engagement / activeConfig.standardEngagement;
    
    // 3. Multipliers subtotal
    let price = basePrice * engagementFactor * nicheMultiplier * locationMultiplier;

    // 4. Modifiers
    if (urgency) price *= 1.25;      // +25%
    if (exclusivity) price *= 1.35;  // +35%
    if (usageRights) price *= 1.30;  // +30%

    // Round to nearest 5,000 Toman
    return Math.round(price / 5000) * 5000;
  };

  // Compute overall package metrics
  let subtotal = 0;
  let totalQuantity = 0;
  const itemRates: Record<string, number> = {};

  activeConfig.formats.forEach(f => {
    const qty = quantities[f.id] || 0;
    const itemPrice = getFormatPrice(f.id);
    itemRates[f.id] = itemPrice;
    subtotal += itemPrice * qty;
    totalQuantity += qty;
  });

  // Volume Discount Logic
  let discountRate = 0;
  if (totalQuantity === 2) discountRate = 0.05;
  else if (totalQuantity === 3) discountRate = 0.10;
  else if (totalQuantity >= 4) discountRate = 0.15;

  const discountAmount = subtotal * discountRate;
  const discountedSubtotal = subtotal - discountAmount;

  // Add Production Cost
  const totalBaseAndModifiers = discountedSubtotal;
  const subtotalWithProduction = totalBaseAndModifiers + productionCost;

  // Final Price & Agency Calculations
  let grossPrice = 0;
  let netPrice = 0;
  let agencyFee = 0;

  if (pricingMode === "net") {
    // We want to guarantee the payout: netPrice is subtotalWithProduction
    netPrice = subtotalWithProduction;
    if (agencyCommission > 0 && agencyCommission < 100) {
      grossPrice = netPrice / (1 - agencyCommission / 100);
      agencyFee = grossPrice - netPrice;
    } else {
      grossPrice = netPrice;
      agencyFee = 0;
    }
  } else {
    // Gross Price is target: grossPrice is subtotalWithProduction
    grossPrice = subtotalWithProduction;
    agencyFee = grossPrice * (agencyCommission / 100);
    netPrice = grossPrice - agencyFee;
  }

  // Rounded Final Values
  const finalGross = Math.round(grossPrice);
  const finalNet = Math.round(netPrice);
  const finalAgency = Math.round(agencyFee);

  // ROI Estimation Logic
  const getRoiMetrics = () => {
    // Calculate est views
    let viewsMultiplier = 1.2;
    if (platform === "youtube") viewsMultiplier = 2.2;
    else if (platform === "telegram") viewsMultiplier = 0.8;
    else if (platform === "twitter") viewsMultiplier = 1.0;
    else if (platform === "linkedin") viewsMultiplier = 1.5;

    const estViews = Math.round(followers * (engagement / 100) * viewsMultiplier * Math.max(totalQuantity, 1));
    const estClicks = Math.round(estViews * 0.018); // 1.8% average CTR
    const estConversions = Math.round(estClicks * 0.045); // 4.5% conversion rate
    const estCpm = estViews > 0 ? Math.round((finalGross / estViews) * 1000) : 0;

    return { estViews, estClicks, estConversions, estCpm };
  };

  const roi = getRoiMetrics();

  // Integration: Sync with Media Kit
  const handleSyncToMediaKit = async () => {
    if (!plan) return;
    setIsSyncing(true);
    try {
      const activeFormatsList = Object.entries(quantities)
        .filter(([_, q]) => q > 0)
        .map(([id, q]) => {
          const name = activeConfig.formats.find(f => f.id === id)?.name || id;
          return `${q}x ${name}`;
        })
        .join(" + ");

      const newService = {
        title: `تعرفه پیشنهادی اسپانسر (${activeConfig.name})`,
        price: `${(finalGross / 1000000).toFixed(1)} میلیون تومان`,
        description: activeFormatsList || `پکیج سفارشی ${activeConfig.name}`
      };

      const currentMediaKit = plan.mediaKit || {
        displayName: plan.projectName || "",
        bio: "",
        contactEmail: "",
        niche: niche,
        themeColor: activeConfig.accentColor,
        socialStats: [],
        services: [],
        partners: [],
        audience: { male: 50, female: 50, topAge: "18-34", topLocations: [] }
      };

      // Append new service item
      const updatedServices = [...(currentMediaKit.services || [])];
      // Avoid exact duplicate titles
      const existingIdx = updatedServices.findIndex(s => s.title === newService.title);
      if (existingIdx !== -1) {
        updatedServices[existingIdx] = newService;
      } else {
        updatedServices.push(newService);
      }

      const updatedMediaKit = {
        ...currentMediaKit,
        services: updatedServices
      };

      await updateActiveProject({
        mediaKit: updatedMediaKit
      });

      toast.success("پکیج تعرفه با موفقیت به مدیاکیت هوشمند شما افزوده شد!");
    } catch (err) {
      console.error(err);
      toast.error("خطا در همگام‌سازی با مدیاکیت");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 px-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6" data-tour-id="sponsor-header">
        <div className="flex items-center gap-3">
          <PageTourHelp tourId="sponsorship" />
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeConfig.gradient} flex items-center justify-center shadow-lg ${activeConfig.glow} transition-all duration-500`}>
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              ماشین حساب تعرفه اسپانسر
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/5">نسخه ۲.۰</Badge>
            </h1>
            <p className="text-muted-foreground text-sm">ارزش‌گذاری عادلانه، شخصی‌سازی‌شده و همگام با استانداردهای بازار تبلیغات</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24 md:pb-0" data-tour-id="rate-calculator">
        
        {/* Left Column: Form & Configs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Platform Selector */}
          <Card className="p-6 border border-white/10 bg-slate-900/40 backdrop-blur-md">
            <Label className="mb-4 block text-base font-bold text-foreground">۱. انتخاب پلتفرم</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(PLATFORMS).map(([id, config]) => {
                const isSelected = platform === id;
                const IconComponent = config.icon;
                return (
                  <button
                    key={id}
                    onClick={() => setPlatform(id as keyof typeof PLATFORMS)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 ${
                      isSelected 
                        ? `border-transparent bg-gradient-to-br ${config.gradient} text-white shadow-lg ${config.glow}` 
                        : "border-white/5 bg-slate-900/20 text-muted-foreground hover:border-white/20 hover:text-foreground"
                    }`}
                  >
                    <IconComponent size={20} className={isSelected ? "animate-bounce" : ""} />
                    <span className="text-xs font-bold mt-2">{config.name}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 2. Core Stats (Followers & Engagement) */}
          <Card className="p-6 border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-6">
            <h3 className="text-base font-bold text-foreground mb-4">۲. مشخصات پایه رسانه</h3>
            
            {/* Followers Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">تعداد دنبال‌کننده‌ها / سابسکرایبر</span>
                <span className="font-black text-primary animate-pulse" style={{ color: activeConfig.accentColor }}>
                  {followers.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[followers]}
                onValueChange={(val) => setFollowers(val[0])}
                max={500000}
                min={1000}
                step={1000}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>۱,۰۰۰</span>
                <span>۲۵۰,۰۰۰</span>
                <span>۵۰۰,۰۰۰+</span>
              </div>
            </div>

            {/* Engagement Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">نرخ تعامل (Engagement Rate)</span>
                <span className="font-black text-primary" style={{ color: activeConfig.accentColor }}>
                  {engagement}%
                </span>
              </div>
              <Slider
                value={[engagement]}
                onValueChange={(val) => setEngagement(val[0])}
                max={25}
                min={0.1}
                step={0.1}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>۰.۱٪</span>
                <span>میانگین استاندارد ({activeConfig.standardEngagement}٪)</span>
                <span>۲۵٪</span>
              </div>
            </div>

            {/* Niche & Audience Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">حوزه فعالیت (Niche)</Label>
                <select
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': activeConfig.accentColor } as any}
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                >
                  <option value="tech">تکنولوژی و بررسی گجت (×1.50)</option>
                  <option value="finance">مالی، بورس و رمزارز (×2.00)</option>
                  <option value="beauty">زیبایی، آرایشی و سلامت (×1.25)</option>
                  <option value="lifestyle">ولاگر و لایف استایل (×1.00)</option>
                  <option value="gaming">گیمینگ و استریم (×0.85)</option>
                  <option value="education">آموزشی و توسعه فردی (×1.30)</option>
                  <option value="entertainment">طنز و سرگرمی عمومی (×0.90)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">موقعیت جغرافیایی مخاطبان</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "iran", name: "داخلی (ایران)", mult: "x1.0" },
                    { id: "diaspora", name: "خارجی (ایرانی)", mult: "x3.2" },
                    { id: "global", name: "بین‌المللی", mult: "x4.8" }
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setAudienceLocation(loc.id as any)}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all duration-300 ${
                        audienceLocation === loc.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                          : "border-white/5 bg-slate-950/20 text-muted-foreground hover:border-white/10"
                      }`}
                    >
                      <div>{loc.name}</div>
                      <div className="text-[10px] opacity-60 font-light mt-0.5">{loc.mult}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Bundle Builder & Formats */}
          <Card className="p-6 border border-white/10 bg-slate-900/40 backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-base font-bold text-foreground">۳. تنظیم پکیج و فرمت‌های تبلیغاتی</Label>
              {discountRate > 0 && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  تخفیف حجم خرید: {Math.round(discountRate * 100)}٪
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              {activeConfig.formats.map((f) => {
                const qty = quantities[f.id] || 0;
                const singlePrice = itemRates[f.id] || 0;
                
                return (
                  <div 
                    key={f.id} 
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      qty > 0 
                        ? "border-white/15 bg-slate-800/25 animate-none" 
                        : "border-white/5 bg-slate-900/10"
                    }`}
                  >
                    <div className="max-w-[60%]">
                      <div className="font-bold text-sm text-foreground flex items-center gap-2">
                        {f.name}
                        {qty > 0 && <Badge className="bg-primary/20 text-foreground border-none text-[10px]" style={{ backgroundColor: `${activeConfig.accentColor}25` }}>انتخاب شده</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 font-light">{f.description}</div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">
                          {(singlePrice / 1000000).toFixed(2)} M
                        </div>
                        <div className="text-[10px] text-muted-foreground">تومان / واحد</div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center bg-slate-950/40 rounded-lg p-1 border border-white/5">
                        <button
                          onClick={() => setQuantities(prev => ({ ...prev, [f.id]: Math.max(0, qty - 1) }))}
                          className="p-1 hover:bg-slate-800 rounded text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-foreground">{qty}</span>
                        <button
                          onClick={() => setQuantities(prev => ({ ...prev, [f.id]: qty + 1 }))}
                          className="p-1 hover:bg-slate-800 rounded text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 4. Fine-Tuning Modifiers & Production Costs */}
          <Card className="p-6 border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-6">
            <h3 className="text-base font-bold text-foreground mb-4">۴. ضرایب سفارشی و هزینه‌های جانبی</h3>
            
            {/* Custom Modifiers Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { 
                  id: "urgency", 
                  label: "تحویل فوری (۴۸ ساعت)", 
                  desc: "+۲۵٪ هزینه فوریت", 
                  val: urgency, 
                  set: setUrgency 
                },
                { 
                  id: "exclusivity", 
                  label: "انحصار دسته‌بندی", 
                  desc: "+۳۵٪ عدم تبلیغ رقیب", 
                  val: exclusivity, 
                  set: setExclusivity 
                },
                { 
                  id: "usage_rights", 
                  label: "حق مالکیت رسانه‌ای", 
                  desc: "+۳۰٪ بازنشر توسط برند", 
                  val: usageRights, 
                  set: setUsageRights 
                }
              ].map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => mod.set(!mod.val)}
                  className={`p-4 rounded-xl border text-right transition-all duration-300 ${
                    mod.val
                      ? `border-transparent bg-gradient-to-br ${activeConfig.gradient} text-white shadow-md`
                      : "border-white/5 bg-slate-900/20 text-muted-foreground hover:border-white/10"
                  }`}
                >
                  <div className="text-xs font-bold">{mod.label}</div>
                  <div className="text-[10px] opacity-75 mt-1 font-light">{mod.desc}</div>
                </button>
              ))}
            </div>

            {/* Content Production Cost Input */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm text-muted-foreground">هزینه مستقیم تولید محتوا (تومان)</Label>
                {productionCost > 0 && <span className="text-xs text-emerald-400 font-bold">به عنوان قیمت کف لحاظ می‌شود</span>}
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="مثال: ۲,۰۰۰,۰۰۰"
                  className="bg-slate-900/50 border-white/10 pr-12 focus:ring-2 focus:ring-offset-0 placeholder:text-muted-foreground/30 text-left font-bold"
                  value={productionCost || ""}
                  onChange={(e) => setProductionCost(Number(e.target.value))}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">Toman</div>
              </div>
            </div>
          </Card>

          {/* 5. Agency Commission & Payout Mode */}
          <Card className="p-6 border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-6">
            <h3 className="text-base font-bold text-foreground mb-4">۵. کارمزد آژانس و نحوه دریافت مبالغ</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">نوع محاسبه قیمت نهایی</Label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setPricingMode("gross")}
                    className={`py-2 text-center text-xs font-bold rounded-lg transition-all ${
                      pricingMode === "gross" 
                        ? "bg-slate-800 text-white shadow" 
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    کل دریافتی (Gross)
                  </button>
                  <button
                    onClick={() => setPricingMode("net")}
                    className={`py-2 text-center text-xs font-bold rounded-lg transition-all ${
                      pricingMode === "net" 
                        ? "bg-slate-800 text-white shadow" 
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    خالص دریافتی (Net)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>سهم / کارمزد آژانس واسط</span>
                  <span className="font-bold text-foreground">{agencyCommission}٪</span>
                </div>
                <Slider
                  value={[agencyCommission]}
                  onValueChange={(val) => setAgencyCommission(val[0])}
                  max={50}
                  min={0}
                  step={5}
                  className="py-2"
                />
              </div>
            </div>

            <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pricingMode === "net" 
                  ? "در حالت خالص، کارمزد آژانس به تعرفه اصلی شما اضافه می‌شود تا پس از کسر کارمزد، مبلغ پایه شما دست‌نخورده باقی بماند." 
                  : "در حالت ناخالص، کارمزد آژانس از مبلغ دریافتی کسر می‌شود. مبلغ نهایی پیشنهادی به اسپانسر همان تعرفه محاسبه‌شده خواهد بود."}
              </p>
            </div>
          </Card>

        </div>

        {/* Right Column: Live Results & Analytics (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Tariff Display Card */}
          <Card className="relative overflow-hidden border-none shadow-2xl p-8 text-center text-white bg-slate-950/80">
            {/* Dynamic Glow and Platform Color */}
            <div className={`absolute inset-0 bg-gradient-to-br ${activeConfig.gradient} opacity-20 pointer-events-none`} />
            
            <div className="relative z-10 space-y-6">
              
              <div className="flex justify-center">
                <span className="px-3 py-1 text-xs rounded-full bg-white/10 backdrop-blur-md border border-white/10 uppercase tracking-widest font-bold">
                  {activeConfig.name}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  تعرفه نهایی پیشنهادی به اسپانسر ({pricingMode === "net" ? "افزوده با کارمزد" : "قیمت ناخالص"})
                </h4>
                <div className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: activeConfig.accentColor }}>
                  <AnimatedCounter value={finalGross} />
                  <span className="text-base font-normal opacity-85 mr-2">تومان</span>
                </div>
                <p className="text-xs opacity-60 font-light mt-1">
                  معادل {((finalGross) / 1000000).toFixed(2)} میلیون تومان
                </p>
              </div>

              {/* Stacked breakdown bar visualizer */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] opacity-75 font-semibold">
                  <span>سهم شما: {pricingMode === "net" ? "۱۰۰٪" : `${100 - agencyCommission}٪`}</span>
                  <span>کارمزد آژانس: {agencyCommission}٪</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${pricingMode === "net" ? 100 - (finalAgency / Math.max(finalGross, 1) * 100) : 100 - agencyCommission}%` }} 
                  />
                  <div 
                    className="h-full bg-slate-600 transition-all duration-500" 
                    style={{ width: `${pricingMode === "net" ? (finalAgency / Math.max(finalGross, 1) * 100) : agencyCommission}%` }} 
                  />
                </div>
              </div>

              {/* Price Breakdown Grid */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 text-right">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">تعرفه ناخالص کل</div>
                  <div className="font-extrabold text-sm mt-0.5">
                    {finalGross.toLocaleString()} <span className="text-[10px] font-normal">تومان</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">خالص دریافتی شما</div>
                  <div className="font-extrabold text-sm text-emerald-400 mt-0.5">
                    {finalNet.toLocaleString()} <span className="text-[10px] font-normal">تومان</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">کارمزد آژانس</div>
                  <div className="font-extrabold text-sm text-rose-400 mt-0.5">
                    {finalAgency.toLocaleString()} <span className="text-[10px] font-normal">تومان</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold">تعداد آیتم پکیج</div>
                  <div className="font-extrabold text-sm text-sky-400 mt-0.5">
                    {totalQuantity} عدد
                  </div>
                </div>
              </div>

              {/* Sync with Media Kit Action */}
              <div className="pt-2">
                <Button 
                  onClick={handleSyncToMediaKit}
                  disabled={isSyncing}
                  className="w-full gap-2 bg-white text-slate-900 font-bold hover:bg-white/90 shadow-lg shadow-white/5 transition-all duration-300 py-6 text-sm border-0"
                >
                  <Share2 size={16} />
                  {isSyncing ? "در حال ثبت..." : "ثبت در کارت تعرفه مدیاکیت"}
                </Button>
              </div>

            </div>
          </Card>

          {/* ROI Scorecard Panel */}
          <Card className="p-6 border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-foreground">تخمین بازدهی کمپین (ROI) برای اسپانسر</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-muted-foreground">بازدید کل تخمینی (Reach)</div>
                <div className="text-xl font-black mt-1 text-foreground">
                  {roi.estViews.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">مبتنی بر نرخ تعامل شما</div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-muted-foreground">کلیک تخمینی (Clicks)</div>
                <div className="text-xl font-black mt-1 text-foreground text-emerald-400">
                  {roi.estClicks.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">نرخ کلیک فرض‌شده: ۱.۸٪</div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-muted-foreground">ثبت‌نام/خرید تخمینی (Conversions)</div>
                <div className="text-xl font-black mt-1 text-foreground text-sky-400">
                  {roi.estConversions.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">نرخ تبدیل فرض‌شده: ۴.۵٪</div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <div className="text-xs text-muted-foreground">شاخص هزینه بازدید (CPM)</div>
                <div className="text-xl font-black mt-1 text-foreground">
                  {roi.estCpm.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">تومان به ازای ۱۰۰۰ بازدید</div>
              </div>
            </div>

            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 text-xs text-emerald-400/90 leading-relaxed">
              <strong>💡 مزیت رقابتی شما:</strong> با تعرفه پیشنهادی شما، اسپانسر به ازای هر ۱۰۰۰ بازدید متوسط مبلغ <strong>{roi.estCpm.toLocaleString()} تومان</strong> پرداخت می‌کند که در مقایسه با شبکه‌های تبلیغاتی متمرکز بسیار منصفانه است.
            </div>
          </Card>

          {/* Negotiate Tips Card */}
          <Card className="p-6 border border-white/10 bg-slate-900/40 backdrop-blur-md">
            <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2" style={{ color: activeConfig.accentColor }}>
              <Briefcase size={16} />
              نکات طلایی مذاکره با اسپانسرها ({activeConfig.name})
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "تمرکز روی بازخورد و تعامل",
                  desc: "همواره به نرخ تعامل (Engagement) و مخاطب وفادارتان استناد کنید. تعداد فالوور دیگر ملاک اصلی کیفیت کار نیست."
                },
                {
                  title: "پیشنهاد تخفیف قرارداد بلندمدت",
                  desc: "برای قراردادهای کمپین چندماهه یا پکیج‌های پرتعداد، ۱۰ تا ۲۰ درصد تخفیف بر اساس قیمت پایه پیشنهاد دهید."
                },
                {
                  title: "نحوه شارژ حق انحصار و فوریت",
                  desc: "اگر اسپانسر می‌خواهد در طول هفته هیچ برند رقیبی را معرفی نکنید، ۲۵ تا ۳۵ درصد حق انحصار دریافت کنید."
                }
              ].map((tip, idx) => (
                <div key={idx} className="flex gap-3 items-start text-right">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{tip.title}</h5>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
