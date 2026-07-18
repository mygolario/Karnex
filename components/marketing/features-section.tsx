"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Map,
  Bot,
  LayoutGrid,
  FileText,
  Lightbulb,
  Calendar,
  Image as ImageIcon,
  MapPin,
  TrendingUp,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/*
 * True Bento Grid — varying card sizes create visual rhythm.
 * Layout (xl):  4 columns × 2 rows
 *
 *   ┌──────────────┬───────┬───────┐
 *   │   HERO CARD   │ card2 │ card3 │
 *   │   (2×2)       ├───────┼───────┤
 *   │               │ card4 │ card5 │
 *   ├───────┬───────┴───────┼───────┤
 *   │ card6 │ card7         │ card8 │
 *   └───────┴───────────────┴───────┘
 */

const bentoFeatures = [
  {
    id: "hero",
    icon: Bot,
    title: "دستیار کارنکس",
    description: "مثل یه هم‌بنیان‌گذار باهوش، ۲۴ ساعته کنارتیم. ایده‌ت رو بده، نقشه راه، استراتژی و ابزارهای لازم رو برات می‌سازیم.",
    color: "from-pink-500 to-rose-600",
    span: "lg:col-span-2 lg:row-span-2",
    large: true,
    badge: "همه",
  },
  {
    id: "roadmap",
    icon: Map,
    title: "نقشه راه هوشمند",
    description: "قدم‌به‌قدم مسیر رسیدن به درآمد.",
    color: "from-emerald-500 to-teal-600",
    span: "",
    badge: "همه",
  },
  {
    id: "canvas",
    icon: LayoutGrid,
    title: "بوم مدل کسب‌وکار",
    description: "ایده‌ت رو تحلیل کن، نقاط ضعف رو پیدا کن.",
    color: "from-blue-500 to-cyan-600",
    span: "",
    badge: "همه",
  },
  {
    id: "pitchdeck",
    icon: FileText,
    title: "پیچ‌دک استارتاپ",
    description: "دک حرفه‌ای برای جذب سرمایه.",
    color: "from-violet-500 to-purple-600",
    span: "",
    badge: "استارتاپ",
  },
  {
    id: "ideas",
    icon: Lightbulb,
    title: "موتور ایده‌پرداز",
    description: "ایده‌های وایرال بر اساس ترندهای روز.",
    color: "from-yellow-500 to-orange-500",
    span: "",
    badge: "کریتور",
  },
  {
    id: "analytics",
    icon: TrendingUp,
    title: "آنالیتیکس و رشد",
    description: "پیشرفتت رو در هر گام دقیق ردیابی کن.",
    color: "from-indigo-500 to-blue-600",
    span: "",
    badge: "همه",
  },
  {
    id: "calendar",
    icon: Calendar,
    title: "تقویم محتوا",
    description: "برنامه انتشار هوشمند برای اینستاگرام و یوتیوب.",
    color: "from-cyan-500 to-sky-600",
    span: "lg:col-span-2",
    badge: "کریتور",
  },
  {
    id: "mediakit",
    icon: ImageIcon,
    title: "مدیاکیت حرفه‌ای",
    description: "PDF آماده برای جذب اسپانسر.",
    color: "from-fuchsia-500 to-pink-600",
    span: "",
    badge: "کریتور",
  },
  {
    id: "location",
    icon: MapPin,
    title: "آنالیز موقعیت",
    description: "بهترین مکان کسب‌وکار رو پیدا کن.",
    color: "from-amber-500 to-red-500",
    span: "",
    badge: "سنتی",
  },
];

const badgeColors: Record<string, string> = {
  "همه": "bg-primary/10 text-primary border border-primary/20",
  "استارتاپ": "bg-violet-500/10 text-violet-600 border border-violet-500/20",
  "کریتور": "bg-pink-500/10 text-pink-600 border border-pink-500/20",
  "سنتی": "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute top-40 end-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-40 start-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />

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
            بیش از ۱۰ ابزار قدرتمند در یک پلتفرم — برای استارتاپ‌ها، کسب‌وکارهای سنتی و تولیدکنندگان محتوا
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 max-w-7xl mx-auto lg:auto-rows-[minmax(180px,auto)]">
          {bentoFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className={`group relative ${feature.span}`}
            >
              <div className="h-full rounded-2xl lg:rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-5 lg:p-6 overflow-hidden transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/5 flex flex-col">
                {/* Gradient glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500 rounded-2xl lg:rounded-3xl`} />

                {/* Top row */}
                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <feature.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeColors[feature.badge]}`}>
                    {feature.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1">
                  <h3 className={`font-bold text-foreground mb-2 ${feature.large ? "text-xl lg:text-2xl" : "text-base lg:text-lg"}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-muted-foreground leading-relaxed ${feature.large ? "text-base lg:text-lg" : "text-sm"}`}>
                    {feature.description}
                  </p>
                </div>

                {/* Large card gets a mini visual */}
                {feature.large && (
                  <div className="relative z-10 mt-4 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 space-x-reverse">
                        {[
                          "from-emerald-500 to-teal-600",
                          "from-violet-500 to-purple-600",
                          "from-amber-500 to-orange-500",
                        ].map((c, i) => (
                          <div key={i} className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c} flex items-center justify-center border-2 border-card`}>
                            <Target className="w-3.5 h-3.5 text-white" />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">همه مسیرها پشتیبانی می‌شن</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
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
            <Button
              size="lg"
              rounded="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all gap-2"
            >
              شروع رایگان با دستیار کارنکس
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
