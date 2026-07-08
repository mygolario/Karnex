"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationWizardProps {
  onAnalyze: (params: {
    city: string;
    address: string;
    businessDescription: string;
    options: {
      priceTier: "budget" | "mid" | "premium";
      footfallDependency: "high" | "destination";
      rentBudget: number;
      businessCategory: string;
    };
  }) => void;
  isLoading: boolean;
  initialValues?: {
    city?: string;
    address?: string;
    businessDescription?: string;
  };
}

const CATEGORIES = [
  { slug: "cafe", label: "کافه / قهوه‌فروشی", icon: "☕" },
  { slug: "restaurant", label: "رستوران / فست‌فود", icon: "🍔" },
  { slug: "supermarket", label: "سوپرمارکت / هایپرمارکت", icon: "🛒" },
  { slug: "boutique", label: "بوتیک / پوشاک", icon: "👕" },
  { slug: "beauty", label: "سالن زیبایی / آرایشگاه", icon: "✂️" },
  { slug: "gym", label: "باشگاه ورزشی", icon: "🏋️‍♂️" },
  { slug: "other", label: "سایر کسب‌وکارها", icon: "🏪" },
];

export function LocationWizard({ onAnalyze, isLoading, initialValues }: LocationWizardProps) {
  const [step, setStep] = useState(1);
  
  // Step 1: Location
  const [city, setCity] = useState(initialValues?.city || "تهران");
  const [address, setAddress] = useState(initialValues?.address || "");

  // Step 2: Business
  const [businessDescription, setBusinessDescription] = useState(
    initialValues?.businessDescription || ""
  );
  const [businessCategory, setBusinessCategory] = useState("cafe");

  // Step 3: Financials
  const [rentBudget, setRentBudget] = useState<number>(30000000); // 30M Tomans default
  const [avgTicket, setAvgTicket] = useState<number>(200000); // 200k Tomans

  // Step 4: Audience
  const [priceTier, setPriceTier] = useState<"budget" | "mid" | "premium">("mid");
  const [footfallDependency, setFootfallDependency] = useState<"high" | "destination">("high");

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!address.trim()) return;
    onAnalyze({
      city,
      address,
      businessDescription,
      options: {
        priceTier,
        footfallDependency,
        rentBudget,
        businessCategory,
      },
    });
  };

  const toToman = (val: number) => {
    return val.toLocaleString("fa-IR") + " تومان";
  };

  const stepsInfo = [
    { id: 1, title: "موقعیت مکانی", icon: MapPin },
    { id: 2, title: "مشخصات صنف", icon: Briefcase },
    { id: 3, title: "پروفایل مالی", icon: DollarSign },
    { id: 4, title: "جامعه هدف", icon: Users },
  ];

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 dir-rtl text-right">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${((step - 1) / 3) * 100}%`, right: 0 }}
        />
        
        {stepsInfo.map((s) => {
          const Icon = s.icon;
          const isActive = step >= s.id;
          const isCurrent = step === s.id;
          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => !isLoading && s.id < step && setStep(s.id)}
                disabled={isLoading || s.id > step}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300",
                  isCurrent
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-110"
                    : isActive
                    ? "bg-slate-900 border-violet-500 text-violet-400"
                    : "bg-slate-950 border-white/5 text-muted-foreground"
                )}
              >
                <Icon size={16} />
              </button>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  isCurrent ? "text-white font-bold" : isActive ? "text-violet-400" : "text-muted-foreground"
                )}
              >
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Form Container */}
      <Card className="p-6 md:p-8 bg-slate-900/40 border-white/5 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 min-h-[260px]"
          >
            {/* STEP 1: LOCATION */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">کجا قرار است راه‌اندازی کنید؟</h3>
                  <p className="text-xs text-muted-foreground">شهر و محدوده دقیق یا آدرس تقریبی مغازه را وارد کنید.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="city" className="text-xs text-muted-foreground">شهر</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-slate-950/40 border-white/5 h-10 text-xs text-white"
                      placeholder="مثلاً تهران"
                    />
                  </div>
                  <div className="space-y-2 col-span-3">
                    <Label htmlFor="address" className="text-xs text-muted-foreground">محله، خیابان و پلاک تقریبی</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-slate-950/40 border-white/5 h-10 text-xs text-white"
                      placeholder="مثلاً نیاوران، بعد از سه راه یاسر، پلاک ۱۲"
                    />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs flex gap-2 items-start text-indigo-300">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span>پس از اتمام این مراحل، می‌توانید پین دقیق را روی نقشه جابجا کنید تا داده‌های مکانی بر اساس آن تحلیل شوند.</span>
                </div>
              </div>
            )}

            {/* STEP 2: BUSINESS DETAILS */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">جزئیات ایده و نوع صنف</h3>
                  <p className="text-xs text-muted-foreground">صنف و ایده خود را مشخص کنید تا تحلیل هوشمند شخصی‌سازی شود.</p>
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-muted-foreground">دسته‌بندی اصلی کسب‌وکار</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => {
                      const selected = businessCategory === cat.slug;
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => setBusinessCategory(cat.slug)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5",
                            selected
                              ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
                              : "bg-slate-950/20 border-white/5 text-muted-foreground hover:bg-slate-950/40"
                          )}
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-[10px]">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs text-muted-foreground">توضیح مختصر در مورد کانسپت شما (رایگان)</Label>
                  <Input
                    id="description"
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    className="bg-slate-950/40 border-white/5 h-10 text-xs text-white"
                    placeholder="مثلاً کافه موج سوم با تمرکز بر بیرون‌بر و قهوه تخصصی تجاری"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: FINANCIALS */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">بودجه و پروفایل مالی صنف</h3>
                  <p className="text-xs text-muted-foreground">برای ارزیابی همخوانی دخل‌وخرج و پیشنهاد اجاره بهینه.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="rent" className="text-xs text-muted-foreground">حداکثر بودجه اجاره ماهانه (تومان)</Label>
                    <Input
                      id="rent"
                      type="number"
                      value={rentBudget || ""}
                      onChange={(e) => setRentBudget(Number(e.target.value))}
                      className="bg-slate-950/40 border-white/5 h-10 text-xs text-white"
                      placeholder="مثلاً ۳۰۰۰۰۰۰۰"
                    />
                    <p className="text-[10px] text-violet-400 font-semibold">{toToman(rentBudget)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticket" className="text-xs text-muted-foreground">میانگین فاکتور مشتری (تومان)</Label>
                    <Input
                      id="ticket"
                      type="number"
                      value={avgTicket || ""}
                      onChange={(e) => setAvgTicket(Number(e.target.value))}
                      className="bg-slate-950/40 border-white/5 h-10 text-xs text-white"
                      placeholder="مثلاً ۱۵۰۰۰۰"
                    />
                    <p className="text-[10px] text-violet-400 font-semibold">{toToman(avgTicket)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: AUDIENCE & STRATEGY */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">جامعه هدف و وابستگی به پاخور</h3>
                  <p className="text-xs text-muted-foreground">تطبیق ویژگی‌های فیزیکی خیابان با مدل جذب مشتری ایده شما.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">تکیه بر ترافیک عبوری (پاخور خیابان)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFootfallDependency("high")}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all text-xs flex flex-col gap-1 items-center justify-center",
                          footfallDependency === "high"
                            ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
                            : "bg-slate-950/20 border-white/5 text-muted-foreground"
                        )}
                      >
                        <TrendingUp size={16} className="text-violet-400" />
                        <span>پاخور بالا (فروشگاه، کافه گذری)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFootfallDependency("destination")}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all text-xs flex flex-col gap-1 items-center justify-center",
                          footfallDependency === "destination"
                            ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
                            : "bg-slate-950/20 border-white/5 text-muted-foreground"
                        )}
                      >
                        <MapPin size={16} className="text-indigo-400" />
                        <span>مقصدمحور (کافه تخصصی، آتلیه)</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">رده قیمت گذاری خدمات/کالا</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["budget", "mid", "premium"] as const).map((tier) => {
                        const selected = priceTier === tier;
                        const label = tier === "budget" ? "اقتصادی" : tier === "premium" ? "لوکس" : "متوسط";
                        return (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setPriceTier(tier)}
                            className={cn(
                              "p-3 rounded-xl border text-center text-[10px] transition-all",
                              selected
                                ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
                                : "bg-slate-950/20 border-white/5 text-muted-foreground"
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Buttons Controls */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={isLoading}
              className="text-xs border-white/5 hover:bg-white/5 gap-1.5 h-9"
            >
              <ArrowRight size={14} />
              قبلی
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              size="sm"
              onClick={handleNext}
              disabled={step === 1 && !address.trim()}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 h-9 px-4"
            >
              بعدی
              <ArrowLeft size={14} />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading || !address.trim()}
              className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white gap-1.5 h-9 px-5 font-bold"
            >
              {isLoading ? "در حال پردازش..." : "شروع تحلیل هوشمند"}
              <Sparkles size={14} className="animate-pulse" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
