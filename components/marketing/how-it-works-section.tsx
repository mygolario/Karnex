"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Compass, MessageSquare, Map, TrendingUp } from "lucide-react";
import { LAUNCH_CONFIG } from "@/lib/launch/config";

const startupSteps = [
  {
    number: "۱",
    icon: Compass,
    title: "مسیر استارتاپ رو شروع کن",
    description: "کارنکس هم‌بنیان‌گذار هوشمند استارتاپ‌های ایرانی است. مسیر اختصاصی استارتاپ را انتخاب کن.",
    color: "from-primary to-pink-600",
    visual: {
      items: ["🚀 ایده", "🧪 اعتبارسنجی", "📊 بوم مدل"],
      highlight: 0,
    },
  },
  {
    number: "۲",
    icon: MessageSquare,
    title: "ایده‌ت رو توضیح بده",
    description: "با چند جمله ساده بگو چه کاری می‌خوای بکنی. دستیار کارنکس بقیه رو انجام میده.",
    color: "from-secondary to-yellow-500",
    visual: {
      items: ["می‌خوام...", "یه پلتفرم...", "برای بازار ایران"],
      highlight: 1,
    },
  },
  {
    number: "۳",
    icon: Map,
    title: "نقشه راه رو بگیر",
    description: "یک برنامه ۴ تا ۱۲ هفته‌ای کاملاً شخصی‌سازی شده با ابزارهای آماده دریافت کن.",
    color: "from-startup to-purple-600",
    visual: {
      items: ["هفته ۱: بوم", "هفته ۳: MVP", "هفته ۶: پیچ‌دک"],
      highlight: 0,
    },
  },
  {
    number: "۴",
    icon: TrendingUp,
    title: "شروع کن و رشد کن",
    description: "با پیچ‌دک، اعتبارسنجی، تحلیل رقبا و دستیار AI گام به گام جلو برو.",
    color: "from-emerald-500 to-teal-600",
    visual: {
      items: ["📈 رشد", "💰 اولین درآمد", "🎯 اهداف"],
      highlight: 0,
    },
  },
];

const legacySteps = [
  {
    number: "۱",
    icon: Compass,
    title: "مسیرت رو انتخاب کن",
    description: "استارتاپ، کسب‌وکار سنتی یا تولیدکننده محتوا؟ بر اساس هدفت، مسیر اختصاصی بگیر.",
    color: "from-primary to-pink-600",
    visual: {
      items: ["🚀 استارتاپ", "🏪 سنتی", "🎬 محتوا"],
      highlight: 0,
    },
  },
  {
    number: "۲",
    icon: MessageSquare,
    title: "ایده‌ت رو توضیح بده",
    description: "با چند جمله ساده بگو چه کاری می‌خوای بکنی. دستیار کارنکس بقیه رو انجام میده.",
    color: "from-secondary to-yellow-500",
    visual: {
      items: ["می‌خوام...", "یه قهوه‌خانه...", "در تهران بزنم"],
      highlight: 1,
    },
  },
  {
    number: "۳",
    icon: Map,
    title: "نقشه راه رو بگیر",
    description: "یک برنامه ۴ تا ۱۲ هفته‌ای کاملاً شخصی‌سازی شده با ابزارهای آماده دریافت کن.",
    color: "from-startup to-purple-600",
    visual: {
      items: ["هفته ۱: بوم", "هفته ۳: مجوز", "هفته ۶: راه‌اندازی"],
      highlight: 0,
    },
  },
  {
    number: "۴",
    icon: TrendingUp,
    title: "شروع کن و رشد کن",
    description: "با ابزارهای تخصصی و دستیار AI، گام به گام به سمت درآمد حرکت کن.",
    color: "from-traditional to-emerald-600",
    visual: {
      items: ["📈 رشد ۲۴٪", "💰 اولین درآمد", "🎯 اهداف"],
      highlight: 0,
    },
  },
];

export const HowItWorksSection = () => {
  const steps = LAUNCH_CONFIG.marketingStartupOnly ? startupSteps : legacySteps;

  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden bg-muted/20">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">
            چطور{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              کار می‌کنه؟
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            ۴ قدم ساده تا شروع مسیر موفقیت
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative flex items-start gap-6 lg:gap-8 mb-12 last:mb-0"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-16 end-8 w-0.5 h-[calc(100%-2rem)] bg-gradient-to-b from-border via-border to-transparent" />
              )}

              {/* Number badge */}
              <div className="relative shrink-0">
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <step.icon className="w-7 h-7 text-white" />
                  <span className="absolute -top-2 -end-2 w-7 h-7 rounded-full bg-card border-2 border-border flex items-center justify-center text-sm font-black text-foreground">
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Content + visual */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center pb-8">
                {/* Text */}
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Visual demo */}
                <div className="lg:ps-6">
                  <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 space-y-2">
                    {step.visual.items.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + i * 0.1 + 0.3 }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                          i === step.visual.highlight
                            ? "bg-primary/10 text-foreground font-bold border border-primary/20"
                            : "text-muted-foreground"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          i === step.visual.highlight ? "bg-primary" : "bg-muted-foreground/30"
                        }`} />
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all"
          >
            همین الان شروع کن
            <ArrowLeft className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
