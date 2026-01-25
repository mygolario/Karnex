import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Badge } from "lucide-react";
import { Wallet, Map, Code, ShieldCheck } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans" dir="rtl">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 py-20 text-center md:py-32 lg:py-40 overflow-hidden">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
              <span className="flex h-2 w-2 rounded-full bg-secondary me-2 animate-pulse"></span>
              نسخه آزمایشی عمومی فعال شد
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
              ایده از شما، <span className="text-secondary">مسیر اجرا</span> با کارنکس
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
              بدون نیاز به سرمایه اولیه یا دانش فنی. هوش مصنوعی ما قدم‌به‌قدم شما را از 
              یک ایده خام تا راه‌اندازی کامل کسب‌وکارتان راهنمایی می‌کند.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/new-project">
                <Button size="lg" className="h-12 rounded-full px-8 text-lg font-bold shadow-lg shadow-primary/20">
                  ساخت پروژه جدید
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-12 rounded-full px-8 text-lg">
                  چگونه کار می‌کند؟
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground/80 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              امنیت ۱۰۰٪ اطلاعات شما تضمین شده است
            </p>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-20 bg-gradient-to-tr from-primary to-secondary blur-[100px] rounded-full" />
        </section>

        {/* Problem Section */}
        <section className="container mx-auto max-w-6xl px-4 py-16 md:py-24" id="intro">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              چرا ایده‌ها شکست می‌خورند؟
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              بیشتر ایده‌های بزرگ هرگز اجرایی نمی‌شوند، زیرا...
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Wallet,
                title: "فکر می‌کنید بودجه ندارید",
                desc: "تصور می‌کنید برای شروع نیاز به سرمایه سنگین دارید، در حالی که راهکارها ارزان‌تر از همیشه هستند."
              },
              {
                icon: Map,
                title: "نمی‌دانید از کجا شروع کنید",
                desc: "مسیر گنگ و پیچیده است. هزاران کار برای انجام دادن وجود دارد و اولویت‌بندی سخت است."
              },
              {
                icon: Code,
                title: "دانش فنی ندارید",
                desc: "فکر می‌کنید باید برنامه‌نویس باشید یا تیم فنی داشته باشید تا اولین محصول خود را بسازید."
              }
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border bg-background p-8 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Solution Section */}
        <section className="bg-slate-50 py-16 md:py-24" id="features">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-16 text-center">
              <span className="mb-2 block font-semibold text-secondary">راهکار کارنکس</span>
              <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
                مسیر موفقیت، ساده‌سازی شده
              </h2>
            </div>
            
            <div className="relative grid gap-12 md:grid-cols-3">
              {/* Connector Line (Desktop) */}
              <div className="absolute top-12 hidden h-0.5 w-full bg-gradient-to-l from-transparent via-border to-transparent md:block opacity-30" />
              
              {[
                {
                  step: "۱",
                  title: "تعریف ایده",
                  desc: "به سوالات هوشمند ما پاسخ دهید تا هسته اصلی کسب‌وکار شما شفاف شود."
                },
                {
                  step: "۲",
                  title: "پردازش هوش مصنوعی",
                  desc: "موتور هوشمند ما بازار، رقبا و ابزارهای کم‌هزینه مناسب شما را تحلیل می‌کند."
                },
                {
                  step: "۳",
                  title: "دریافت نقشه راه",
                  desc: "یک برنامه اجرایی دقیق، کیت برندینگ و بوم کسب‌وکار آماده تحویل بگیرید."
                }
              ].map((item, i) => (
                <div key={i} className="relative flex flex-col items-center text-center">
                  <div className="z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg text-3xl font-black text-secondary">
                    {item.step}
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="container mx-auto max-w-4xl px-4 py-24 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100/50 mb-8 animate-pulse text-emerald-600">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-primary">
            ایده شما، دارایی شماست
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
            ما می‌دانیم که محرمانگی چقدر برای شما مهم است. کارنکس از پیشرفته‌ترین پروتکل‌های رمزنگاری 
            استفاده می‌کند و اطلاعات و ایده‌های شما در محیطی ایزوله پردازش می‌شوند و هرگز به صورت عمومی منتشر نخواهند شد.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
