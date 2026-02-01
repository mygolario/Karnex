"use client";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { StripeHero } from "@/components/marketing/stripe-hero";
import { StripeFeatures } from "@/components/marketing/stripe-features";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden selection:bg-primary/20 font-sans" dir="rtl">
      
      {/* Fixed Navbar */}
      <Navbar />

      <main>
          {/* HERO */}
          <StripeHero />

          {/* FEATURES - Bento Grid */}
          <StripeFeatures />

          {/* DEMO SECTION (Optional Placeholder replaced with CTA for now or specific content if user asked, but user said NO placeholders. So I will make a solid CTA section instead of empty demo) */}
          <section id="demo" className="py-32 relative text-center px-4 overflow-hidden bg-slate-900 text-white">
             {/* Abstract Background */}
             <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay" />
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-purple-900/40 to-slate-900 z-0" />
             
             <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mb-8 animate-pulse">
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tight leading-tight">
                    آینده کسب‌وکارتان را <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        همین امروز بسازید
                    </span>
                </h2>
                <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                  بیش از ۲۰۰۰ کارآفرین، مدیر کسب‌وکار و کریتور از کارنکس برای رشد سریع‌تر استفاده می‌کنند. شما چرا نفر بعدی نباشید؟
                </p>
                <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                    <Link href="/signup">
                        <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-full shadow-[0_0_40px_-5px_rgba(255,165,0,0.4)] hover:shadow-[0_0_60px_-5px_rgba(255,165,0,0.6)] hover:scale-105 transition-all bg-white text-slate-900 hover:bg-slate-100 w-full sm:w-auto">
                        شروع رایگان
                        <ArrowLeft className="mr-2 h-6 w-6" />
                        </Button>
                    </Link>
                    <Link href="/contact">
                         <Button variant="outline" size="lg" className="h-16 px-10 text-xl font-bold rounded-full border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
                            مشاوره رایگان
                         </Button>
                    </Link>
                </div>
                
                <p className="mt-8 text-sm text-slate-500">
                    بدون نیاز به کارت اعتباری • لغو در هر زمان
                </p>
             </div>
          </section>
      </main>

      <Footer />
    </div>
  );
}
