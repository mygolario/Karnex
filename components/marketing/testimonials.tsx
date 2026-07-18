"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "علی محمدی",
    role: "بنیان‌گذار استارتاپ",
    pillar: "startup",
    content: "با کارنکس توانستم در کمتر از ۲ هفته بوم کسب‌وکار و پیچ دک حرفه‌ای بسازم. سرمایه‌گذار اولین جلسه قانع شد!",
    avatar: "ع",
    rating: 5,
  },
  {
    name: "سارا احمدی",
    role: "صاحب رستوران",
    pillar: "traditional",
    content: "نقشه راه کارنکس کمکم کرد مجوزها و وام بانکی رو سریع‌تر بگیرم. حالا ۳ شعبه دارم!",
    avatar: "س",
    rating: 5,
  },
  {
    name: "محمد رضایی",
    role: "تولیدکننده محتوا یوتیوب",
    pillar: "creator",
    content: "مدیاکیت و تقویم محتوایی کارنکس رو به اسپانسرها نشون میدم. قراردادهام ۳ برابر شده!",
    avatar: "م",
    rating: 5,
  },
  {
    name: "نگار کریمی",
    role: "موسس برند پوشاک",
    pillar: "traditional",
    content: "آنالیز موقعیت کارنکس کمکم کرد بهترین مکان برای فروشگاه رو پیدا کنم. بعد از ۳ ماه به سود رسیدم.",
    avatar: "ن",
    rating: 5,
  },
  {
    name: "امیر حسینی",
    role: "کریتور اینستاگرام",
    pillar: "creator",
    content: "موتور ایده‌پرداز کارنکس عالیه. هر هفته ۵ ایده وایرال دریافت می‌کنم و تقویم محتوام همیشه پره.",
    avatar: "ا",
    rating: 4,
  },
  {
    name: "زهرا موسوی",
    role: "بنیان‌گذار پلتفرم آموزشی",
    pillar: "startup",
    content: "از ایده تا MVP رو با کارنکس طی کردم. نقشه راه واضح بود و دستیار AI همیشه راهنماییم کرد.",
    avatar: "ز",
    rating: 5,
  },
];

const pillarColors: Record<string, string> = {
  startup: "from-startup to-startup-dark",
  traditional: "from-traditional to-traditional-dark",
  creator: "from-creator to-creator-dark",
};

export const Testimonials = () => {
  // Split into two rows for marquee effect
  const row1 = testimonials.slice(0, 3);
  const row2 = testimonials.slice(3);

  const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
    <div className="group relative shrink-0 w-[340px] sm:w-[400px]">
      <div className="relative bg-card border border-border rounded-2xl p-6 h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
        {/* Quote icon */}
        <div className={`absolute -top-3 end-6 w-9 h-9 rounded-xl bg-gradient-to-br ${pillarColors[testimonial.pillar]} flex items-center justify-center shadow-lg`}>
          <Quote className="w-4 h-4 text-white" />
        </div>

        {/* Stars */}
        <div className="flex gap-1 mb-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < testimonial.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <p className="text-foreground text-base leading-relaxed mb-5">
          «{testimonial.content}»
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${pillarColors[testimonial.pillar]} flex items-center justify-center text-white font-bold`}>
            {testimonial.avatar}
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm">{testimonial.name}</h4>
            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container relative z-10 px-4 md:px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              کارآفرینان موفق
            </span>{" "}
            چه می‌گویند؟
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            بیش از ۲,۰۰۰ کارآفرین، صاحب کسب‌وکار و تولیدکننده محتوا به کارنکس اعتماد کرده‌اند
          </p>
        </motion.div>
      </div>

      {/* Marquee row 1 — scrolls left */}
      <div className="relative overflow-hidden mb-6">
        {/* Fade edges */}
        <div className="absolute inset-y-0 start-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 end-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-5"
        >
          {[...row1, ...row1, ...row1].map((t, i) => (
            <TestimonialCard key={`r1-${i}`} testimonial={t} />
          ))}
        </motion.div>
      </div>

      {/* Marquee row 2 — scrolls right */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 start-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 end-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <motion.div
          animate={{ x: [-1200, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="flex gap-5"
        >
          {[...row2, ...row2, ...row2].map((t, i) => (
            <TestimonialCard key={`r2-${i}`} testimonial={t} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
