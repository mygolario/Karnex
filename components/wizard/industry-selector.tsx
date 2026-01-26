"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Industry {
  id: string;
  emoji: string;
  label: string;
  keywords: string[];
}

const industries: Industry[] = [
  { id: "food", emoji: "🍽️", label: "غذا و نوشیدنی", keywords: ["رستوران", "کافه", "فست‌فود", "عسل", "محصولات غذایی"] },
  { id: "ecommerce", emoji: "🛒", label: "فروشگاه آنلاین", keywords: ["فروش", "مارکت‌پلیس", "تجارت الکترونیک"] },
  { id: "education", emoji: "📚", label: "آموزش", keywords: ["دوره آنلاین", "مدرسه", "آموزشگاه", "یادگیری"] },
  { id: "health", emoji: "🏋️", label: "سلامت و ورزش", keywords: ["باشگاه", "پزشکی", "تناسب اندام", "سلامتی"] },
  { id: "creative", emoji: "🎨", label: "خلاقیت و هنر", keywords: ["طراحی", "نقاشی", "عکاسی", "هنر"] },
  { id: "b2b", emoji: "💼", label: "خدمات کسب‌وکار", keywords: ["مشاوره", "حسابداری", "حقوقی", "HR"] },
  { id: "transport", emoji: "🚗", label: "حمل‌ونقل", keywords: ["تاکسی", "لجستیک", "پیک", "باربری"] },
  { id: "realestate", emoji: "🏠", label: "املاک و مستغلات", keywords: ["خرید", "فروش", "اجاره", "ساختمان"] },
  { id: "entertainment", emoji: "🎮", label: "سرگرمی", keywords: ["بازی", "گیم", "استریم", "محتوا"] },
  { id: "tech", emoji: "💻", label: "فناوری و نرم‌افزار", keywords: ["اپلیکیشن", "وبسایت", "SaaS", "AI"] },
  { id: "fashion", emoji: "👗", label: "مد و پوشاک", keywords: ["لباس", "فشن", "برند", "طراحی لباس"] },
  { id: "other", emoji: "➕", label: "سایر", keywords: [] },
];

interface IndustrySelectorProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export function IndustrySelector({ selected, onSelect }: IndustrySelectorProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
      {industries.map((industry, index) => (
        <motion.button
          key={industry.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
          onClick={() => onSelect(industry.id)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group",
            selected === industry.id
              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
              : "border-border hover:border-primary/30 hover:bg-muted/50"
          )}
        >
          <span 
            className={cn(
              "text-3xl transition-transform group-hover:scale-110",
              selected === industry.id && "scale-110"
            )}
          >
            {industry.emoji}
          </span>
          <span className={cn(
            "text-xs font-medium text-center leading-tight",
            selected === industry.id ? "text-primary" : "text-foreground"
          )}>
            {industry.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

export { industries };
