"use client";

import { motion } from "framer-motion";
import { 
  LayoutGrid, 
  Map, 
  FileText, 
  BarChart3,
  Sparkles,
  ArrowLeft,
  Target,
  Palette,
  MessageCircle,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    icon: LayoutGrid,
    title: "بوم کسب‌وکار",
    description: "مدل ۹ بخشی BMC حرفه‌ای با دستیار کارنکس. تحلیل رقبا و شناسایی شکاف‌های بازار.",
    color: "from-violet-500 to-purple-600",
    size: "large",
    badge: "محبوب‌ترین",
  },
  {
    icon: Map,
    title: "نقشه راه",
    description: "تایم‌لاین گانت هوشمند با برنامه‌ریزی اسپرینت و تسک‌های AI. ۴ تا ۲۴ هفته.",
    color: "from-emerald-500 to-teal-600",
    size: "medium",
  },
  {
    icon: Target,
    title: "اعتبارسنج ایده",
    description: "تحلیل بازار، رقبا و ریسک. امتیازدهی ایده قبل از سرمایه‌گذاری.",
    color: "from-blue-500 to-cyan-600",
    size: "medium",
  },
  {
    icon: MessageCircle,
    title: "دستیار کارنکس",
    description: "چت با مشاور هوشمند ۲۴ ساعته. تمرین پیچ و راهنمایی شخصی.",
    color: "from-pink-500 to-rose-600",
    size: "small",
    badge: "جدید",
  },
  {
    icon: Palette,
    title: "هویت بصری",
    description: "لوگو، پالت رنگ و راهنمای برند.",
    color: "from-orange-500 to-amber-600",
    size: "small",
  },
  {
    icon: FileText,
    title: "پیچ دک ساز",
    description: "ارائه حرفه‌ای برای سرمایه‌گذاران.",
    color: "from-indigo-500 to-blue-600",
    size: "small",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const isLarge = feature.size === "large";
  const isMedium = feature.size === "medium";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative ${
        isLarge ? "md:col-span-2 md:row-span-2" : 
        isMedium ? "md:col-span-1 md:row-span-2" : ""
      }`}
    >
      {/* Card */}
      <div className={`h-full rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-6 md:p-8 overflow-hidden transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-2xl group-hover:shadow-primary/10 ${
        isLarge ? "min-h-[360px]" : isMedium ? "min-h-[320px]" : "min-h-[180px]"
      }`}>
        
        {/* Gradient glow on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
        
        {/* Badge */}
        {feature.badge && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-lg">
            {feature.badge}
          </div>
        )}
        
        {/* Icon */}
        <div className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <feature.icon className="w-7 h-7 text-white" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <h3 className={`font-bold text-foreground mb-3 ${isLarge ? "text-2xl md:text-3xl" : "text-xl"}`}>
            {feature.title}
          </h3>
          <p className={`text-muted-foreground leading-relaxed ${isLarge ? "text-lg" : "text-sm"}`}>
            {feature.description}
          </p>
        </div>
        
        {/* Large card extra content */}
        {isLarge && (
          <div className="absolute bottom-8 right-8 left-8">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>دستیار کارنکس</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>آپدیت لحظه‌ای</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Arrow indicator */}
        <div className="absolute bottom-6 left-6 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
          <ArrowLeft className="w-5 h-5 text-foreground rotate-180" />
        </div>
      </div>
    </motion.div>
  );
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      
      {/* Decorative elements */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-40 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
      
      <div className="container relative z-10 px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">جعبه ابزار دستیار کارنکس</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
            همه چیز برای
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              شروع و رشد
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground">
            ابزارهای قدرتمند با دستیار کارنکس برای تبدیل ایده به کسب‌وکار واقعی
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/signup">
            <Button size="lg" className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all">
              شروع رایگان با دستیار کارنکس
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
