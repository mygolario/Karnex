import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "بیزینس پلن استارتاپ — از ایده تا مسیر اجرا",
  description:
    "راهنمای نوشتن بیزینس پلن استارتاپ برای بنیان‌گذاران ایرانی: مسئله، بازار، مدل درآمد، نقشه راه و ابزارهای کارنکس.",
  keywords: [
    "بیزینس پلن استارتاپ",
    "طرح کسب و کار",
    "برنامه کسب و کار",
    "ایده استارتاپ",
    "کارنکس",
  ],
  alternates: { canonical: "/guides/startup-business-plan" },
};

export default function StartupBusinessPlanGuidePage() {
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
            بیزینس پلن استارتاپ: از ایده تا مسیر اجرا
          </h1>
          <p className="text-muted-foreground text-lg">
            بیزینس پلن خوب لزوماً ۵۰ صفحه نیست. برای مرحلهٔ اولیه، یک مسیر شفاف
            کافی است: مسئله، مشتری، راه‌حل، درآمد، و گام‌های ۳۰/۶۰/۹۰ روزه.
          </p>

          <h2 className="text-xl font-bold pt-2">چارچوب پیشنهادی</h2>
          <ul className="list-disc pe-6 space-y-2">
            <li>مسئله و درد مشتری را در یک جمله بنویس</li>
            <li>بازار هدف و فرضیه‌هایت را مشخص کن</li>
            <li>راه‌حل و تمایز را کوتاه توضیح بده</li>
            <li>مدل درآمد و قیمت‌گذاری اولیه</li>
            <li>نقشه راه اجرایی (نه فقط ایده)</li>
            <li>ریسک‌ها و چیزهایی که هنوز نمی‌دانی</li>
          </ul>

          <h2 className="text-xl font-bold pt-2">نقش کارنکس</h2>
          <p>
            کارنکس هم‌بنیان‌گذار هوشمند استارتاپ است: ایده را می‌گیرد، بوم و نقشه
            راه ایران‌محور می‌سازد، و کمک می‌کند قبل از جذب سرمایه مسیر را روشن
            کنی.
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild>
              <Link href="/signup">شروع با ایدهٔ خودت</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/guides/pitch-deck">ساخت پیچ‌دک</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
