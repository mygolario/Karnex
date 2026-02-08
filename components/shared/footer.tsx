"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Mail, Linkedin, Twitter, Instagram, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "ویژگی‌ها", href: "/#features" },
      { label: "قیمت‌گذاری", href: "/#pricing" },
      { label: "نحوه کار", href: "/#how-it-works" },
      { label: "سوالات متداول", href: "/#faq" },
    ],
    solutions: [
      { label: "استارتاپ‌ها", href: "/solutions/startup" },
      { label: "کسب‌وکار سنتی", href: "/solutions/traditional" },
      { label: "کریتورها", href: "/solutions/creator" },
    ],
    company: [
      { label: "درباره ما", href: "/about" },
      { label: "ارتباط با ما", href: "/contact" },
      { label: "قوانین استفاده", href: "/terms" },
      { label: "حریم خصوصی", href: "/privacy" },
    ],
    support: [
      { label: "مرکز راهنما", href: "/help" },
      { label: "پشتیبانی", href: "/contact#support" },
      { label: "گزارش باگ", href: "/contact#bug-report" },
    ],
  };

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[150px]" />
      
      <div className="container px-4 md:px-6 py-20 relative z-10">
        {/* Top section - CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-300">ایده با تو، مسیرش با کارنکس</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            آماده شروع هستی؟
          </h2>
          <Link href="/signup">
            <Button className="h-14 px-8 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold shadow-lg shadow-primary/25">
              شروع رایگان
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
        
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image 
                src="/logo.png" 
                alt="کارنکس" 
                width={48} 
                height={48} 
                className="rounded-xl"
              />
              <div>
                <span className="text-xl font-black block">کارنکس</span>
                <span className="text-xs text-gray-500">هم‌بنیان‌گذار هوشمند</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              دستیار هوشمند کارآفرینان. از ایده تا درآمد، ما کنارتونیم.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10">
                <Linkedin size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10">
                <Twitter size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10">
                <Instagram size={16} />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm">محصول</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm">راهکارها</h3>
            <ul className="space-y-3">
              {footerLinks.solutions.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm">شرکت</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm">پشتیبانی</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Newsletter + Enamad */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 pb-12 border-b border-white/10">
          {/* Newsletter */}
          <div className="flex-1 max-w-md">
            <h3 className="font-bold text-white mb-3 text-sm">عضویت در خبرنامه</h3>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="ایمیل شما..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-gray-500"
              />
              <Button size="icon" className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-secondary shrink-0">
                <Mail size={18} />
              </Button>
            </form>
          </div>
          
          {/* Enamad */}
          <div className="flex items-center justify-center bg-white rounded-lg p-2 max-w-[150px]">
            <a 
              referrerPolicy='origin' 
              target='_blank' 
              href='https://trustseal.enamad.ir/?id=696845&Code=LOT5lQWpVVtKYHVJ1HCddyi9y8VA2MT4'
            >
              <img 
                referrerPolicy='origin' 
                src='https://trustseal.enamad.ir/logo.aspx?id=696845&Code=LOT5lQWpVVtKYHVJ1HCddyi9y8VA2MT4' 
                alt='' 
                style={{ cursor: 'pointer' }}
                {...{ code: 'LOT5lQWpVVtKYHVJ1HCddyi9y8VA2MT4' } as any}
              />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-500">
            © {currentYear} تمامی حقوق برای <span className="text-white font-medium">کارنکس</span> محفوظ است.
          </p>
          <div className="flex items-center gap-2 text-gray-500">
            <span>ساخته شده با</span>
            <Heart size={14} className="text-primary fill-primary animate-pulse" />
            <span>در ایران</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
