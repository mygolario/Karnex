"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "علی محمدی",
    role: "بنیان‌گذار استارتاپ",
    pillar: "startup",
    content: "با کارنکس توانستم در کمتر از ۲ هفته بوم کسب‌وکار و پیچ دک حرفه‌ای بسازم. سرمایه‌گذار اولین جلسه قانع شد!",
    avatar: "علی",
    rating: 5,
  },
  {
    name: "سارا احمدی",
    role: "صاحب رستوران",
    pillar: "traditional",
    content: "نقشه راه کارنکس کمکم کرد مجوزها و وام بانکی رو سریع‌تر بگیرم. حالا ۳ شعبه دارم!",
    avatar: "سارا",
    rating: 5,
  },
  {
    name: "محمد رضایی",
    role: "کریتور یوتیوب",
    pillar: "creator",
    content: "مدیاکیت و تقویم محتوایی کارنکس رو به اسپانسرها نشون میدم. قراردادهام ۳ برابر شده!",
    avatar: "محمد",
    rating: 5,
  },
];

const pillarColors = {
  startup: "from-startup to-startup-dark",
  traditional: "from-traditional to-traditional-dark",
  creator: "from-creator to-creator-dark",
};

export const Testimonials = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container relative z-10 px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              کارآفرینان موفق
            </span>{" "}
            چه می‌گویند؟
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            بیش از ۲۰۰۰ کارآفرین، صاحب کسب‌وکار و کریتور به کارنکس اعتماد کرده‌اند
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative bg-card border border-border rounded-3xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                {/* Quote Icon */}
                <div className={`absolute -top-4 right-6 w-10 h-10 rounded-xl bg-gradient-to-br ${pillarColors[testimonial.pillar as keyof typeof pillarColors]} flex items-center justify-center shadow-lg`}>
                  <Quote className="w-5 h-5 text-white" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4 pt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground text-lg leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${pillarColors[testimonial.pillar as keyof typeof pillarColors]} flex items-center justify-center text-white font-bold text-lg`}>
                    {testimonial.avatar.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
