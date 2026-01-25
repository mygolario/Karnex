"use client";

import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowRight className="ml-2" size={20} />
              بازگشت به صفحه اصلی
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Shield size={32} />
            </div>
            <h1 className="text-3xl font-black text-foreground">سیاست حفظ حریم خصوصی</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            آخرین بروزرسانی: ۱۲ دی ۱۴۰۴
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 bg-card p-8 rounded-3xl border border-border shadow-sm">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">۱. مقدمه</h2>
            <p className="text-muted-foreground leading-relaxed">
              کارنکس به حریم خصوصی شما احترام می‌گذارد. این سند توضیح می‌دهد که چگونه اطلاعات شما را جمع‌آوری، استفاده و محافظت می‌کنیم. با استفاده از خدمات ما، شما با شیوه‌های شرح داده شده در این سیاست موافقت می‌کنید.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">۲. اطلاعاتی که جمع‌آوری می‌کنیم</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 marker:text-primary">
              <li>اطلاعات حساب کاربری (نام، ایمیل، تصویر پروفایل) که از طریق گوگل دریافت می‌شود.</li>
              <li>اطلاعات پروژه‌ها و ایده‌های کسب‌وکار که شما وارد می‌کنید.</li>
              <li>داده‌های تحلیلی ناشناس برای بهبود عملکرد سایت.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">۳. نحوه استفاده از اطلاعات</h2>
            <p className="text-muted-foreground leading-relaxed">
              ما از اطلاعات شما برای تولید طرح‌های کسب‌وکار هوشمند، ارائه مشاوره حقوقی و ذخیره‌سازی پیشرفت پروژه‌هایتان استفاده می‌کنیم. اطلاعات شما هرگز بدون رضایت شما به شخص ثالث فروخته نمی‌شود.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">۴. امنیت داده‌ها</h2>
            <p className="text-muted-foreground leading-relaxed">
              ما از اقدامات امنیتی استاندارد صنعتی (مانند رمزنگاری SSL و احراز هویت امن Firebase) برای محافظت از داده‌های شما در برابر دسترسی غیرمجاز استفاده می‌کنیم.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">۵. تماس با ما</h2>
            <p className="text-muted-foreground leading-relaxed">
              اگر سوالی در مورد این سیاست دارید، لطفاً با پشتیبانی تماس بگیرید.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
