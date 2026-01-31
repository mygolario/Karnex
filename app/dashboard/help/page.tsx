"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  MessageCircle,
  FileText,
  Zap,
  Sparkles,
  ChevronDown,
  Map,
  LayoutGrid,
  Palette,
  Megaphone,
  BookOpen,
  Search,
  Lightbulb,
  ArrowLeft,
  ExternalLink,
  X
} from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaqItem, FeatureGuide } from "@/components/ui/learn-more";
import { featureExplanations, businessGlossary } from "@/lib/knowledge-base";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"faq" | "features" | "glossary">("faq");

  const faqs = [
    {
      q: "چطور شروع کنم؟",
      a: "از نقشه راه شروع کنید! هر مرحله را بخوانید و انجام دهید. نگران نباشید - هر قدم توضیحات کامل و راهنمای گام به گام دارد. روی هر مرحله کلیک کنید تا جزئیات را ببینید."
    },
    {
      q: "آیا طرح‌های تولید شده واقعا قابل اجرا هستند؟",
      a: "بله، دستیار کارنکس بر اساس واقعیت‌های بازار ایران و ابزارهای موجود (مثل درگاه‌های پرداخت ایرانی و پلتفرم‌های داخلی) برنامه را تدوین می‌کند."
    },
    {
      q: "آیا ایده من امن است؟",
      a: "بله، تمام داده‌های شما رمزنگاری شده و در فضای ابری امن ذخیره می‌شوند. هیچ‌کس جز شما به آن‌ها دسترسی ندارد."
    },
    {
      q: "چطور می‌توانم خروجی PDF بگیرم؟",
      a: "در بخش 'بوم کسب‌وکار'، دکمه سیاه رنگ 'دانلود PDF' را فشار دهید. یک فایل کامل با تمام اطلاعات پروژه برای شما آماده می‌شود."
    },
    {
      q: "نقشه راه چیست و چطور استفاده کنم؟",
      a: "نقشه راه مثل یک چک‌لیست هوشمند است که قدم به قدم مراحل موفقیت را نشان می‌دهد. هر مرحله را انجام دهید و تیک بزنید. روی هر مرحله کلیک کنید تا توضیحات کامل و ابزارهای پیشنهادی را ببینید."
    },
    {
      q: "بوم کسب‌وکار چیست؟",
      a: "بوم کسب‌وکار یک نقشه یک‌صفحه‌ای از کل کسب‌وکار شماست. در یک نگاه می‌بینید که چه مشکلی حل می‌کنید، چطور پول درمی‌آورید و چه چیزی شما را خاص می‌کند."
    },
    {
      q: "آیا می‌توانم طرح را ویرایش کنم؟",
      a: "بله! در بخش بوم کسب‌وکار، روی هر بخش ماوس را نگه دارید و دکمه ویرایش (✨) را بزنید تا دستیار کارنکس آن بخش را بازنویسی کند."
    },
    {
      q: "چطور با مشاور AI صحبت کنم؟",
      a: "دکمه بنفش رنگ 'مشاور هوشمند' را در گوشه پایین-چپ صفحه پیدا کنید و کلیک کنید. می‌توانید هر سوالی درباره پروژه‌تان بپرسید!"
    },
    {
      q: "آیا به دانش فنی نیاز دارم؟",
      a: "نه! کارنکس برای افراد غیرفنی طراحی شده. هر بخش توضیحات ساده و فارسی دارد و ابزارهای رایگان و آسان معرفی می‌کند."
    },
    {
      q: "چند پروژه می‌توانم بسازم؟",
      a: "در نسخه رایگان می‌توانید چند پروژه بسازید. از منوی 'پروژه‌ها' می‌توانید بین پروژه‌های مختلف جابجا شوید."
    },
    {
      q: "آیا نیاز به ثبت شرکت دارم؟",
      a: "در بیشتر موارد، نه! می‌توانید بدون ثبت شرکت شروع کنید. بخش 'الزامات قانونی' به شما می‌گوید دقیقاً چه مجوزهایی لازم است."
    },
    {
      q: "هزینه استفاده از کارنکس چقدر است؟",
      a: "کارنکس در حال حاضر رایگان است! از تمام امکانات بدون محدودیت استفاده کنید."
    }
  ];

  const features = [
    {
      icon: <Map size={20} />,
      title: "نقشه راه",
      description: featureExplanations.roadmap.description,
      href: "/dashboard/roadmap",
      variant: "primary" as const
    },
    {
      icon: <LayoutGrid size={20} />,
      title: "بوم کسب‌وکار",
      description: featureExplanations.canvas.description,
      href: "/dashboard/canvas",
      variant: "accent" as const
    },
    // {
    //   icon: <Palette size={20} />,
    //   title: "هویت بصری",
    //   description: featureExplanations.brand.description,
    //   href: "/dashboard/brand",
    //   variant: "secondary" as const
    // },
    {
      icon: <Megaphone size={20} />,
      title: "بازاریابی و رشد",
      description: featureExplanations.marketing.description,
      href: "/dashboard/marketing",
      variant: "primary" as const
    }
  ];

  // Filter FAQs based on search
  const filteredFaqs = searchQuery
    ? faqs.filter(f =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : faqs;

  // Filter glossary based on search
  const filteredGlossary = searchQuery
    ? Object.entries(businessGlossary).filter(([term, def]) =>
      term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : Object.entries(businessGlossary);

  return (
    <div className="max-w-[1000px] mx-auto space-y-10 pb-20 animate-fade-in-up">

      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl shadow-indigo-500/20 py-16 px-6 text-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white/10 backdrop-blur-md text-white mb-8 shadow-inner border border-white/20 animate-bounce-gentle">
            <HelpCircle size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">مرکز راهنمای کارنکس</h1>
          <p className="text-xl text-white/80 font-medium mb-10 max-w-2xl mx-auto">چطور می‌توانیم به رشد کسب‌وکار شما کمک کنیم؟</p>

          {/* Search */}
          <div className="w-full max-w-xl relative group">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:bg-white/30 transition-all duration-500" />
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center p-2 shadow-2xl transition-all duration-300 focus-within:bg-white/20 focus-within:scale-[1.02]">
              <Search size={24} className="text-white/70 mr-4" />
              <input
                type="text"
                placeholder="جستجو در سوالات و راهنما..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-white placeholder:text-white/50 text-lg px-2 h-12 focus:ring-0 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={20} className="text-white/70" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-8 relative z-20 px-4">
        <Card variant="glass" hover="lift" className="text-center cursor-pointer group py-8 border-t-4 border-t-amber-400">
          <div className="bg-amber-400/10 text-amber-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Zap size={32} />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-2">شروع سریع</h3>
          <p className="text-muted-foreground text-sm leading-6 px-4">آموزش گام‌به‌گام کار با ابزارهای هوشمند داشبورد</p>
        </Card>

        <Card variant="glass" hover="lift" className="text-center cursor-pointer group py-8 border-t-4 border-t-blue-400">
          <div className="bg-blue-400/10 text-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <FileText size={32} />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-2">مستندات</h3>
          <p className="text-muted-foreground text-sm leading-6 px-4">راهنمای خوانی بوم کسب‌وکار و نقشه راه</p>
        </Card>

        <Card variant="glass" hover="lift" className="text-center cursor-pointer group py-8 border-t-4 border-t-emerald-400">
          <div className="bg-emerald-400/10 text-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <MessageCircle size={32} />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-2">پشتیبانی</h3>
          <p className="text-muted-foreground text-sm leading-6 px-4">تماس مستقیم با تیم فنی و پشتیبانی کارنکس</p>
        </Card>
      </div>

      <div className="px-4 md:px-0 space-y-8">
        {/* Tabs */}
        <div className="flex justify-center">
          <div className="flex gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border/50 backdrop-blur-sm">
            {[
              { id: "faq", label: "سوالات متداول", count: faqs.length },
              { id: "features", label: "راهنمای امکانات", count: features.length },
              { id: "glossary", label: "واژه‌نامه", count: Object.keys(businessGlossary).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3 ${activeTab === tab.id
                  ? "bg-white shadow-lg text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  }`}
              >
                {tab.label}
                <Badge variant={activeTab === tab.id ? "default" : "muted"} size="sm" className="px-1.5 h-5 min-w-[20px] justify-center">
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <section className="space-y-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-3xl border border-dashed border-border">
                <Search size={40} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">نتیجه‌ای یافت نشد. با کلمات دیگری امتحان کنید.</p>
              </div>
            ) : (
              filteredFaqs.map((item, i) => (
                <FaqItem key={i} question={item.q} answer={item.a} />
              ))
            )}
          </section>
        )}

        {/* Features Tab */}
        {activeTab === "features" && (
          <section className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {features.map((feature, i) => (
              <FeatureGuide
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                variant={feature.variant}
              >
                <Link href={feature.href}>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary">
                    رفتن به {feature.title}
                    <ArrowLeft size={16} />
                  </Button>
                </Link>
              </FeatureGuide>
            ))}
          </section>
        )}

        {/* Glossary Tab */}
        {activeTab === "glossary" && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 text-amber-700 dark:text-amber-400 max-w-3xl mx-auto">
              <Lightbulb size={20} className="shrink-0" />
              <p className="text-sm font-medium">این واژه‌ها را در طول کار با کارنکس می‌بینید. اگر معنی کلمه‌ای را ندانستید، اینجا پیدا کنید!</p>
            </div>

            {filteredGlossary.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-3xl border border-dashed border-border">
                <BookOpen size={40} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">واژه‌ای یافت نشد.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {filteredGlossary.map(([term, definition], i) => (
                  <div key={i} className="bg-card border border-border/50 p-6 rounded-2xl hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
                    <h4 className="font-extrabold text-lg text-primary mb-3 group-hover:scale-105 transition-transform origin-right">{term}</h4>
                    <p className="text-muted-foreground text-sm leading-7 text-justify">{definition}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Still Need Help */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4">هنوز سوالی دارید؟</h3>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">ما همیشه آماده کمک هستیم. از دستیار هوشمند در پایین صفحه استفاده کنید.</p>

            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white/90">
              <Sparkles size={18} className="text-yellow-400" />
              <span className="font-medium">مشاور AI ۲۴ ساعته آنلاین است</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
