"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Instagram, Youtube, Twitter, Linkedin } from "lucide-react";

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/karnex.ir", label: "اینستاگرام" },
  { icon: Youtube, href: "https://youtube.com/@karnex", label: "یوتیوب" },
  { icon: Twitter, href: "https://twitter.com/karnex_ir", label: "توییتر" },
  { icon: Linkedin, href: "https://linkedin.com/company/karnex", label: "لینکدین" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "مسیرها", href: "/#pillars" },
      { label: "امکانات", href: "/#features" },
      { label: "نسخه موبایل", href: "/mobile-app" },
      { label: "نحوه کار", href: "/#how-it-works" },
      { label: "تعرفه‌ها", href: "/#pricing" },
      { label: "سوالات متداول", href: "/#faq" },
    ],
    company: [
      { label: "ارتباط با ما", href: "/contact" },
      { label: "قوانین استفاده", href: "/terms" },
      { label: "حریم خصوصی", href: "/privacy" },
    ],
    support: [
      { label: "پشتیبانی", href: "/contact#support" },
      { label: "راهنمای شروع", href: "/#how-it-works" },
      { label: "تماس با فروش", href: "/contact?subject=اشتراک اولترا" },
    ],
  };

  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 start-0 end-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Background glow */}
      <div className="absolute bottom-0 start-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[150px]" />

      <div className="container px-4 md:px-6 py-16 relative z-10">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
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

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary/20 hover:border-primary/30 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
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

        {/* Enamad and Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Enamad */}
          <div className="flex items-center justify-center bg-white rounded-lg p-2 max-w-[150px] mb-4 md:mb-0">
            <a
              referrerPolicy='origin'
              target='_blank'
              href='https://trustseal.enamad.ir/?id=696845&Code=LOT5lQWpVVtKYHVJ1HCddyi9y8VA2MT4'
              className="flex items-center justify-center w-full h-full min-w-[80px] min-h-[80px]"
            >
              <img
                referrerPolicy='origin'
                src='https://trustseal.enamad.ir/logo.aspx?id=696845&Code=LOT5lQWpVVtKYHVJ1HCddyi9y8VA2MT4'
                alt='نماد اعتماد الکترونیکی'
                style={{ cursor: 'pointer' }}
                className="w-auto h-auto"
                {...{ code: 'LOT5lQWpVVtKYHVJ1HCddyi9y8VA2MT4' } as Record<string, string>}
              />
            </a>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-sm w-full md:w-auto justify-between md:justify-end">
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
      </div>
    </footer>
  );
}
