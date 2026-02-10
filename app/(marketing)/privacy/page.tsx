"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Eye, ShieldCheck, Cookie, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[400px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

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
              <Lock size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-foreground mb-2">حریم خصوصی</h1>
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
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">۱. مقدمه</h2>
                <div className="text-muted-foreground leading-loose text-lg text-justify">
                   به کارنکس خوش آمدید. ما به حریم خصوصی شما احترام می‌گذاریم و متعهد به حفاظت از اطلاعات شخصی شما هستیم. این سیاست‌نامه توضیح می‌دهد که چگونه اطلاعات شما را جمع‌آوری، استفاده و محافظت می‌کنیم. اعتماد شما سرمایه ماست.
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-border/50" />

          <section className="relative">
             <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 bg-blue-500/10 rounded-lg mt-1">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">۲. اطلاعاتی که جمع‌آوری می‌کنیم</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-lg leading-loose marker:text-primary">
                  <li><strong>اطلاعات هویتی:</strong> نام، ایمیل، شماره تماس (برای ثبت‌نام و احراز هویت).</li>
                  <li><strong>اطلاعات پروژه:</strong> داده‌هایی که شما در بوم کسب‌وکار، نقشه راه یا سایر ابزارها وارد می‌کنید.</li>
                  <li><strong>اطلاعات فنی:</strong> آدرس IP، نوع مرورگر و کوکی‌ها (برای بهبود تجربه کاربری و امنیت).</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="h-px bg-border/50" />

          <section className="relative">
             <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 bg-green-500/10 rounded-lg mt-1">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">۳. نحوه استفاده از اطلاعات</h2>
                <p className="text-muted-foreground mb-4 text-lg">ما از اطلاعات شما برای ارائه خدمات زیر استفاده می‌کنیم:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-lg leading-loose marker:text-green-500">
                  <li>تولید محتوای هوشمند (مانند بیزینس پلن و پیچ دک) بر اساس ورودی‌های شما.</li>
                  <li>پردازش پرداخت‌ها و مدیریت اشتراک‌ها.</li>
                  <li>ارسال اعلان‌های مهم (مانند فاکتورها یا تغییرات سرویس).</li>
                  <li>بهبود عملکرد سیستم و رفع اشکالات فنی.</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="h-px bg-border/50" />

          <section className="relative">
             <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 bg-purple-500/10 rounded-lg mt-1">
                <Lock className="w-6 h-6 text-purple-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">۴. حفاظت از داده‌ها</h2>
                <div className="text-muted-foreground leading-loose text-lg text-justify">
                  تمامی اطلاعات شما با استفاده از پروتکل‌های امنیتی استاندارد (SSL) رمزنگاری می‌شود. ما اطلاعات شما را به هیچ شخص ثالثی نمی‌فروشیم. دسترسی به داده‌های شما تنها برای کارمندان مجاز و جهت ارائه خدمات امکان‌پذیر است.
                </div>
              </div>
            </div>
          </section>

           <div className="h-px bg-border/50" />

          <section className="relative">
             <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 bg-orange-500/10 rounded-lg mt-1">
                <Cookie className="w-6 h-6 text-orange-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">۵. کوکی‌ها</h2>
                 <div className="text-muted-foreground leading-loose text-lg text-justify">
                   ما از کوکی‌ها برای ذخیره تنظیمات شما (مانند تم رنگی یا وضعیت ورود) استفاده می‌کنیم. شما می‌توانید از طریق تنظیمات مرورگر خود، کوکی‌ها را غیرفعال کنید، اما این کار ممکن است عملکرد سایت را محدود کند.
                </div>
              </div>
            </div>
          </section>
        
          <div className="h-px bg-border/50" />

          <div className="bg-muted/50 p-6 rounded-2xl border border-white/5">
            <h4 className="text-lg font-bold text-foreground mb-2">تماس با ما</h4>
            <p className="text-muted-foreground">
              در صورت داشتن هرگونه سوال، می‌توانید از طریق ایمیل <a href="mailto:support@karnex.ir" className="text-primary hover:underline">support@karnex.ir</a> یا بخش پشتیبانی با ما در ارتباط باشید.
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
