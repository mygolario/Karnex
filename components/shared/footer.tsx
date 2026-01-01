import Link from "next/link";
import Image from "next/image";
import { Heart, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "ویژگی‌ها", href: "#features" },
      { label: "قیمت‌ها", href: "#pricing" },
      { label: "نقشه راه", href: "#roadmap" },
    ],
    company: [
      { label: "درباره ما", href: "/about" },
      { label: "تماس با ما", href: "/contact" },
      { label: "وبلاگ", href: "/blog" },
    ],
    legal: [
      { label: "حریم خصوصی", href: "/privacy" },
      { label: "شرایط استفاده", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-muted/30 border-t border-border">
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
                کارنکس
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              دستیار هوشمند کارآفرینی که ایده شما را به یک کسب‌وکار واقعی تبدیل می‌کند.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={14} />
              <span>تهران، ایران</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4">محصول</h3>
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
            <h3 className="font-bold text-foreground mb-4">شرکت</h3>
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
            <h3 className="font-bold text-foreground mb-4">خبرنامه</h3>
            <p className="text-sm text-muted-foreground mb-4">
              از آخرین اخبار و آپدیت‌ها باخبر شوید
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="ایمیل شما"
                className="input-premium flex-1 text-sm"
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
              © {currentYear} کارنکس. ساخته شده با
              <Heart size={14} className="text-red-500 fill-red-500" />
              در ایران
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
