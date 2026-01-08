import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardIcon } from "@/components/ui/card";
import Link from "next/link";
import { 
  Rocket, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Target, 
  Palette,
  Map,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Lightbulb,
  Cpu,
  FileText,
  Star
} from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
      <Navbar />
      
      <main className="flex-1">
        {/* ==================== HERO SECTION ==================== */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 pattern-dots opacity-30" />
          
          {/* Floating Shapes */}
          <div className="absolute top-1/4 right-[10%] w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-[10%] w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-6s" }} />
          
          <div className="section-container relative z-10 text-center py-20">
            <div className="max-w-4xl mx-auto space-y-8 stagger-children">
              {/* Beta Badge */}
              <Badge 
                variant="gradient" 
                size="lg" 
                dot 
                dotColor="bg-white animate-pulse"
                className="mx-auto"
              >
                <Sparkles size={14} />
                نسخه آزمایشی عمومی فعال شد
              </Badge>
              
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                <span className="text-foreground">ایده از شما،</span>
                <br />
                <span className="text-gradient">مسیر اجرا با کارنکس</span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                بدون نیاز به سرمایه اولیه یا دانش فنی. کارنکس قدم‌به‌قدم شما را از 
                یک ایده خام تا راه‌اندازی کامل کسب‌وکارتان راهنمایی می‌کند.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/new-project">
                  <Button 
                    variant="gradient" 
                    size="xl" 
                    rounded="full"
                    className="group"
                  >
                    <Rocket size={20} className="group-hover:animate-bounce" />
                    ساخت پروژه رایگان
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button 
                    variant="glass" 
                    size="xl" 
                    rounded="full"
                  >
                    چگونه کار می‌کند؟
                  </Button>
                </Link>
              </div>
              
              {/* Trust Indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck size={16} className="text-secondary" />
                <span>امنیت ۱۰۰٪ اطلاعات شما تضمین شده است</span>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-border/50 mt-8">
                {[
                  { value: "۵۰۰+", label: "ایده ثبت‌شده" },
                  { value: "۳۰ ثانیه", label: "زمان تولید طرح" },
                  { value: "رایگان", label: "شروع فوری" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-black text-gradient">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ==================== PROBLEM SECTION ==================== */}
        <section className="py-24 relative" id="problems">
          <div className="section-container">
            <div className="text-center mb-16 stagger-children">
              <Badge variant="danger" size="lg" className="mb-4">
                مشکل
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
                چرا ایده‌ها شکست می‌خورند؟
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                بیشتر ایده‌های بزرگ هرگز اجرایی نمی‌شوند، زیرا...
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 stagger-children">
              {[
                {
                  icon: TrendingUp,
                  title: "فکر می‌کنید بودجه ندارید",
                  desc: "تصور می‌کنید برای شروع نیاز به سرمایه سنگین دارید، در حالی که راهکارها ارزان‌تر از همیشه هستند.",
                  color: "primary",
                },
                {
                  icon: Map,
                  title: "نمی‌دانید از کجا شروع کنید",
                  desc: "مسیر گنگ و پیچیده است. هزاران کار برای انجام دادن وجود دارد و اولویت‌بندی سخت است.",
                  color: "accent",
                },
                {
                  icon: Cpu,
                  title: "دانش فنی ندارید",
                  desc: "فکر می‌کنید باید برنامه‌نویس باشید یا تیم فنی داشته باشید تا اولین محصول خود را بسازید.",
                  color: "secondary",
                },
              ].map((item, i) => (
                <Card 
                  key={i} 
                  variant="default" 
                  hover="lift"
                  className="text-center"
                >
                  <CardIcon variant={item.color as any} className="mx-auto mb-4 h-14 w-14">
                    <item.icon size={24} />
                  </CardIcon>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== HOW IT WORKS ==================== */}
        <section className="py-24 bg-muted/30 relative" id="how-it-works">
          <div className="absolute inset-0 pattern-grid opacity-50" />
          
          <div className="section-container relative z-10">
            <div className="text-center mb-16 stagger-children">
              <Badge variant="secondary" size="lg" className="mb-4">
                راهکار کارنکس
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
                مسیر موفقیت، ساده‌سازی شده
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                تنها در ۳ مرحله ساده، ایده خود را به یک طرح اجرایی تبدیل کنید
              </p>
            </div>
            
            <div className="relative">
              {/* Connection Line (Desktop) */}
              <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary via-accent to-secondary opacity-30" />
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: "۱",
                    icon: Lightbulb,
                    title: "تعریف ایده",
                    desc: "به سوالات هوشمند ما پاسخ دهید تا هسته اصلی کسب‌وکار شما شفاف شود.",
                    color: "from-primary to-purple-600",
                  },
                  {
                    step: "۲",
                    icon: Cpu,
                    title: "پردازش با کارنکس",
                    desc: "موتور هوشمند ما بازار، رقبا و ابزارهای کم‌هزینه مناسب شما را تحلیل می‌کند.",
                    color: "from-accent to-orange-500",
                  },
                  {
                    step: "۳",
                    icon: FileText,
                    title: "دریافت نقشه راه",
                    desc: "یک برنامه اجرایی دقیق، کیت برندینگ و بوم کسب‌وکار آماده تحویل بگیرید.",
                    color: "from-secondary to-emerald-600",
                  },
                ].map((item, i) => (
                  <div key={i} className="relative text-center group">
                    {/* Step Circle */}
                    <div className="relative mx-auto mb-6">
                      <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-shadow`}>
                        <item.icon size={32} />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-card border-2 border-border rounded-full flex items-center justify-center text-sm font-black text-foreground shadow-md">
                        {item.step}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FEATURES GRID ==================== */}
        <section className="py-24" id="features">
          <div className="section-container">
            <div className="text-center mb-16 stagger-children">
              <Badge variant="info" size="lg" className="mb-4">
                ویژگی‌ها
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
                همه چیز در یک پلتفرم
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ابزارهای حرفه‌ای برای شروع، رشد و مدیریت کسب‌وکار
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {[
                {
                  icon: Target,
                  title: "بوم کسب‌وکار",
                  desc: "طرح کامل و جامع بیزینس مدل کانوس",
                  variant: "primary",
                },
                {
                  icon: Palette,
                  title: "هویت بصری",
                  desc: "رنگ‌بندی، لوگو و راهنمای برند",
                  variant: "accent",
                },
                {
                  icon: Map,
                  title: "نقشه راه",
                  desc: "مراحل اجرا با اولویت‌بندی هوشمند",
                  variant: "secondary",
                },
                {
                  icon: TrendingUp,
                  title: "استراتژی بازاریابی",
                  desc: "کانال‌ها، محتوا و تبلیغات هدفمند",
                  variant: "primary",
                },
                {
                  icon: ShieldCheck,
                  title: "راهنمای حقوقی",
                  desc: "مجوزها، قراردادها و ثبت شرکت",
                  variant: "accent",
                },
                {
                  icon: Users,
                  title: "مشاور هوشمند",
                  desc: "چت ۲۴/۷ با دستیار آگاه به پروژه",
                  variant: "secondary",
                },
              ].map((item, i) => (
                <Card 
                  key={i} 
                  variant="default"
                  hover="lift"
                >
                  <CardIcon variant={item.variant as any} className="mb-4">
                    <item.icon size={24} />
                  </CardIcon>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== TRUST SECTION ==================== */}
        <section className="py-24 bg-muted/30">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center stagger-children">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/10 mb-8">
                <ShieldCheck size={40} className="text-secondary" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6">
                ایده شما، دارایی شماست
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                ما می‌دانیم که محرمانگی چقدر برای شما مهم است. کارنکس از پیشرفته‌ترین پروتکل‌های رمزنگاری 
                استفاده می‌کند و اطلاعات و ایده‌های شما در محیطی ایزوله پردازش می‌شوند و هرگز به صورت عمومی منتشر نخواهند شد.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  "رمزنگاری End-to-End",
                  "ذخیره‌سازی امن ابری",
                  "عدم اشتراک‌گذاری اطلاعات",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-foreground bg-card px-4 py-2 rounded-full border border-border">
                    <CheckCircle2 size={16} className="text-secondary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== CTA SECTION ==================== */}
        <section className="py-24 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-secondary" />
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
          
          {/* Floating Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="section-container relative z-10 text-center">
            <div className="max-w-3xl mx-auto stagger-children">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-6">
                <Star size={14} className="fill-current" />
                شروع کاملاً رایگان
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
                آماده تبدیل ایده به واقعیت هستید؟
              </h2>
              
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                همین الان پروژه خود را بسازید و در کمتر از ۳۰ ثانیه طرح کسب‌وکار کامل دریافت کنید.
              </p>
              
              <Link href="/new-project">
                <Button 
                  size="xl" 
                  rounded="full"
                  className="bg-white text-primary hover:bg-white/90 shadow-2xl"
                >
                  <Rocket size={20} />
                  شروع رایگان — بدون نیاز به کارت بانکی
                  <ArrowLeft size={18} />
                </Button>
              </Link>
              
              <p className="text-sm text-white/60 mt-6 flex items-center justify-center gap-2">
                <Clock size={14} />
                کمتر از ۲ دقیقه زمان می‌برد
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
