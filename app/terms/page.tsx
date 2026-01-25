"use client";

import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
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
              <Scale size={32} />
            </div>
            <h1 className="text-3xl font-black text-foreground">قوانین و مقررات</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            آخرین بروزرسانی: ۱۲ دی ۱۴۰۴
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 bg-card p-8 rounded-3xl border border-border shadow-sm">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">۱. پذیرش قوانین</h2>
            <p className="text-muted-foreground leading-relaxed">
              با ثبت‌نام و استفاده از خدمات کارنکس، شما موافقت می‌کنید که به این قوانین و مقررات پایبند باشید. اگر با هر بخشی از این قوانین مخالفید، لطفاً از خدمات ما استفاده نکنید.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">۲. استفاده از خدمات هوش مصنوعی</h2>
            <p className="text-muted-foreground leading-relaxed">
              خروجی‌های تولید شده توسط هوش مصنوعی کارنکس (طرح‌های کسب‌وکار، مشاوره‌ها) فقط جنبه پیشنهادی و آموزشی دارند. کارنکس مسئولیتی در قبال تصمیمات تجاری یا ضرر و زیان ناشی از استفاده از این اطلاعات ندارد. همیشه قبل از اقدامات جدی با متخصصین مشورت کنید.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">۳. مالکیت فکری</h2>
            <p className="text-muted-foreground leading-relaxed">
              تمام محتوای سایت، طراحی‌ها و کدها متعلق به کارنکس است. با این حال، مالکیت معنوی ایده‌هایی که شما وارد می‌کنید و طرح‌های اختصاصی تولید شده برای شما، متعلق به خودتان است.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">۴. تغییرات در قوانین</h2>
            <p className="text-muted-foreground leading-relaxed">
              کارنکس حق دارد در هر زمان این قوانین را تغییر دهد. تغییرات از طریق سایت اطلاع‌رسانی خواهند شد و ادامه استفاده شما به منزله پذیرش تغییرات است.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
