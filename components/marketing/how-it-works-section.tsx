"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "۱",
    title: "مسیرت رو انتخاب کن",
    description: "استارتاپ، کسب‌وکار سنتی یا کریتور؟ بر اساس هدفت مسیر اختصاصی بگیر.",
    color: "from-primary to-pink-600",
  },
  {
    number: "۲",
    title: "ایده‌ت رو توضیح بده",
    description: "با چند جمله ساده بگو چه کاری می‌خوای بکنی. دستیار کارنکس بقیه رو انجام میده.",
    color: "from-secondary to-yellow-500",
  },
  {
    number: "۳",
    title: "نقشه راه رو بگیر",
    description: "یک برنامه ۴ تا ۱۲ هفته‌ای کاملاً شخصی‌سازی شده دریافت کن.",
    color: "from-startup to-purple-600",
  },
  {
    number: "۴",
    title: "شروع کن و رشد کن",
    description: "با ابزارهای تخصصی، گام به گام به سمت موفقیت حرکت کن.",
    color: "from-traditional to-emerald-600",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-muted/20">
      {/* Background pattern */}
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
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative flex items-start gap-8 mb-12 last:mb-0"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-20 right-8 w-0.5 h-full bg-gradient-to-b from-border to-transparent" />
              )}
              
              {/* Number */}
              <div className={`relative shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl font-black text-white">{step.number}</span>
              </div>
              
              {/* Content */}
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {step.description}
                </p>
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
