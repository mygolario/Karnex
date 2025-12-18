"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, Rocket, Shield, Zap, CheckCircle2, LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sticky Navbar Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* --- Navbar --- */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Rocket size={20} fill="currentColor" className="text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">کارنکس</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">امکانات</a>
            <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">نحوه کار</a>
            <a href="#pricing" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">قیمت‌گذاری</a>
          </nav>

          {/* Auth Button */}
          <div className="hidden md:block">
            {loading ? (
              <div className="w-24 h-10 bg-slate-100 animate-pulse rounded-full"></div>
            ) : user ? (
              <Link 
                href="/dashboard/overview"
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <LayoutDashboard size={18} />
                داشبورد من
              </Link>
            ) : (
              <Link 
                href="/new-project"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md shadow-blue-200 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                شروع رایگان
                <ArrowLeft size={18} />
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-900 bg-slate-100 p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-2">
            <a href="#features" className="text-slate-600 font-medium py-2">امکانات</a>
            <a href="#how-it-works" className="text-slate-600 font-medium py-2">نحوه کار</a>
            <div className="h-px bg-slate-100 my-2"></div>
            {user ? (
              <Link href="/dashboard/overview" className="bg-slate-900 text-white p-3 rounded-xl text-center font-bold">
                ورو به داشبورد
              </Link>
            ) : (
              <Link href="/new-project" className="bg-blue-600 text-white p-3 rounded-xl text-center font-bold">
                شروع رایگان
              </Link>
            )}
          </div>
        )}
      </header>

      {/* --- Hero Section --- */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            نسخه جدید کارنکس منتشر شد
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            ایده خود را در <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">۳۰ ثانیه</span><br className="hidden md:block"/>
            به یک بیزینس تبدیل کنید
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-100">
            کارنکس با استفاده از هوش مصنوعی، برای ایده شما بوم کسب‌وکار، استراتژی بازاریابی و نقشه راه اجرایی می‌سازد. بدون نیاز به دانش فنی.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-200">
            <Link 
              href="/new-project"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Rocket size={24} />
              ساخت اولین پروژه رایگان
            </Link>
            <a 
              href="#demo"
              className="w-full md:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-lg font-bold px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              مشاهده نمونه خروجی
            </a>
          </div>
        </div>
      </section>

      {/* --- Feature Grid --- */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">ابزار همه کاره برای کارآفرینان</h2>
            <p className="text-slate-500">تمام چیزی که برای شروع نیاز دارید، در یک پلتفرم</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">سرعت باورنکردنی</h3>
              <p className="text-slate-500 leading-7">
                به جای هفته‌ها تحقیق، در کمتر از یک دقیقه یک نقشه راه کامل و جامع دریافت کنید. هوش مصنوعی ما همیشه بیدار است.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">ذخیره امن ابری</h3>
              <p className="text-slate-500 leading-7">
                اطلاعات شما به صورت امن در فضای ابری ذخیره می‌شود و از هر دستگاهی در دسترس است. هرگز پیشرفت خود را گم نکنید.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <LayoutDashboard size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">داشبورد اجرایی</h3>
              <p className="text-slate-500 leading-7">
                فقط یک فایل PDF نیست! یک داشبورد زنده با چک‌لیست‌های اجرایی، بوم مدل کسب‌وکار و ابزارهای بازاریابی.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- How it Works --- */}
      <section id="how-it-works" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 relative">
               <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-20 blur-xl"></div>
               <img 
                 src="https://placehold.co/600x400/2563eb/white?text=Karnex+Dashboard" 
                 alt="Karnex Dashboard Preview" 
                 className="relative rounded-2xl shadow-2xl border border-slate-200"
               />
            </div>
            <div className="md:w-1/2 space-y-8">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                از ایده تا اجرا<br/>
                <span className="text-blue-600">فقط در ۳ مرحله</span>
              </h2>

              <div className="space-y-6">
                {[
                  "نام پروژه و ایده خود را وارد کنید",
                  "هوش مصنوعی بازار را تحلیل و نقشه را می‌سازد",
                  "وارد داشبورد شوید و گام‌به‌گام اجرا کنید"
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-lg font-medium text-slate-700">{step}</span>
                  </div>
                ))}
              </div>

              <Link 
                href="/new-project"
                className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
              >
                امتحان کنید
                <ArrowLeft size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
            
            <h2 className="relative z-10 text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">
              آماده راه‌اندازی استارت‌آپ خود هستید؟
            </h2>
            <p className="relative z-10 text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              به جمع هزاران کارآفرینی بپیوندید که با کارنکس ایده‌های خود را به واقعیت تبدیل کرده‌اند. بدون نیاز به کارت اعتباری.
            </p>
            <Link 
              href="/new-project"
              className="relative z-10 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              شروع کنید - رایگان
              <ArrowLeft size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
            <Rocket size={20} />
            <span className="font-bold text-slate-900">Karnex</span>
          </div>
          <div className="text-slate-400 text-sm">
            © 2024 Karnex Inc. تمامی حقوق محفوظ است.
          </div>
        </div>
      </footer>

    </div>
  );
}
