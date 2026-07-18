"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Rocket, Store, Video, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PillarId = "startup" | "traditional" | "creator";

const pillars: Record<
  PillarId,
  {
    icon: typeof Rocket;
    title: string;
    subtitle: string;
    color: string;
    bgColor: string;
    borderColor: string;
    features: string[];
    cta: string;
  }
> = {
  startup: {
    icon: Rocket,
    title: "استارتاپ",
    subtitle: "از ایده تا جذب سرمایه",
    color: "text-startup",
    bgColor: "bg-startup",
    borderColor: "border-startup/30",
    features: [
      "بوم مدل کسب‌وکار هوشمند",
      "پیچ‌دک حرفه‌ای برای سرمایه‌گذار",
      "نقشه راه MVP و توسعه محصول",
      "تحلیل رقبا و بازار هدف",
      "محاسبه نرخ سوختگی و runway",
    ],
    cta: "مسیر استارتاپ رو شروع کن",
  },
  traditional: {
    icon: Store,
    title: "کسب‌وکار سنتی",
    subtitle: "از مجوز تا شعب جدید",
    color: "text-traditional",
    bgColor: "bg-traditional",
    borderColor: "border-traditional/30",
    features: [
      "آنالیز موقعیت و رقبا",
      "مدیریت مجوزها و قانون‌گذاری",
      "محاسبه نقطه سربه‌سر",
      "برنامه توسعه شعبه",
      "استراتژی جذب مشتری محلی",
    ],
    cta: "مسیر کسب‌وکار سنتی رو شروع کن",
  },
  creator: {
    icon: Video,
    title: "تولیدکننده محتوا",
    subtitle: "از ایده وایرال تا اسپانسر",
    color: "text-creator",
    bgColor: "bg-creator",
    borderColor: "border-creator/30",
    features: [
      "موتور ایده‌پردازی وایرال",
      "تقویم محتوا هوشمند",
      "مدیاکیت حرفه‌ای برای اسپانسر",
      "قراردادهای اسپانسری آماده",
      "تحلیل کانال و رشد مخاطب",
    ],
    cta: "مسیر تولید محتوا رو شروع کن",
  },
};

const pillarOrder: PillarId[] = ["startup", "traditional", "creator"];

export const PillarsSection = () => {
  const [active, setActive] = useState<PillarId>("startup");
  const current = pillars[active];

  return (
    <section id="pillars" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      <div className="absolute top-1/2 start-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 leading-tight">
            مسیر{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              اختصاصی
            </span>{" "}
            خودت رو انتخاب کن
          </h2>
          <p className="text-xl text-muted-foreground">
            هر مسیر، ابزارهای مخصوص خودش رو داره
          </p>
        </motion.div>

        {/* Tab selector */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-muted/50 border border-border/50">
            {pillarOrder.map((id) => {
              const p = pillars[id];
              const isActive = active === id;
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="pillar-tab"
                      className={`absolute inset-0 ${p.bgColor} rounded-xl`}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <p.icon className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10">{p.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active pillar content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            <div className={`relative rounded-3xl border-2 ${current.borderColor} bg-card/60 backdrop-blur-sm p-8 lg:p-12 overflow-hidden`}>
              {/* Decorative glow */}
              <div className={`absolute -top-20 -end-20 w-64 h-64 ${current.bgColor} opacity-10 rounded-full blur-[80px]`} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left: visual */}
                <div className="order-2 lg:order-1">
                  <div className={`relative aspect-square max-w-sm mx-auto rounded-3xl bg-gradient-to-br ${current.bgColor}/10 to-transparent border ${current.borderColor} flex items-center justify-center`}>
                    <div className={`w-32 h-32 rounded-3xl ${current.bgColor} flex items-center justify-center shadow-2xl`}>
                      <current.icon className="w-16 h-16 text-white" />
                    </div>
                    {/* Floating mini-cards */}
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute top-8 -start-4 bg-card border border-border rounded-xl shadow-lg p-3"
                    >
                      <span className={`text-xs font-bold ${current.color}`}>{current.subtitle}</span>
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                      className="absolute bottom-8 -end-4 bg-card border border-border rounded-xl shadow-lg p-3"
                    >
                      <span className="text-xs font-bold text-foreground">۵ ابزار تخصصی</span>
                    </motion.div>
                  </div>
                </div>

                {/* Right: content */}
                <div className="order-1 lg:order-2">
                  <span className={`text-sm font-bold ${current.color} mb-2 block`}>
                    {current.subtitle}
                  </span>
                  <h3 className="text-3xl lg:text-4xl font-black text-foreground mb-6">
                    {current.title}
                  </h3>
                  <ul className="space-y-3 mb-8">
                    {current.features.map((feature, i) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-6 h-6 rounded-lg ${current.bgColor}/10 flex items-center justify-center shrink-0`}>
                          <Check className={`w-4 h-4 ${current.color}`} />
                        </div>
                        <span className="text-foreground text-base">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button
                      size="lg"
                      rounded="lg"
                      className={`${current.bgColor} hover:opacity-90 text-white font-bold gap-2`}
                    >
                      {current.cta}
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
