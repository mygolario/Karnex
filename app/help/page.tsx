import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HelpCircle,
  Rocket,
  Map,
  LayoutGrid,
  Bot,
  Presentation,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { FAQ_ITEMS } from "@/lib/marketing/faq-data";
import { JsonLd } from "@/components/shared/json-ld";

export const metadata: Metadata = {
  title: "راهنما و سوالات متداول",
  description:
    "شروع کار با کارنکس، توضیح اعتبار AI، تعرفه‌ها و پاسخ سوالات رایج بنیان‌گذاران.",
  alternates: { canonical: "/help" },
};

const STEPS = [
  {
    icon: Rocket,
    title: "ثبت‌نام و ساخت پروژه",
    body: "حساب رایگان بساز، مسیر استارتاپ را انتخاب کن و ایده را وارد کن.",
    href: "/signup",
  },
  {
    icon: Map,
    title: "نقشه راه را اجرا کن",
    body: "گام‌های هفتگی را تیک بزن و پیشرفت پروژه را ببین.",
    href: "/login",
  },
  {
    icon: LayoutGrid,
    title: "بوم و پیچ‌دک",
    body: "مدل کسب‌وکار را کامل کن و برای ارائه به سرمایه‌گذار آماده شو.",
    href: "/login",
  },
  {
    icon: Bot,
    title: "از دستیار بپرس",
    body: "کوپایلوت روی داده پروژه خودت جواب می‌دهد — نه یک چت عمومی.",
    href: "/login",
  },
] as const;

export default function PublicHelpPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <JsonLd
        faqItems={FAQ_ITEMS.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />
      <Navbar />

      <main className="pt-28 pb-20 relative overflow-hidden">
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container max-w-4xl mx-auto px-4 relative z-10">
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
              <BookOpen size={36} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">
                راهنمای کارنکس
              </h1>
              <p className="text-muted-foreground text-lg">
                شروع سریع برای بنیان‌گذاران — بدون نیاز به ورود
              </p>
            </div>
          </div>

          <section className="mb-14">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Rocket className="w-6 h-6 text-primary" />
              شروع در ۴ گام
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {STEPS.map((step) => (
                <Link
                  key={step.title}
                  href={step.href}
                  className="rounded-2xl border border-border/60 bg-card/70 p-5 hover:border-primary/40 transition-colors"
                >
                  <step.icon className="w-5 h-5 text-primary mb-3" />
                  <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-14 rounded-3xl border border-border/60 bg-card/60 p-6 md:p-8">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
              <Presentation className="w-6 h-6 text-primary" />
              ابزارهای اصلی لانچ
            </h2>
            <p className="text-muted-foreground mb-4 text-sm">
              پیشخوان، نقشه راه، بوم کسب‌وکار، پیچ‌دک، اعتبارسنجی، رشد، رقبا و دستیار کارنکس.
            </p>
            <Link href="/pricing">
              <Button variant="outline" className="rounded-xl font-bold">
                مشاهده تعرفه‌ها
              </Button>
            </Link>
          </section>

          <section className="mb-14">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              سوالات متداول
            </h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-border/60 bg-card/50 open:bg-card open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none px-5 py-4 font-bold text-foreground flex items-center justify-between gap-3">
                    {item.question}
                    <span className="text-muted-foreground text-lg group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-4 text-muted-foreground leading-relaxed text-sm md:text-base">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-6 md:p-8 text-center">
            <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-black mb-2">هنوز سوال داری؟</h2>
            <p className="text-muted-foreground mb-5 text-sm">
              از صفحه تماس پیام بفرست یا به support@karnex.ir ایمیل بزن.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/contact">
                <Button className="rounded-xl font-bold bg-gradient-to-r from-primary to-secondary text-white">
                  تماس با پشتیبانی
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" className="rounded-xl font-bold">
                  شروع رایگان
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
