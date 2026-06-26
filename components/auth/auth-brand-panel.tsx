"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";

interface AuthBrandPanelProps {
  mode: "login" | "signup";
}

const SIGNUP_BENEFITS = [
  "طرح کسب‌وکار کامل با هوش مصنوعی در ۳ دقیقه",
  "نقشه راه اختصاصی و گام‌به‌گام اجرایی",
  "مشاور هوشمند همیشه در دسترس شما",
  "ابزارهای مالی و حقوقی آماده استفاده",
];

export function AuthBrandPanel({ mode }: AuthBrandPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center text-center p-12 text-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-accent to-brand-secondary opacity-95" />
      <div className="absolute inset-0 pattern-dots opacity-20" />

      <div className="relative z-10 max-w-lg w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-28 h-28 mx-auto bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl flex items-center justify-center mb-8 border border-white/20"
        >
          <Image
            src="/logo.png"
            alt="لوگوی کارنکس"
            width={88}
            height={88}
            className="w-20 h-20 object-contain drop-shadow-xl"
          />
        </motion.div>

        {mode === "signup" ? (
          <>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
            >
              <Sparkles size={16} className="text-white" />
              <span className="text-sm font-medium">شروع رایگان بدون نیاز به کارت بانکی</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-black mb-8 tracking-tight leading-tight"
            >
              رویاپردازی کنید،
              <br />
              ما می‌سازیم
            </motion.h1>

            <motion.ul
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4 text-right bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10"
            >
              {SIGNUP_BENEFITS.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-white" />
                  </span>
                  <span className="text-white/90 font-medium">{item}</span>
                </li>
              ))}
            </motion.ul>
          </>
        ) : (
          <>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-black mb-6 tracking-tight leading-tight"
            >
              آینده کسب‌وکار شما
              <br />
              از اینجا شروع می‌شود
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-white/90 leading-relaxed mb-10"
            >
              به هزاران کارآفرین بپیوندید که با هوش مصنوعی کارنکس، ایده‌های خود را به واقعیت تبدیل کرده‌اند.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-6"
            >
              <div className="text-right">
                <div className="font-black text-3xl leading-none">
                  {toPersianDigits("+۱۲٬۰۰۰")}
                </div>
                <div className="text-xs text-white/70 mt-1">کارآفرین در حال رشد با کارنکس</div>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div className="text-right">
                <div className="font-black text-3xl leading-none">۴.۹★</div>
                <div className="text-xs text-white/70 mt-1">رضایت کاربران</div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
