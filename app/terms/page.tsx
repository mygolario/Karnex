"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Scale, Shield, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-4xl mx-auto py-12 px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link href="/">
            <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary group transition-colors">
              <ArrowRight className="ml-2 group-hover:-translate-x-1 transition-transform" size={20} />
              بازگشت به صفحه اصلی
            </Button>
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl text-primary border border-primary/10">
              <Scale size={40} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">قوانین و مقررات</h1>
              <p className="text-muted-foreground text-lg">
                آخرین بروزرسانی: ۲۱ بهمن ۱۴۰۴
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl space-y-12"
        >
          <section className="relative">
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 bg-primary/10 rounded-lg mt-1">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">۱. پذیرش قوانین</h2>
                <div className="text-muted-foreground leading-loose text-lg text-justify">
                  با ثبت‌نام و استفاده از خدمات کارنکس، شما موافقت می‌کنید که به این قوانین و مقررات پایبند باشید. اگر با هر بخشی از این قوانین مخالفید، لطفاً از خدمات ما استفاده نکنید. استفاده شما از خدمات به منزله پذیریش کامل این توافق‌نامه است.
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-border/50" />

          <section className="relative">
             <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 bg-secondary/10 rounded-lg mt-1">
                <SparklesIcon className="w-6 h-6 text-secondary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">۲. استفاده از خدمات هوش مصنوعی</h2>
                <div className="text-muted-foreground leading-loose text-lg text-justify">
                  خروجی‌های تولید شده توسط هوش مصنوعی کارنکس (طرح‌های کسب‌وکار، مشاوره‌ها) فقط جنبه پیشنهادی و آموزشی دارند. کارنکس مسئولیتی در قبال تصمیمات تجاری یا ضرر و زیان ناشی از استفاده از این اطلاعات ندارد. همیشه قبل از اقدامات جدی با متخصصین مشورت کنید. دقت کنید که هوش مصنوعی ممکن است خطا داشته باشد.
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-border/50" />

          <section className="relative">
             <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 bg-blue-500/10 rounded-lg mt-1">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">۳. مالکیت فکری</h2>
                <div className="text-muted-foreground leading-loose text-lg text-justify">
                  تمام محتوای سایت، طراحی‌ها و کدها متعلق به کارنکس است. با این حال، مالکیت معنوی ایده‌هایی که شما وارد می‌کنید و طرح‌های اختصاصی تولید شده برای شما، متعلق به خودتان است. ما هیچ ادعایی بر روی ایده‌های شما نداریم.
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-border/50" />

          <section className="relative">
             <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 bg-red-500/10 rounded-lg mt-1">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">۴. تغییرات در قوانین</h2>
                <div className="text-muted-foreground leading-loose text-lg text-justify">
                  کارنکس حق دارد در هر زمان این قوانین را تغییر دهد. تغییرات از طریق سایت اطلاع‌رسانی خواهند شد و ادامه استفاده شما به منزله پذیرش تغییرات است. توصیه می‌کنیم این صفحه را به صورت دوره‌ای بررسی کنید.
                </div>
              </div>
            </div>
          </section>
        </motion.div>
        
        <div className="mt-12 text-center text-muted-foreground text-sm">
          <p>در صورت داشتن هرگونه سوال، با تیم پشتیبانی ما تماس بگیرید.</p>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
