import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "پیچ‌دک چیست؟ ساختار اسلایدهای جذب سرمایه",
  description:
    "آموزش ساخت پیچ‌دک استارتاپ: ترتیب اسلایدها، اشتباهات رایج و آمادگی برای سرمایه‌گذار — با ابزار پیچ‌دک کارنکس.",
  keywords: [
    "پیچ دک",
    "پیچ‌دک",
    "pitch deck",
    "جذب سرمایه استارتاپ",
    "اسلاید سرمایه‌گذار",
    "کارنکس",
  ],
  alternates: { canonical: "/guides/pitch-deck" },
};

export default function PitchDeckGuidePage() {
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
            پیچ‌دک استارتاپ: ساختار استاندارد
          </h1>
          <p className="text-muted-foreground text-lg">
            پیچ‌دک داستان کوتاه استارتاپ برای سرمایه‌گذار است. هدف متقاعد کردن در
            ۱۰–۱۵ اسلاید است، نه پر کردن جزئیات فنی.
          </p>

          <h2 className="text-xl font-bold pt-2">ترتیب پیشنهادی اسلایدها</h2>
          <ol className="list-decimal pe-6 space-y-2">
            <li>عنوان و یک‌خطی</li>
            <li>مسئله</li>
            <li>راه‌حل / محصول</li>
            <li>بازار</li>
            <li>مدل کسب‌وکار</li>
            <li>کشش (traction) — حتی اگر کوچک</li>
            <li>رقابت و تمایز</li>
            <li>تیم</li>
            <li>درخواست (ask) و استفاده از سرمایه</li>
          </ol>

          <h2 className="text-xl font-bold pt-2">اشتباه رایج</h2>
          <p>
            اغراق در آمار بدون منبع، یا پنهان کردن اینکه هنوز در روزهای اولی.
            سرمایه‌گذار صداقت + مسیر یادگیری را بیشتر از عدد ساختگی دوست دارد.
          </p>

          <h2 className="text-xl font-bold pt-2">در کارنکس</h2>
          <p>
            ابزار پیچ‌دک کارنکس روی همان پروژهٔ استارتاپت کار می‌کند و می‌توانی
            تم، ارائه و خروجی PPTX بگیری — همراه با امتیاز آمادگی سرمایه‌گذار.
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild>
              <Link href="/signup">ساخت پیچ‌دک با کارنکس</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/guides/business-model-canvas">بوم کسب‌وکار</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
