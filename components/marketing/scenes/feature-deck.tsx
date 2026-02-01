"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Rocket, Target, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Changed from 'lucide-react' which was wrong for Link

const features = [
  {
    title: "ساخت پیچ‌دک",
    desc: "اسلایدهای استاندارد برای جذب سرمایه‌گذار در چند دقیقه.",
    icon: Rocket,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "بوم کسب‌وکار",
    desc: "تحلیل مدل درآمدی، مشتریان و ارزش پیشنهادی با هوش مصنوعی.",
    icon: Target,
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "نقشه راه رشد",
    desc: "برنامه گام‌به‌گام اجرایی متناسب با بودجه شما.",
    icon: Zap,
    color: "from-orange-500 to-red-600",
  },
];

export function FeatureDeck() {
  const [active, setActive] = useState(1);

  return (
    <section className="h-screen w-full relative flex flex-col items-center justify-center bg-background snap-center p-4">
      
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-6xl font-black mb-4">جعبه‌ابزار شما</h2>
        <p className="text-muted-foreground">همه چیزهایی که برای موفقیت نیاز دارید.</p>
      </div>

      {/* === CARDS === */}
      <div className="relative w-full max-w-5xl h-[400px] flex items-center justify-center perspective-1000">
        {features.map((item, index) => {
          const isActive = index === active;
          const isPrev = index === active - 1;
          const isNext = index === active + 1;
          
          // Simple logic for 3 item carousel
          let x = 0;
          let scale = 0.8;
          let opacity = 0.5;
          let zIndex = 0;
          let rotateY = 0;

          if (isActive) {
            x = 0; scale = 1.1; opacity = 1; zIndex = 10; rotateY = 0;
          } else if (index < active) {
            x = -300; scale = 0.8; opacity = 0.4; zIndex = 5; rotateY = 15;
          } else if (index > active) {
            x = 300; scale = 0.8; opacity = 0.4; zIndex = 5; rotateY = -15;
          }

          return (
            <motion.div
              key={index}
              className={`absolute w-[300px] md:w-[350px] h-[450px] rounded-3xl p-8 flex flex-col justify-between shadow-2xl bg-gradient-to-br ${item.color} text-white cursor-pointer`}
              animate={{ x, scale, opacity, rotateY, zIndex }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              onClick={() => setActive(index)}
            >
              <div>
                <item.icon size={48} className="mb-6 opacity-80" />
                <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                <p className="opacity-90 leading-relaxed">{item.desc}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center text-sm font-bold">
                مشاهده نمونه
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 flex gap-4">
        <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setActive(Math.max(0, active - 1))}
            disabled={active === 0}
        >
            <ChevronRight />
        </Button>
        <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setActive(Math.min(features.length - 1, active + 1))}
            disabled={active === features.length - 1}
        >
            <ChevronLeft />
        </Button>
      </div>

       <div className="mt-8">
           <Link href="/features">
             <Button variant="ghost" className="text-primary">مشاهده تمام ویژگی‌ها</Button>
           </Link>
       </div>

    </section>
  );
}
