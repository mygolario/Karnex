"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  MessageCircle,
  FileText,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Map,
  LayoutGrid,
  Palette,
  BookOpen,
  Search,
  Lightbulb,
  ArrowLeft,
  ExternalLink,
  X,
  CircleHelp,
  Play,
  Activity,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Send,
  Loader2,
  Smile,
  Meh,
  Frown,
  Heart,
  TrendingUp
} from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTourStore } from "@/lib/tour/store";
import { getToursForProjectType, getNextRecommendedTour, ACCENT_CLASSES } from "@/lib/tour/registry";
import { tourI18n } from "@/lib/tour/i18n";
import { useProject } from "@/contexts/project-context";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Interface definitions
interface FAQ {
  id: string;
  q: string;
  a: string;
  category: "general" | "startup" | "traditional" | "creator";
  tags: string[];
}

function completedFraction(completed: number, total: number): string {
  return `${toPersianDigits(completed)}/${toPersianDigits(total)} تکمیل شده`;
}

export default function HelpCenterPage() {
  const { activeProject } = useProject();
  const projectType = (activeProject?.projectType || "startup") as "startup" | "traditional" | "creator";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "faq" | "features" | "tours" | "glossary" | "changelog">("search");
  const [faqFilter, setFaqFilter] = useState<"all" | "personalized" | "general">("all");
  const [ratedFaqs, setRatedFaqs] = useState<Record<string, "up" | "down">>({});
  const [recentlyViewed, setRecentlyViewed] = useState<FAQ[]>([]);
  const [showStatusDetails, setShowStatusDetails] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // FAB Ticket Form States
  const [fabFormData, setFabFormData] = useState({ subject: "", category: "technical", message: "" });
  const [fabLoading, setFabLoading] = useState(false);
  const [fabSubmitted, setFabSubmitted] = useState(false);
  const [fabSatisfaction, setFabSatisfaction] = useState<number | null>(null);

  const startTour = useTourStore((s) => s.startTour);
  const completedTours = useTourStore((s) => s.persisted.completedTours);
  const skippedTours = useTourStore((s) => s.persisted.skippedTours);
  const activeTourId = useTourStore((s) => s.persisted.activeTourId);
  const tours = getToursForProjectType(activeProject?.projectType).filter((t) => t.id !== "whats-new");
  const nextTour = getNextRecommendedTour(completedTours, activeProject?.projectType);
  const hubCompletedCount = tours.filter((t) => completedTours.includes(t.id)).length;

  // Load and save recently viewed FAQs
  useEffect(() => {
    const saved = localStorage.getItem("karnex_recently_viewed_help");
    if (saved) {
      try {
        setRecentlyViewed(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const addRecentlyViewed = (faq: FAQ) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== faq.id);
      const updated = [faq, ...filtered].slice(0, 5);
      localStorage.setItem("karnex_recently_viewed_help", JSON.stringify(updated));
      return updated;
    });
  };

  // Comprehensive localized FAQs with tags for dynamic search matching
  const faqs: FAQ[] = [
    // General FAQs
    {
      id: "g1",
      q: "چطور با پلتفرم کارنکس شروع کنم؟",
      a: "از نقشه راه (Roadmap) پروژه خود شروع کنید! هر مرحله را با دقت مطالعه کرده و تیک بزنید. هر قدم شامل توضیحات کامل، راهنمای گام‌به‌گام و ابزارهای ایرانی و خارجی پیشنهادی است.",
      category: "general",
      tags: ["شروع", "نقشه راه", "آموزش", "چک لیست"]
    },
    {
      id: "g2",
      q: "بوم کسب‌وکار چیست و چگونه آن را ویرایش کنم؟",
      a: "بوم کسب‌وکار (Lean Canvas) نقشه یک‌صفحه‌ای از مدل تجاری شماست. در بخش بوم کسب‌وکار، می‌توانید ماوس را روی هر بخش نگه‌دارید و با فشردن دکمه ویرایش هوشمند (✨) از دستیار هوش مصنوعی بخواهید محتوا را مجدداً بنویسد یا اصلاح کند.",
      category: "general",
      tags: ["بوم", "ویرایش", "مدل کسب و کار", "تغییر بوم"]
    },
    {
      id: "g3",
      q: "چگونه می‌توانم از طرح کسب‌وکار خود خروجی PDF یا تصویر بگیرم؟",
      a: "کافیست به بخش 'بوم کسب‌وکار' یا 'نقشه راه' مراجعه کنید و بر روی دکمه مشکی‌رنگ 'دانلود PDF' کلیک کنید. سیستم یک فایل خوش‌ساخت و متناسب با ابعاد استاندارد برای ارائه به سرمایه‌گذاران آماده می‌کند.",
      category: "general",
      tags: ["خروجی", "دانلود", "پی دی اف", "PDF", "عکس", "پرینت"]
    },
    {
      id: "g4",
      q: "آیا امنیت ایده‌ها و طرح‌های من تضمین شده است؟",
      a: "بله، تمام اطلاعات پروژه‌های شما بر روی پایگاه‌های داده رمزنگاری شده ذخیره شده و هیچ شخص دیگری به جز شما دسترسی به محتوای بوم یا ایده‌تان ندارد.",
      category: "general",
      tags: ["امنیت", "حریم خصوصی", "ایده", "سرقت ایده"]
    },
    // Startup FAQs
    {
      id: "s1",
      q: "چگونه ایده استارتاپی خود را بدون هزینه اعتبارسنجی کنم؟",
      a: "پیشنهاد می‌کنیم با ۱۰ تا ۲۰ نفر از مخاطبان هدف صحبت کنید. بدون اینکه ایده خود را مستقیماً بفروشید، از آن‌ها درباره مشکلاتشان بپرسید و ببینید در حال حاضر چطور آن را حل می‌کنند. اگر بیش از ۷۰ درصد تمایل نشان دادند، ایده شما پتانسیل خوبی دارد.",
      category: "startup",
      tags: ["اعتبارسنجی", "مشتری", "نیازسنجی", "ایده نوپا", "ارزیابی"]
    },
    {
      id: "s2",
      q: "حداقل محصول قابل ارائه (MVP) چیست و چطور آن را بسازم؟",
      a: "MVP ساده‌ترین نسخه محصول شماست که فقط مشکل اصلی مشتری را برطرف می‌کند. هدف از آن دریافت سریع بازخورد بازار است. برای ساخت آن در شروع کار از ابزارهای بدون کد (No-Code) نظیر سایت‌سازهای ایرانی یا فرم‌سازها استفاده کنید.",
      category: "startup",
      tags: ["ام وی پی", "MVP", "نمونه اولیه", "نوکد", "ساخت سریع"]
    },
    {
      id: "s3",
      q: "چگونه برای استارتاپ خود در ایران جذب سرمایه کنیم؟",
      a: "پس از اعتبارسنجی اولیه و ساخت MVP، ارائه (Pitch Deck) خود را آماده کنید. می‌توانید به شتاب‌دهنده‌ها، صندوق‌های سرمایه‌گذاری جسورانه (VC) یا فرشتگان سرمایه‌گذار در اکوسیستم استارتاپی ایران مراجعه کنید.",
      category: "startup",
      tags: ["سرمایه", "جذب سرمایه", "سرمایه گذار", "ارائه", "پیچ دک"]
    },
    // Traditional Business FAQs
    {
      id: "t1",
      q: "مجوزهای قانونی لازم برای شروع یک کسب‌وکار سنتی چیست؟",
      a: "بسته به صنف کاری شما، به جواز کسب از اتحادیه مربوطه نیاز دارید. همچنین ثبت نام در سامانه مالیاتی و دریافت کد اقتصادی از ملزومات اولیه است. کارنکس در بخش 'الزامات قانونی' بر اساس صنف شما راهنمای دقیقی ارائه می‌کند.",
      category: "traditional",
      tags: ["مجوز", "قانون", "جواز کسب", "اتحادیه", "صنف"]
    },
    {
      id: "t2",
      q: "چگونه می‌توانیم نماد اعتماد الکترونیکی (اینماد) و درگاه پرداخت دریافت کنیم؟",
      a: "باید ابتدا در سامانه enamad.ir ثبت‌نام کنید و پس از احراز هویت آدرس و شماره تلفن، اینماد بدون ستاره یا تک‌ستاره بگیرید. سپس می‌توانید از درگاه‌های پرداخت واسط مانند زیبال (Zibal) در چند ساعت درگاه فعال دریافت کنید.",
      category: "traditional",
      tags: ["اینماد", "درگاه", "بانک", "زیبال", "پرداخت اینترنتی"]
    },
    {
      id: "t3",
      q: "آیا از ابتدا باید شرکت رسمی ثبت کنم و مالیات بدهم؟",
      a: "خیر، نیازی به ثبت شرکت رسمی در ماه‌های اول نیست و می‌توانید به عنوان شخص حقیقی فعالیت کنید. اما پرونده مالیاتی انفرادی (کد اقتصادی) برای دریافت درگاه پرداخت یا دستگاه کارتخوان ضروری است.",
      category: "traditional",
      tags: ["مالیات", "ثبت شرکت", "حقوقی", "حقیقی", "اداره مالیات"]
    },
    // Creator FAQs
    {
      id: "c1",
      q: "چگونه تعرفه تبلیغات و اسپانسر شیپ پیج یا کانال خود را مشخص کنم؟",
      a: "تعرفه بر اساس تعداد بازدید یکتای پست‌ها (Impression)، نرخ تعامل (Engagement Rate) و حوزه تخصصی شما تعیین می‌شود. از بخش 'تعرفه اسپانسرها' در داشبورد کارنکس کمک بگیرید تا فرمول محاسبه اصولی را ببینید.",
      category: "creator",
      tags: ["تعرفه", "تبلیغات", "اسپانسر", "قیمت پست", "مانیتایز"]
    },
    {
      id: "c2",
      q: "بهترین ابزارها برای ساخت و مدیریت تقویم محتوایی چیست؟",
      a: "برای تدوین تقویم محتوایی می‌توانید از ابزارهایی مانند نوشن (Notion)، ترلو (Trello) یا سیستم مدیریت محتوای اختصاصی کارنکس در بخش 'تقویم محتوایی' استفاده کنید که زمان‌بندی انتشار محتوا را خودکار می‌کند.",
      category: "creator",
      tags: ["تقویم", "محتوا", "اینستاگرام", "یوتیوب", "برنامه ریزی"]
    },
    {
      id: "c3",
      q: "چگونه مخاطبان کانال را به خریداران وفادار تبدیل کنم؟",
      a: "روی تولید محتوای آموزشی و حل مسئله مخاطب تمرکز کنید. با ایجاد لید مگنت (فایل‌های رایگان، کتابچه یا وبینار کوتاه در ازای ایمیل/شماره تماس)، ارتباط مستقیم ایمیلی یا پیامکی برقرار کنید و محصولات خود را معرفی کنید.",
      category: "creator",
      tags: ["مخاطب", "جذب فالوور", "فروش محتوا", "اعتمادسازی"]
    }
  ];

  // Business Glossary
  const glossary: Record<string, string> = {
    "MVP (حداقل محصول قابل ارائه)": "ساده‌ترین نسخه محصول که فقط ویژگی‌های حیاتی برای حل مشکل مشتری را دارد و برای ارزیابی بازار استفاده می‌شود.",
    "Lean Canvas (بوم ناب)": "یک قالب یک‌صفحه‌ای مدیریت استراتژیک برای توسعه مدل‌های کسب‌وکار جدید در سریع‌ترین زمان ممکن.",
    "Market Validation (اعتبارسنجی بازار)": "فرایند تست یک ایده کسب‌وکار با مشتریان واقعی پیش از سرمایه‌گذاری سنگین.",
    "Customer Persona (پرسونای مشتری)": "یک توصیف نیمه‌تخیلی از مشتری ایده‌آل شما بر اساس داده‌ها و تحقیقات بازار.",
    "Sales Funnel (قیف فروش)": "مراحل گام‌به‌گامی که یک مخاطب معمولی طی می‌کند تا به یک مشتری پرداخت‌کننده تبدیل شود.",
    "CAC (هزینه جذب مشتری)": "کل هزینه‌های بازاریابی و فروش تقسیم بر تعداد کل مشتریان جدید جذب شده در یک بازه زمانی خاص.",
    "LTV (ارزش طول عمر مشتری)": "میزان سود کل پیش‌بینی‌شده‌ای که یک مشتری در طول مدت ارتباط خود با کسب‌وکار شما ایجاد می‌کند.",
    "Pivot (چرخش استراتژیک)": "تغییر جهت استراتژیک در مدل کسب‌وکار زمانی که محصول یا فرضیات اولیه در بازار شکست بخورند."
  };

  // Changelog timeline
  const changelog = [
    {
      version: "v2.5.0",
      date: "تیر ۱۴۰۵",
      badge: "جدید",
      badgeVariant: "success" as const,
      changes: [
        "سیستم پیشرفته ارزیابی و امتیازدهی کسب‌وکار (Karnex Score) با گریدهای S تا D.",
        "مرکز راهنما و پشتیبانی کاملاً جدید با جستجوی هوشمند و بخش‌های شخصی‌سازی شده.",
        "سیستم تعاملی چت و تیکت پشتیبانی فوری به همراه نظرسنجی رضایت کاربران."
      ]
    },
    {
      version: "v2.4.0",
      date: "خرداد ۱۴۰۵",
      badge: "بهبود",
      badgeVariant: "default" as const,
      changes: [
        "پشتیبانی از درگاه پرداخت مستقیم ایرانی زیبال (Zibal) جهت ارتقای سریع اشتراک.",
        "امکان دانلود بوم کسب‌وکار در قالب فرمت PDF استاندارد و عکس با وضوح بالا.",
        "بازنویسی دستیار هوش مصنوعی با بهینه‌سازی کلمات کلیدی فارسی و بازار ایران."
      ]
    },
    {
      version: "v2.2.0",
      date: "اردیبهشت ۱۴۰۵",
      badge: "بهبود",
      badgeVariant: "default" as const,
      changes: [
        "راه‌اندازی ابزار هوشمند تدوین تعرفه اسپانسری مخصوص تولیدکنندگان محتوا.",
        "پشتیبانی کامل از تقویم جلالی (Solar Hijri) در بخش برنامه‌ریزی محتوایی.",
        "کاهش ۵۰ درصدی تاخیر پاسخ‌دهی دستیار هوشمند با به‌کارگیری تکنیک استریم خروجی."
      ]
    }
  ];

  // Features list
  const features = [
    {
      icon: <Map size={20} />,
      title: "نقشه راه کسب‌وکار",
      description: "چک‌لیست کاملی از گام‌های اجرایی مورد نیاز ایده شما که متناسب با پیشرفتتان بروز می‌شود.",
      href: "/dashboard/roadmap",
      variant: "primary" as const
    },
    {
      icon: <LayoutGrid size={20} />,
      title: "بوم کسب‌وکار (Canvas)",
      description: "فضای مصورسازی ایده در ۹ بخش کلیدی به همراه امکان نگارش مجدد هر خانه با هوش مصنوعی.",
      href: "/dashboard/canvas",
      variant: "accent" as const
    },
  ];

  // Custom client-side synonym-expanded search & ranker
  const getSearchFilteredFaqs = () => {
    if (!searchQuery.trim()) return faqs;
    
    // Simple synonym map
    const synonyms: Record<string, string[]> = {
      "پول": ["درگاه", "پرداخت", "بانک", "زیبال", "مالی", "درآمد", "تعرفه"],
      "مجوز": ["قانون", "ثبت شرکت", "جواز کسب", "اینماد", "مالیات"],
      "ایده": ["شروع", "استارتاپ", "اعتبارسنجی", "بوم کسب‌وکار"],
      "سایت": ["وب‌سایت", "لینک", "اینترنت"]
    };

    const queryLower = searchQuery.toLowerCase();
    
    // Find extra terms based on synonyms
    let searchTerms = [queryLower];
    Object.entries(synonyms).forEach(([key, values]) => {
      if (queryLower.includes(key) || values.some(v => queryLower.includes(v))) {
        searchTerms.push(key, ...values);
      }
    });

    return faqs.map(faq => {
      let score = 0;
      searchTerms.forEach(term => {
        if (faq.q.toLowerCase().includes(term)) score += 10;
        if (faq.a.toLowerCase().includes(term)) score += 5;
        if (faq.tags.some(t => t.toLowerCase().includes(term))) score += 8;
      });
      return { faq, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.faq);
  };

  const searchedFaqs = getSearchFilteredFaqs();

  // Get FAQs based on personalization filters
  const getPersonalizedFaqs = () => {
    let list = faqs;
    if (faqFilter === "personalized") {
      list = faqs.filter(f => f.category === projectType);
    } else if (faqFilter === "general") {
      list = faqs.filter(f => f.category === "general");
    }
    return list;
  };

  const filteredFaqs = getPersonalizedFaqs();

  const handleRate = (id: string, dir: "up" | "down") => {
    setRatedFaqs(prev => ({ ...prev, [id]: dir }));
    toast.success("بازخورد شما با موفقیت ثبت شد!");
  };

  const handleFabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fabFormData.message.trim()) return toast.error("لطفا متن پیام خود را وارد کنید.");
    
    setFabLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: activeProject?.projectName || "کاربر پلتفرم",
          email: "support_in_app@karnex.ir",
          subject: `[${fabFormData.category}] ${fabFormData.subject || "تیکت فوری از مرکز راهنما"}`,
          message: fabFormData.message
        })
      });
      
      if (!res.ok) throw new Error();
      
      setFabSubmitted(true);
      toast.success("تیکت شما با موفقیت به پشتیبانی ارسال شد.");
    } catch (e) {
      toast.error("خطا در ارسال پیام. لطفا دوباره تلاش کنید.");
    } finally {
      setFabLoading(false);
    }
  };

  return (
    <div className="max-w-[1050px] mx-auto space-y-8 pb-24 md:pb-20 animate-fade-in relative" dir="rtl">
      
      {/* Dynamic Animated Glass Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-2xl py-16 px-6 md:px-12 text-center border border-white/5">
        
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30" />
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-gentle" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.8rem] bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 mb-6 shadow-2xl animate-bounce-gentle">
            <HelpCircle size={40} className="text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 leading-tight">
            پشتیبانی و مرکز راهنمای هوشمند
          </h1>
          <p className="text-lg text-slate-300 font-medium mb-8 max-w-xl mx-auto">
            پاسخ تمام چالش‌های کسب‌وکار شما متناسب با صنف کاری‌تان اینجاست.
          </p>

          {/* Interactive Search Bar */}
          <div className="w-full max-w-xl relative group">
            <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:bg-primary/20 transition-all duration-500" />
            <div className="relative bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center p-2 shadow-2xl transition-all duration-300 focus-within:border-primary/40 focus-within:scale-[1.01]">
              <Search size={22} className="text-muted-foreground mr-3" />
              <input
                type="text"
                placeholder="چیزی بپرسید... (مثال: درگاه پرداخت، ثبت شرکت، تعرفه)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "search") setActiveTab("search");
                }}
                className="w-full bg-transparent border-none text-white placeholder:text-slate-500 text-base px-2 h-12 focus:ring-0 focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={18} className="text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Right Sidebar Tabs (RTL) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card/40 backdrop-blur-md border border-border/50 p-3 rounded-3xl flex flex-col gap-1.5">
            {[
              { id: "search", label: "جستجو و راهنمایی", icon: Search },
              { id: "faq", label: "سوالات متداول", icon: CircleHelp },
              { id: "features", label: "امکانات پلتفرم", icon: LayoutGrid },
              { id: "tours", label: "تورهای تعاملی", icon: Play },
              { id: "glossary", label: "واژه‌نامه کسب‌وکار", icon: BookOpen },
              { id: "changelog", label: "بروزرسانی‌ها (Changelog)", icon: Clock },
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <TabIcon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Platform Status Widget */}
          <div className="bg-card/45 backdrop-blur-md border border-border/50 rounded-3xl p-5 space-y-4 overflow-hidden relative">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Activity size={16} className="text-emerald-500 animate-pulse" />
                <span>وضعیت پلتفرم</span>
              </h3>
              <Badge variant="success" size="sm" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15 border-transparent">
                عالی
              </Badge>
            </div>
            
            <div className="space-y-3 pt-1">
              {[
                { name: "موتور تحلیل استراتژیک (AI)", status: "فعال", lat: "۱.۸ ثانیه" },
                { name: "درگاه مالی پلتفرم (Zibal)", status: "فعال", lat: "۸۰ میلی‌ثانیه" },
                { name: "پایگاه داده پروژه‌ها (Postgres)", status: "فعال", lat: "۴۵ میلی‌ثانیه" }
              ].map((serv, index) => (
                <div key={index} className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-muted-foreground">{serv.name}</span>
                  <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    {serv.status}
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowStatusDetails(!showStatusDetails)}
              className="w-full text-center text-[11px] font-bold text-primary hover:underline mt-2 block"
            >
              {showStatusDetails ? "بستن جزئیات شبکه" : "مشاهده تاخیر زمانی"}
            </button>

            <AnimatePresence>
              {showStatusDetails && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border/40 pt-3 mt-2 text-[10px] space-y-2 text-muted-foreground font-mono"
                >
                  <div>PING to openrouter.ai: 110ms</div>
                  <div>PING to zibal.ir: 24ms</div>
                  <div>Database Load Status: 4.8%</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Central Display Pane */}
        <div className="lg:col-span-9 space-y-6">

          {/* Search Content Tab */}
          {activeTab === "search" && (
            <div className="space-y-6 animate-fade-in-up">
              
              {/* Recently Viewed Panel */}
              {recentlyViewed.length > 0 && !searchQuery && (
                <div className="bg-card/20 border border-border/40 rounded-3xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                    <Clock size={14} />
                    <span>اخیراً بازدید شده</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentlyViewed.map((view, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearchQuery(view.q);
                          setActiveTab("search");
                        }}
                        className="text-xs font-bold px-3.5 py-2 rounded-xl bg-card border border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-all text-foreground"
                      >
                        {view.q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Questions Grid */}
              {!searchQuery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-3xl p-6 space-y-4">
                    <h3 className="font-extrabold text-base flex items-center gap-2">
                      <TrendingUp size={18} className="text-indigo-400" />
                      <span>سوالات پربازدید کاربران</span>
                    </h3>
                    <div className="space-y-3 text-sm">
                      {[
                        { q: "چگونه فایل نهایی بوم را به صورت PDF دانلود کنیم؟", id: "g3" },
                        { q: "حداقل محصول قابل ارائه (MVP) چیست و نحوه ساخت؟", id: "s2" },
                        { q: "چطور درگاه واسط زیبال را دریافت و تست کنیم؟", id: "t2" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            const found = faqs.find(f => f.id === item.id);
                            if (found) {
                              setSearchQuery(found.q);
                              addRecentlyViewed(found);
                            }
                          }}
                          className="w-full text-right text-muted-foreground hover:text-primary transition-colors text-xs font-bold flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                          {item.q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-base flex items-center gap-2 mb-2">
                        <Sparkles size={18} className="text-amber-400" />
                        <span>پشتیبانی متناسب با نوع کسب‌وکار</span>
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                        داشبورد شما در حال حاضر روی حالت <span className="text-amber-500 font-black">
                          {projectType === "startup" ? "استارتاپ و تکنولوژی" 
                           : projectType === "traditional" ? "کسب‌وکار سنتی و خدماتی" 
                           : "تولید محتوا و رسانه"}
                        </span> تنظیم شده است. بخش سوالات متداول حاوی پیشنهادات اختصاصی است.
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setActiveTab("faq");
                        setFaqFilter("personalized");
                      }}
                      className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 mt-4 underline justify-end"
                    >
                      مشاهده سوالات اختصاصی صنف من
                      <ArrowLeft size={12} className="rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* FAQs Search Container */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-lg text-foreground">
                  {searchQuery ? "نتایج جستجو" : "تمام سوالات راهنما"}
                </h3>
                
                {searchedFaqs.length === 0 ? (
                  <div className="text-center py-12 bg-muted/20 border border-dashed rounded-3xl border-border/80">
                    <Search size={44} className="mx-auto text-muted-foreground opacity-40 mb-3" />
                    <p className="text-sm font-bold text-muted-foreground">نتیجه‌ای با عبارت جستجو شده یافت نشد.</p>
                  </div>
                ) : (
                  searchedFaqs.map((faq) => {
                    const isRated = ratedFaqs[faq.id];
                    return (
                      <div 
                        key={faq.id} 
                        className="bg-card/45 backdrop-blur-sm border border-border/60 hover:border-primary/20 rounded-2xl p-5 transition-all duration-300"
                        onClick={() => addRecentlyViewed(faq)}
                      >
                        <h4 className="font-extrabold text-sm text-foreground mb-2 flex items-center gap-2">
                          <HelpCircle size={16} className="text-primary/70" />
                          {faq.q}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed leading-7 font-medium pb-4 border-b border-border/40">
                          {faq.a}
                        </p>
                        
                        {/* Rating Component */}
                        <div className="flex justify-between items-center pt-3 text-[11px] font-bold">
                          <div className="flex gap-2">
                            {faq.tags.map((t, idx) => (
                              <Badge key={idx} variant="muted" size="sm" className="text-[10px]">
                                #{t}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500">آیا این مطلب مفید بود؟</span>
                            <div className="flex gap-1.5">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRate(faq.id, "up");
                                }}
                                disabled={!!isRated}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isRated === "up" 
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
                                    : "border-border/60 hover:bg-muted"
                                }`}
                              >
                                <ThumbsUp size={12} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRate(faq.id, "down");
                                }}
                                disabled={!!isRated}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isRated === "down" 
                                    ? "bg-red-500/10 text-red-500 border-red-500/30" 
                                    : "border-border/60 hover:bg-muted"
                                }`}
                              >
                                <ThumbsDown size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Dynamic Filterable FAQ Tab */}
          {activeTab === "faq" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h3 className="font-extrabold text-lg">دسته‌بندی پرسش‌ها</h3>
                <div className="flex bg-muted/60 p-1 rounded-xl border border-border/40 text-xs font-bold">
                  {[
                    { id: "all", label: "همه سوالات" },
                    { id: "personalized", label: `مخصوص ${projectType === "startup" ? "استارتاپ" : projectType === "traditional" ? "کسب‌وکار سنتی" : "تولیدکننده محتوا"}` },
                    { id: "general", label: "سوالات عمومی" }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      onClick={() => setFaqFilter(btn.id as any)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        faqFilter === btn.id 
                          ? "bg-card text-foreground shadow" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredFaqs.map((faq) => {
                  const isRated = ratedFaqs[faq.id];
                  return (
                    <div 
                      key={faq.id} 
                      className="bg-card/30 border border-border/50 rounded-2xl p-5 hover:border-primary/20 transition-all duration-300"
                    >
                      <h4 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
                        <CircleHelp size={16} className="text-indigo-400" />
                        {faq.q}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed leading-7 font-medium pb-4 border-b border-border/40">
                        {faq.a}
                      </p>
                      
                      <div className="flex justify-between items-center pt-3 text-[11px] font-bold">
                        <Badge variant="outline" className="text-[10px] border-border bg-muted/20">
                          {faq.category === "general" ? "عمومی" : "اختصاصی صنف"}
                        </Badge>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[10px]">مفید بود؟</span>
                          <button 
                            onClick={() => handleRate(faq.id, "up")}
                            disabled={!!isRated}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isRated === "up" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "border-border/60 hover:bg-muted"
                            }`}
                          >
                            <ThumbsUp size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === "features" && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h3 className="font-extrabold text-lg mb-2">راهنمای امکانات و بخش‌ها</h3>
                <p className="text-xs text-muted-foreground">چگونه بیشترین بهره را از ویژگی‌های هوشمند کارنکس ببریم؟</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {features.map((feature, i) => (
                  <div key={i} className="bg-card/45 border border-border/50 rounded-3xl p-6 space-y-4 flex flex-col justify-between group hover:border-primary/30 transition-all hover:shadow-xl">
                    <div className="space-y-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        feature.variant === "accent" ? "bg-amber-400/10 text-amber-500" : "bg-primary/10 text-primary"
                      }`}>
                        {feature.icon}
                      </div>
                      <h4 className="font-extrabold text-sm text-foreground">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed leading-6 font-semibold">{feature.description}</p>
                    </div>
                    
                    <Link href={feature.href} className="block pt-4">
                      <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-bold">
                        <span>ورود به بخش {feature.title}</span>
                        <ArrowLeft size={14} className="rotate-180" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tour Hub Tab — unified status, progress, and a prioritized next step */}
          {activeTab === "tours" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-extrabold text-lg mb-1">{tourI18n.hubTitle}</h3>
                  <p className="text-xs text-muted-foreground">{tourI18n.hubSubtitle}</p>
                </div>
                {tours.length > 0 && (
                  <Badge variant="outline" size="sm" className="text-[10px] border-border bg-muted/20">
                    {completedFraction(hubCompletedCount, tours.length)}
                  </Badge>
                )}
              </div>

              {/* Prioritized continue banner */}
              {nextTour ? (
                <div className="flex items-center justify-between gap-4 p-5 rounded-3xl border border-primary/20 bg-gradient-to-l from-primary/10 to-violet-500/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${(ACCENT_CLASSES[nextTour.accent] ?? ACCENT_CLASSES.primary).bg}`}>
                      <Play size={18} className={(ACCENT_CLASSES[nextTour.accent] ?? ACCENT_CLASSES.primary).text} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-primary mb-0.5">{tourI18n.hubContinue}</p>
                      <h4 className="font-bold text-sm text-foreground truncate">{nextTour.title}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">{nextTour.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="gradient"
                    className="rounded-xl text-xs font-bold shrink-0"
                    onClick={() => startTour(nextTour.id, 0, true)}
                  >
                    {activeTourId === nextTour.id ? tourI18n.resumeTour : tourI18n.startTour}
                  </Button>
                </div>
              ) : tours.length > 0 ? (
                <div className="p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {tourI18n.hubAllDone}
                </div>
              ) : null}

              <div className="space-y-3">
                {tours.length === 0 ? (
                  <p className="text-xs text-muted-foreground">هیچ توری برای پروژه شما در دسترس نیست.</p>
                ) : (
                  tours.map((tour) => {
                    const done = completedTours.includes(tour.id);
                    const skipped = !done && (skippedTours ?? []).includes(tour.id);
                    const inProgress = !done && activeTourId === tour.id;
                    const accent = ACCENT_CLASSES[tour.accent] ?? ACCENT_CLASSES.primary;
                    const statusLabel = done
                      ? tourI18n.hubStatusCompleted
                      : inProgress || skipped
                        ? tourI18n.hubStatusInProgress
                        : tourI18n.hubStatusNotStarted;

                    return (
                      <div key={tour.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-border/50 bg-card/40 hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent.bg}`}>
                            {done ? (
                              <CheckCircle size={18} className="text-emerald-500" />
                            ) : (
                              <CircleHelp size={18} className={accent.text} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-foreground truncate">{tour.title}</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{tour.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={done ? "success" : "outline"}
                                size="sm"
                                className={`text-[9px] px-1.5 py-0 ${done ? "bg-emerald-500/10 text-emerald-500 border-transparent" : "border-border bg-muted/20"}`}
                              >
                                {statusLabel}
                              </Badge>
                              {tour.estimatedTime && (
                                <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                  <Clock size={9} />
                                  {tour.estimatedTime}
                                </span>
                              )}
                              <span className="text-[9px] text-muted-foreground">
                                {tourI18n.hubStepsCount(tour.steps.length)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-amber-500 font-bold hidden sm:inline">
                            +{tour.xpReward} XP
                          </span>
                          <Button size="sm" variant="outline" className="gap-1 rounded-xl text-xs font-bold" onClick={() => startTour(tour.id, 0, true)}>
                            <Play size={12} />
                            {done ? "بازپخش" : inProgress ? tourI18n.resumeTour : "شروع"}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Glossary Tab */}
          {activeTab === "glossary" && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 text-amber-700 dark:text-amber-400">
                <Lightbulb size={20} className="shrink-0" />
                <p className="text-xs font-bold leading-5">این اصطلاحات را در طول تدوین بوم کسب‌وکار یا کار با مشاور هوش مصنوعی خواهید دید. اگر معنای واژه‌ای را نمی‌دانستید، در اینجا جستجو کنید!</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(glossary).map(([term, def], i) => (
                  <div key={i} className="bg-card/45 border border-border/50 p-5 rounded-2xl hover:border-primary/30 transition-all group">
                    <h4 className="font-extrabold text-sm text-primary mb-2 group-hover:scale-[1.01] transition-transform origin-right">{term}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed leading-6 font-semibold text-justify">{def}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changelog Tab */}
          {activeTab === "changelog" && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h3 className="font-extrabold text-lg mb-2">تغییرات و اخبار اخیر (Changelog)</h3>
                <p className="text-xs text-muted-foreground">آخرین امکانات اضافه شده و بروزرسانی‌های پلتفرم کارنکس.</p>
              </div>

              <div className="space-y-6 relative border-r border-border/60 pr-6 mr-3">
                {changelog.map((log, i) => (
                  <div key={i} className="relative space-y-2">
                    {/* Time indicator circle */}
                    <div className="absolute right-[-31px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                    
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-foreground">{log.version}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">{log.date}</span>
                      <Badge variant={log.badgeVariant} size="sm" className="text-[9px] px-1.5 py-0.5">
                        {log.badge}
                      </Badge>
                    </div>

                    <ul className="space-y-1.5 text-xs text-muted-foreground pr-1 list-disc list-inside leading-relaxed leading-6 font-semibold">
                      {log.changes.map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating Action Button (FAB) for Instant Ticket Portal */}
      <div className="fixed bottom-6 left-6 z-40">
        <motion.button
          onClick={() => {
            setFabOpen(true);
            setFabSubmitted(false);
            setFabSatisfaction(null);
            setFabFormData({ subject: "", category: "technical", message: "" });
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2.5 bg-primary text-primary-foreground p-4 rounded-full shadow-2xl shadow-primary/40 hover:bg-primary/95 transition-all duration-300 font-bold text-xs"
        >
          <MessageCircle size={20} />
          <span>گفتگو با پشتیبانی</span>
        </motion.button>
      </div>

      {/* Bottom Sheet Drawer for FAB Contact Form */}
      <AnimatePresence>
        {fabOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-card w-full max-w-md h-full border-r border-border/80 shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                      <MessageCircle size={22} />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-foreground">ارسال تیکت فوری پشتیبانی</h3>
                      <p className="text-[10px] text-muted-foreground">درخواست شما به طور مستقیم بررسی می‌شود</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFabOpen(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {!fabSubmitted ? (
                    <motion.form 
                      key="form"
                      onSubmit={handleFabSubmit} 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground mr-1">دسته‌بندی موضوع</label>
                        <select
                          value={fabFormData.category}
                          onChange={(e) => setFabFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-border/80 bg-background/50 focus:bg-background outline-none text-xs font-bold text-foreground"
                        >
                          <option value="technical">مشکل فنی و داشبورد</option>
                          <option value="billing">خطا در تراکنش یا پرداخت</option>
                          <option value="guidance">راهنمایی در مورد طرح یا بوم</option>
                          <option value="feedback">ثبت پیشنهاد و بازخورد</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground mr-1">عنوان کوتاه تیکت</label>
                        <input
                          type="text"
                          required
                          value={fabFormData.subject}
                          onChange={(e) => setFabFormData(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="مثال: مشکل در دانلود نسخه PDF بوم"
                          className="w-full p-3 rounded-xl border border-border/80 bg-background/50 focus:bg-background outline-none text-xs font-bold text-foreground"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground mr-1">متن درخواست شما</label>
                        <textarea
                          required
                          value={fabFormData.message}
                          onChange={(e) => setFabFormData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="توضیحات مشکل یا سوال خود را کامل بنویسید..."
                          className="w-full p-3 rounded-xl border border-border/80 bg-background/50 focus:bg-background outline-none text-xs min-h-[140px] resize-none leading-relaxed text-foreground font-semibold"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={fabLoading}
                        className="w-full py-3.5 text-xs font-black rounded-xl"
                      >
                        {fabLoading ? (
                          <span className="flex items-center gap-2 justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            در حال ارسال پیام...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 justify-center">
                            <Send className="w-3.5 h-3.5 rotate-180" />
                            ارسال فوری پیام
                          </span>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success"
                      className="text-center py-8 space-y-6"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 border border-green-500/20">
                        <CheckCircle size={32} />
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-black text-base">پیام با موفقیت ثبت شد</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                          درخواست شما به کارشناس صنف مربوطه ارجاع داده شد. پاسخ آن را به زودی در صندوق ورودی ایمیل خود دریافت خواهید کرد.
                        </p>
                      </div>

                      {/* Satisfaction Rating Widget inside FAB Success */}
                      <div className="bg-muted/40 p-5 rounded-2xl border border-border/40 max-w-sm mx-auto space-y-4">
                        <h5 className="text-[11px] font-black text-foreground flex items-center justify-center gap-1">
                          <Heart size={12} className="text-red-500 fill-red-500" />
                          <span>کیفیت تجربه خود را چگونه ارزیابی می‌کنید؟</span>
                        </h5>
                        <div className="flex justify-center gap-3">
                          {[
                            { score: 1, label: "ناراضی", icon: Frown, color: "hover:text-red-500 hover:bg-red-500/10" },
                            { score: 3, label: "معمولی", icon: Meh, color: "hover:text-amber-500 hover:bg-amber-500/10" },
                            { score: 5, label: "عالی", icon: Smile, color: "hover:text-green-500 hover:bg-green-500/10" }
                          ].map(item => {
                            const IconComp = item.icon;
                            const isSel = fabSatisfaction === item.score;
                            return (
                              <button
                                key={item.score}
                                type="button"
                                onClick={() => {
                                  setFabSatisfaction(item.score);
                                  toast.success("از همکاری شما متشکریم!");
                                }}
                                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-transparent transition-all ${item.color} ${isSel ? 'border-primary bg-primary/5 text-primary' : 'text-slate-500'}`}
                              >
                                <IconComp size={22} />
                                <span className="text-[9px] font-black">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <Button 
                        onClick={() => setFabSubmitted(false)}
                        variant="outline" 
                        size="sm"
                        className="rounded-xl w-full text-xs font-bold"
                      >
                        ارسال تیکت جدید
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-border/40 pt-4 mt-6 text-[10px] text-muted-foreground text-center font-bold">
                ساعات پاسخگویی تیم پشتیبانی: شنبه تا چهارشنبه ۹ تا ۱۷
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
