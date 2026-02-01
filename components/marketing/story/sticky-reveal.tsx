"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

const content = [
  {
    title: "هرج و مرج در اجرا",
    description:
      "۹۰٪ استارتاپ‌ها شکست می‌خورند. نه به خاطر نداشتن ایده، بلکه به خاطر نداشتن نقشه راه. فایل‌های اکسل پراکنده، تسک‌های فراموش شده و سردرگمی تیمی.",
    content: (
      <div className="h-full w-full bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center text-white">
         <div className="text-9xl opacity-20 font-black">?</div>
      </div>
    ),
  },
  {
    title: "بصیرت با کارنکس",
    description:
      "ما ایده شما را به یک ساختار قابل اجرا تبدیل می‌کنیم. بوم مدل کسب‌وکار، تحلیل مالی و برنامه عملیاتی، همه در یک پلتفرم یکپارچه.",
    content: (
      <div className="h-full w-full bg-linear-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white">
        <div className="text-9xl opacity-20 font-black">!</div>
      </div>
    ),
  },
  {
    title: "جذب سرمایه هوشمند",
    description:
      "با پیچ‌دک‌های استاندارد و تحلیل‌های دقیق مالی، شانس خود را برای جذب سرمایه‌گذار ۱۰ برابر کنید. زبان مشترک با سرمایه‌گذاران را ما به شما می‌دهیم.",
    content: (
      <div className="h-full w-full bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
        <div className="text-9xl opacity-20 font-black">$</div>
      </div>
    ),
  },
];

export const StickyScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} className="relative h-[300vh] bg-background">
      <div className="sticky top-0 h-screen flex flex-col justify-center items-center overflow-hidden">
        
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 px-10">
            {/* TEXT SIDE */}
            <div className="flex flex-col justify-center space-y-20">
                {content.map((item, index) => (
                    <CardText 
                        key={index} 
                        item={item} 
                        index={index} 
                        scrollYProgress={scrollYProgress} 
                        total={content.length}
                    />
                ))}
            </div>

            {/* VISUAL SIDE */}
            <div className="h-[500px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                {content.map((item, index) => (
                    <CardVisual 
                        key={index} 
                        item={item} 
                        index={index} 
                        scrollYProgress={scrollYProgress} 
                        total={content.length}
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const CardText = ({ item, index, scrollYProgress, total }: any) => {
    // Determine active range for this specific card
    const step = 1 / total;
    const start = index * step;
    const end = start + step;

    const opacity = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [0.3, 1, 1, 0.3]);
    const scale = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [0.8, 1, 1, 0.8]);

    return (
        <motion.div style={{ opacity, scale }} className="py-10">
            <h2 className="text-4xl font-bold mb-4">{item.title}</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">{item.description}</p>
        </motion.div>
    )
}

const CardVisual = ({ item, index, scrollYProgress, total }: any) => {
    // Determine active range
    const step = 1 / total;
    const start = index * step;
    const end = start + step;

    // Fade in/out based on scroll position
    const opacity = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
    
    return (
        <motion.div className="absolute inset-0 w-full h-full" style={{ opacity }}>
            {item.content}
        </motion.div>
    )
}
