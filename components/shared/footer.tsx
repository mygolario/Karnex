"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-translations";
import { useTranslations } from "next-intl";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations();
  const { locale, isRTL } = useLocale();

  const footerLinks = {
    product: [
      { label: t('nav.features'), href: "#features" },
      { label: t('nav.howItWorks'), href: "#how-it-works" },
      { label: t('nav.pricing'), href: "#pricing" },
    ],
    company: [
      { label: t('footer.about'), href: "/about" },
      { label: t('footer.contact'), href: "/contact" },
      { label: t('footer.blog'), href: "/blog" },
    ],
    legal: [
      { label: t('footer.privacy'), href: "/privacy" },
      { label: t('footer.terms'), href: "/terms" },
    ],
  };

  const labels = {
    brandName: locale === 'fa' ? 'کارنکس' : 'Karnex',
    tagline: t('footer.tagline'),
    location: locale === 'fa' ? 'تهران، ایران' : 'Tehran, Iran',
    product: t('footer.product'),
    company: t('footer.company'),
    newsletter: locale === 'fa' ? 'خبرنامه' : 'Newsletter',
    newsletterDesc: locale === 'fa' ? 'از آخرین اخبار و آپدیت‌ها باخبر شوید' : 'Get the latest news and updates',
    emailPlaceholder: locale === 'fa' ? 'ایمیل شما' : 'Your email',
    madeWith: locale === 'fa' ? 'ساخته شده با' : 'Made with',
    inIran: locale === 'fa' ? 'در ایران' : 'in Iran',
  };

  return (
    <footer className="bg-muted/30 border-t border-border" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Footer */}
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image 
                src="/logo-icon-dark.png" 
                alt="Karnex Logo" 
                width={40} 
                height={40} 
                className="rounded-xl shadow-lg dark:invert-0 invert"
              />
              <span className="text-xl font-black text-foreground tracking-tight">
                {labels.brandName}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {labels.tagline}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={14} />
              <span>{labels.location}</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4">{labels.product}</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4">{labels.company}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-foreground mb-4">{labels.newsletter}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {labels.newsletterDesc}
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={labels.emailPlaceholder}
                className="input-premium flex-1 text-sm"
                dir="ltr"
              />
              <Button variant="gradient" size="icon">
                <Mail size={16} />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              © {currentYear} {labels.brandName}. {labels.madeWith}
              <Heart size={14} className="text-red-500 fill-red-500" />
              {labels.inIran}
            </p>
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
