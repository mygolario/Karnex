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
  Scale,
  BookOpen,
  Search,
  Lightbulb,
  ArrowLeft,
  ExternalLink
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
      a: "بله، هوش مصنوعی ما بر اساس واقعیت‌های بازار ایران و ابزارهای موجود (مثل درگاه‌های پرداخت ایرانی و پلتفرم‌های داخلی) برنامه را تدوین می‌کند." 
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
      a: "بله! در بخش بوم کسب‌وکار، روی هر بخش ماوس را نگه دارید و دکمه ویرایش (✨) را بزنید تا هوش مصنوعی آن بخش را بازنویسی کند." 
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
    {
      icon: <Palette size={20} />,
      title: "هویت بصری",
      description: featureExplanations.brand.description,
      href: "/dashboard/brand",
      variant: "secondary" as const
    },
    {
      icon: <Megaphone size={20} />,
      title: "بازاریابی و رشد",
      description: featureExplanations.marketing.description,
      href: "/dashboard/marketing",
      variant: "primary" as const
    },
    {
      icon: <Scale size={20} />,
      title: "الزامات قانونی",
      description: featureExplanations.legal.description,
      href: "/dashboard/legal",
      variant: "accent" as const
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
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-600 text-white mb-6 shadow-xl shadow-primary/20">
          <HelpCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-4">مرکز راهنمای کارنکس</h1>
        <p className="text-muted-foreground text-lg mb-6">چطور می‌توانیم به رشد کسب‌وکار شما کمک کنیم؟</p>
        
        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="جستجو در سوالات و راهنما..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="glass" hover="lift" className="text-center cursor-pointer group">
          <CardIcon variant="primary" className="mx-auto mb-4 w-14 h-14 group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </CardIcon>
          <h3 className="font-bold text-foreground mb-2">شروع سریع</h3>
          <p className="text-muted-foreground text-sm">آموزش کار با ابزارهای هوشمند داشبورد</p>
        </Card>
        
        <Card variant="glass" hover="lift" className="text-center cursor-pointer group">
          <CardIcon variant="accent" className="mx-auto mb-4 w-14 h-14 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </CardIcon>
          <h3 className="font-bold text-foreground mb-2">مستندات</h3>
          <p className="text-muted-foreground text-sm">راهنمای خوانی بوم کسب‌وکار و نقشه راه</p>
        </Card>

        <Card variant="glass" hover="lift" className="text-center cursor-pointer group">
          <CardIcon variant="secondary" className="mx-auto mb-4 w-14 h-14 group-hover:scale-110 transition-transform">
            <MessageCircle size={24} />
          </CardIcon>
          <h3 className="font-bold text-foreground mb-2">پشتیبانی</h3>
          <p className="text-muted-foreground text-sm">تماس با تیم فنی کارنکس</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-4">
        {[
          { id: "faq", label: "سوالات متداول", count: faqs.length },
          { id: "features", label: "راهنمای امکانات", count: features.length },
          { id: "glossary", label: "واژه‌نامه", count: Object.keys(businessGlossary).length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id 
                ? "bg-primary text-white" 
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <Badge variant={activeTab === tab.id ? "success" : "muted"} size="sm">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <section className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <Card variant="muted" className="text-center py-8">
              <p className="text-muted-foreground">نتیجه‌ای یافت نشد. سوال دیگری جستجو کنید.</p>
            </Card>
          ) : (
            filteredFaqs.map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))
          )}
        </section>
      )}

      {/* Features Tab */}
      {activeTab === "features" && (
        <section className="space-y-4">
          {features.map((feature, i) => (
            <FeatureGuide
              key={i}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              variant={feature.variant}
            >
              <Link href={feature.href}>
                <Button variant="outline" size="sm">
                  رفتن به {feature.title}
                  <ArrowLeft size={14} />
                </Button>
              </Link>
            </FeatureGuide>
          ))}
        </section>
      )}

      {/* Glossary Tab */}
      {activeTab === "glossary" && (
        <section className="space-y-4">
          <Card variant="muted" className="mb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Lightbulb size={14} className="text-accent" />
              این واژه‌ها را در طول کار با کارنکس می‌بینید. اگر معنی کلمه‌ای را ندانستید، اینجا پیدا کنید!
            </div>
          </Card>
          
          {filteredGlossary.length === 0 ? (
            <Card variant="muted" className="text-center py-8">
              <p className="text-muted-foreground">واژه‌ای یافت نشد.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredGlossary.map(([term, definition], i) => (
                <Card key={i} variant="default" hover="glow" className="p-4">
                  <h4 className="font-bold text-primary mb-2">{term}</h4>
                  <p className="text-muted-foreground text-sm leading-6">{definition}</p>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Still Need Help */}
      <Card variant="gradient" className="text-center text-white py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative">
          <h3 className="text-xl font-bold mb-2">هنوز سوالی دارید؟</h3>
          <p className="text-white/80 mb-4">از مشاور هوشمند بپرسید! روی دکمه گوشه پایین-چپ کلیک کنید.</p>
          <div className="flex items-center justify-center gap-2 text-sm text-white/60">
            <Sparkles size={14} />
            مشاور AI ۲۴ ساعته آنلاین است
          </div>
        </div>
      </Card>

    </div>
  );
}
