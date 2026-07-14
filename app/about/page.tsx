import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Target, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export const metadata: Metadata = {
  title: "درباره کارنکس",
  description:
    "کارنکس هم‌بنیان‌گذار هوشمند برای استارتاپ‌های ایرانی است — از ایده تا بوم، نقشه راه و پیچ‌دک.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />

      <main className="pt-28 pb-20 relative overflow-hidden">
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container max-w-3xl mx-auto px-4 relative z-10">
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-8 ps-0 hover:bg-transparent hover:text-primary group"
            >
              <ArrowRight className="ms-2 group-hover:-translate-x-1 transition-transform" size={20} />
              بازگشت به صفحه اصلی
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl text-primary border border-primary/10">
              <Heart size={36} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">
                درباره کارنکس
              </h1>
              <p className="text-muted-foreground text-lg">
                هم‌بنیان‌گذار هوشمند برای استارتاپ‌های ایرانی
              </p>
            </div>
          </div>

          <div className="space-y-10 text-foreground/90 leading-relaxed text-base md:text-lg">
            <section className="bg-card/60 border border-border/60 rounded-3xl p-8 md:p-10 space-y-4">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                چرا کارنکس؟
              </h2>
              <p>
                خیلی از بنیان‌گذاران ایرانی ایده دارند، ولی بین چت‌های پراکنده، فایل‌های ورد،
                و مشاوره‌های گران گیر می‌کنند. کارنکس برای این ساخته شده که مسیر از ایده تا اجرا
                را در یک جا جمع کند — با هوش مصنوعی که روی پروژه خودت کار می‌کند، نه یک چت عمومی.
              </p>
              <p>
                تمرکز لانچ ما روی <strong>استارتاپ‌ها</strong> است: بوم کسب‌وکار، نقشه راه عملی،
                پیچ‌دک، و دستیار هوشمند. مسیرهای دیگر (کسب‌وکار سنتی و محتوا) در راهند و وقتی
                آماده باشند، باز می‌شوند.
              </p>
            </section>

            <section className="bg-card/60 border border-border/60 rounded-3xl p-8 md:p-10 space-y-4">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                ماموریت ما
              </h2>
              <p>
                کمک به بنیان‌گذار ایرانی تا سریع‌تر، شفاف‌تر و با اعتماد بیشتر جلو برود — بدون
                وعده‌های توخالی و بدون آمار ساختگی. کیفیت محصول و رضایت کاربر برای ما قبل از
                فشار فروش است.
              </p>
              <ul className="list-disc pe-6 space-y-2 text-muted-foreground">
                <li>شروع رایگان برای اینکه جادوی محصول را حس کنی</li>
                <li>ابزارهای واقعی: بوم، نقشه راه، پیچ‌دک، کوپایلوت</li>
                <li>پشتیبانی انسانی از طریق ایمیل و فرم تماس</li>
              </ul>
            </section>

            <section className="bg-card/60 border border-border/60 rounded-3xl p-8 md:p-10 space-y-4">
              <h2 className="text-2xl font-black">تیم</h2>
              <p>
                کارنکس توسط یک بنیان‌گذار جوان ساخته می‌شود که هم به کارآفرینی علاقه دارد و هم به
                ابزارهای هوش مصنوعی عصر جدید. اگر سوالی داری، مستقیم با ما در تماس باش —
                هنوز تیم بزرگ نیستیم، ولی پاسخگو هستیم.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/signup">
                  <Button className="rounded-xl font-bold bg-gradient-to-r from-primary to-secondary text-white">
                    شروع رایگان
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="rounded-xl font-bold">
                    ارتباط با ما
                  </Button>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
