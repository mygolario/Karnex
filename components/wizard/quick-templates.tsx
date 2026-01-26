"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  emoji: string;
  title: string;
  idea: string;
  problem: string;
  industry: string;
}

const templates: Template[] = [
  {
    id: "honey",
    emoji: "🍯",
    title: "فروش عسل ارگانیک",
    idea: "فروش آنلاین عسل طبیعی و ارگانیک از زنبورداری‌های محلی",
    problem: "پیدا کردن عسل طبیعی و اصل سخته و اکثر عسل‌های بازار تقلبی هستند",
    industry: "food"
  },
  {
    id: "online-course",
    emoji: "🎓",
    title: "آموزش آنلاین",
    idea: "پلتفرم آموزش آنلاین مهارت‌های حرفه‌ای برای بازار کار",
    problem: "دوره‌های آموزشی ایرانی کیفیت پایینی دارن یا به‌روز نیستن",
    industry: "education"
  },
  {
    id: "coffee-shop",
    emoji: "☕",
    title: "کافه تخصصی",
    idea: "کافه قهوه تخصصی با رست اختصاصی و فضای کار اشتراکی",
    problem: "کافه‌های خوب با قهوه باکیفیت در شهرستان‌ها کمیابه",
    industry: "food"
  },
  {
    id: "fitness-app",
    emoji: "🏋️",
    title: "اپلیکیشن ورزش",
    idea: "اپلیکیشن تمرین ورزشی شخصی‌سازی‌شده با مربی AI",
    problem: "هزینه مربی خصوصی بالاست و باشگاه‌ها شلوغ هستن",
    industry: "health"
  },
  {
    id: "fashion-brand",
    emoji: "👗",
    title: "برند لباس",
    idea: "برند لباس ایرانی با طراحی مدرن و کیفیت بالا",
    problem: "لباس‌های باکیفیت یا گرون هستن یا طراحی قدیمی دارن",
    industry: "fashion"
  },
  {
    id: "delivery-service",
    emoji: "🛵",
    title: "سرویس پیک",
    idea: "سرویس پیک و تحویل سریع کالا در سطح شهر",
    problem: "پیک‌های فعلی کند هستن و پیگیری سفارش سخته",
    industry: "transport"
  },
];

interface QuickTemplatesProps {
  onSelect: (template: Template) => void;
}

export function QuickTemplates({ onSelect }: QuickTemplatesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Sparkles size={16} className="text-accent" />
        یا از یک الگو شروع کن:
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {templates.map((template, index) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(template)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl",
              "bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20",
              "transition-all group min-w-[100px]"
            )}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {template.emoji}
            </span>
            <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-foreground whitespace-nowrap">
              {template.title}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export { templates };
export type { Template };
