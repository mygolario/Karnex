import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "راهنمای استارتاپ",
  description:
    "راهنمای رایگان بوم کسب‌وکار، بیزینس پلن و پیچ‌دک برای بنیان‌گذاران ایرانی — با کارنکس، هم‌بنیان‌گذار هوشمند استارتاپ.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "راهنمای استارتاپ | کارنکس",
    description:
      "از ایده تا بوم، نقشه راه و پیچ‌دک — راهنماهای کوتاه برای بنیان‌گذاران ایرانی.",
  },
};

const GUIDES = [
  {
    href: "/guides/business-model-canvas",
    title: "بوم کسب‌وکار (Business Model Canvas)",
    description:
      "۹ بلوک بوم را بشناس و در چند دقیقه برای ایدهٔ خودت پر کن — با کمک هوش مصنوعی کارنکس.",
  },
  {
    href: "/guides/startup-business-plan",
    title: "بیزینس پلن استارتاپ",
    description:
      "چطور از ایده به یک مسیر اجرایی برسی: مسئله، مشتری، مدل درآمد و گام‌های بعدی.",
  },
  {
    href: "/guides/pitch-deck",
    title: "پیچ‌دک سرمایه‌گذار",
    description:
      "ساختار استاندارد اسلایدهای پیچ و چک‌لیست آمادگی برای جذب سرمایه.",
  },
] as const;

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/15">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black">راهنمای استارتاپ</h1>
              <p className="text-muted-foreground mt-1">
                کارنکس | هم‌بنیان‌گذار هوشمند استارتاپ — محتوا برای کشف غیربرندی
              </p>
            </div>
          </div>

          <ul className="space-y-4">
            {GUIDES.map((g) => (
              <li key={g.href}>
                <Link
                  href={g.href}
                  className="block rounded-2xl border border-border/60 bg-card/50 p-6 hover:border-primary/40 transition-colors"
                >
                  <h2 className="text-xl font-bold mb-2">{g.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {g.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/signup">شروع رایگان در کارنکس</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                صفحه اصلی
                <ArrowLeft className="ms-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
