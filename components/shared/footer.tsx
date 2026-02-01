import Link from "next/link";
import Image from "next/image";
import { Heart, Mail, MapPin, Linkedin, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "ویژگی‌ها", href: "/#features" },
      { label: "قیمت‌گذاری", href: "/pricing" },
      { label: "شروع رایگان", href: "/signup" },
    ],
    company: [
      { label: "ارتباط با ما", href: "/contact" },
      { label: "قوانین و مقررات", href: "/terms" },
      { label: "حریم خصوصی", href: "/privacy" },
    ],
  };

  return (
    <footer className="relative bg-background border-t border-border overflow-hidden pt-20 pb-10">
       <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />

      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <Image 
                src="/logo-icon-dark.png" 
                alt="Karnex Logo" 
                width={48} 
                height={48} 
                className="rounded-xl shadow-lg dark:invert-0 invert"
              />
              <span className="text-2xl font-black text-foreground tracking-tight">
                کارنکس
              </span>
            </Link>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-sm">
              هم‌بنیان‌گذار هوشمند برای استارتاپ‌ها، کسب‌وکارها و کریتورها. با قدرت هوش مصنوعی، مسیر موفقیت خود را هموار کنید.
            </p>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary rounded-full">
                    <Linkedin size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary rounded-full">
                    <Twitter size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary rounded-full">
                    <Instagram size={20} />
                </Button>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-foreground mb-6">محصول</h3>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-bold text-foreground mb-6">شرکت</h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Newsletter */}
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-8">
             {/* Enamad */}
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
               <a referrerPolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=5451592&Code=LOT5lQWpVVtKYHVJ1HCddyi9y8VA2MT4'>
                 <img 
                   referrerPolicy='origin' 
                   src='https://trustseal.enamad.ir/logo.aspx?id=5451592&Code=LOT5lQWpVVtKYHVJ1HCddyi9y8VA2MT4' 
                   alt='نماد اعتماد الکترونیکی' 
                   className="cursor-pointer w-24 h-auto"
                   data-code='LOT5lQWpVVtKYHVJ1HCddyi9y8VA2MT4'
                 />
               </a>
             </div>
             
             <div className="bg-muted/30 p-6 rounded-2xl w-full">
                <p className="text-sm font-bold mb-2">عضویت در خبرنامه</p>
                <form className="flex gap-2">
                    <input
                        type="email"
                        placeholder="ایمیل شما..."
                        className="flex-1 bg-background border border-border rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Button size="icon" className="rounded-xl shrink-0">
                        <Mail size={16} />
                    </Button>
                </form>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} تمامی حقوق برای <span className="font-bold text-foreground">کارنکس</span> محفوظ است.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>ساخته شده با</span>
            <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />
            <span>در ایران</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
