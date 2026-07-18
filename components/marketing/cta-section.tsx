"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Shield, RefreshCw, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const riskReversals = [
  { icon: CreditCard, text: "بدون کارت اعتباری" },
  { icon: RefreshCw, text: "لغو در هر زمان" },
  { icon: Shield, text: "داده‌های امن" },
];

export const CTASection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-[20%] w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[120px]"
      />

      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <Image
              src="/logo.png"
              alt="کارنکس"
              width={72}
              height={72}
              className="mx-auto rounded-2xl shadow-2xl shadow-primary/30"
            />
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight"
          >
            آماده‌ای مسیرت رو
            <br />
            <span className="bg-gradient-to-r from-primary via-pink-400 to-secondary bg-clip-text text-transparent">
              شروع کنی؟
            </span>
          </motion.h2>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            ایده با تو، مسیرش با کارنکس.
            <br />
            <span className="text-white font-medium">رایگان شروع کن، بدون محدودیت.</span>
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <Link href="/signup">
              <Button
                size="xl"
                rounded="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-all gap-2"
              >
                <Sparkles className="w-5 h-5" />
                شروع رایگان
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="xl"
                variant="outline"
                rounded="lg"
                className="font-bold border-white/20 text-white bg-transparent hover:bg-white/10 hover:border-white/40 gap-2 h-[3.5rem]"
              >
                صحبت با تیم فروش
              </Button>
            </Link>
          </motion.div>

          {/* Risk reversals */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            {riskReversals.map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-gray-400">
                <item.icon className="w-4 h-4 text-primary" />
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
