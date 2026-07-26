import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "بوم کسب‌وکار چیست؟ راهنمای کامل BMC",
  description:
    "آموزش بوم مدل کسب‌وکار (Business Model Canvas) به زبان ساده برای استارتاپ‌های ایرانی — ۹ بلوک، مثال و ساخت بوم با کارنکس.",
  keywords: [
    "بوم کسب و کار",
    "بوم مدل کسب و کار",
    "Business Model Canvas",
    "BMC",
    "استارتاپ",
    "کارنکس",
  ],
  alternates: { canonical: "/guides/business-model-canvas" },
};

export default function BusinessModelCanvasGuidePage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="pt-28 pb-20">
        <article className="container max-w-3xl mx-auto px-4 space-y-6 text-foreground/90 leading-relaxed">
          <Link
            href="/guides"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2"
          >
            <ArrowRight className="ms-1 w-4 h-4" />
            همه راهنماها
          </Link>

          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            بوم کسب‌وکار (Business Model Canvas) چیست؟
          </h1>
          <p className="text-muted-foreground text-lg">
            بوم کسب‌وکار یک صفحهٔ یک‌نفره است که مدل درآمد، مشتری و ارزش پیشنهادی
            استارتاپ را شفاف می‌کند — بدون ده‌ها صفحه ورد.
          </p>

          <h2 className="text-xl font-bold pt-2">۹ بلوک اصلی</h2>
          <ol className="list-decimal pe-6 space-y-2">
            <li>
              <strong>بخش‌های مشتری</strong> — برای چه کسانی ارزش می‌سازی؟
            </li>
            <li>
              <strong>ارزش پیشنهادی</strong> — چه مشکلی را بهتر از بقیه حل می‌کنی؟
            </li>
            <li>
              <strong>کانال‌ها</strong> — چطور به مشتری می‌رسی؟
            </li>
            <li>
              <strong>روابط با مشتری</strong> — چطور نگه می‌داری‌شان؟
            </li>
            <li>
              <strong>جریان درآمد</strong> — پول از کجا می‌آید؟
            </li>
            <li>
              <strong>منابع کلیدی</strong> — چه دارایی‌هایی حیاتی‌اند؟
            </li>
            <li>
              <strong>فعالیت‌های کلیدی</strong> — هر هفته چه کاری باید انجام شود؟
            </li>
            <li>
              <strong>شرکای کلیدی</strong> — بدون چه کسانی گیر می‌کنی؟
            </li>
            <li>
              <strong>ساختار هزینه</strong> — پول کجا خرج می‌شود؟
            </li>
          </ol>

          <h2 className="text-xl font-bold pt-2">چطور در کارنکس بوم بسازی؟</h2>
          <p>
            در کارنکس، بعد از ثبت ایده در جنیسیس، می‌توانی بوم کسب‌وکار را با
            هوش مصنوعی پر کنی، نقد کنی و روی همان پروژه نگه داری — نه در چت‌های
            پراکنده.
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild>
              <Link href="/signup">ساخت بوم رایگان</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/guides/startup-business-plan">بیزینس پلن استارتاپ</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
