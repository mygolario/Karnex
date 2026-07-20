"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { 
  Menu, 
  X, 
  Crown,
  ArrowLeft,
  HeadphonesIcon,
  Sparkles,
  Rocket,
  Smartphone,
  BookOpen,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 start-0 end-0 z-50 transition-all duration-500",
        scrolled
          ? "py-2"
          : "py-4"
      )}
    >
      {/* Glassmorphism background */}
      <div className={cn(
        "absolute inset-0 transition-all duration-500",
        scrolled ? "bg-background/70 backdrop-blur-2xl border-b border-border/40 shadow-lg shadow-black/5" : ""
      )} />
      
      <div className="container relative z-10 px-4 md:px-6">
        <nav className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div 
              className="relative transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2"
            >
              <Image 
                src="/logo.png" 
                alt="کارنکس" 
                width={44} 
                height={44} 
                sizes="44px"
                className="rounded-xl shadow-lg shadow-primary/20"
                priority
              />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-foreground tracking-tight leading-none">
                کارنکس
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                هم‌بنیان‌گذار هوشمند
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center bg-muted/50 rounded-2xl p-1.5 border border-border/50">
              
              <Link
                href="/#how-it-works"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                چطور کار می‌کند
              </Link>

              {/* Features */}
              <Link
                href="/#showcase"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                امکانات
              </Link>

              {/* Pricing */}
              <Link
                href="/#pricing"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                <Crown size={14} />
                تعرفه‌ها
              </Link>

              {/* Mobile App */}
              <Link
                href="/mobile-app"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-all"
              >
                <Smartphone size={14} />
                نسخه موبایل
              </Link>

              {/* FAQ */}
              <Link
                href="/#faq"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                سوالات
              </Link>

              <Link
                href="/help"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                راهنما
              </Link>

              <Link
                href="/about"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                درباره ما
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                <HeadphonesIcon size={14} />
                پشتیبانی
              </Link>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            
            {user ? (
              <Link href="/dashboard/overview">
                <Button className="gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all">
                  داشبورد
                  <ArrowLeft size={14} />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-xl font-medium">
                    ورود
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all font-bold">
                    <Sparkles size={14} />
                    شروع رایگان
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl"
              aria-label={mobileMenuOpen ? "بستن منو" : "باز کردن منو"}
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <X 
                  size={20} 
                  className={cn(
                    "absolute transition-all duration-300 transform",
                    mobileMenuOpen ? "rotate-0 opacity-100 scale-100" : "rotate-90 opacity-0 scale-50"
                  )} 
                />
                <Menu 
                  size={20} 
                  className={cn(
                    "absolute transition-all duration-300 transform",
                    mobileMenuOpen ? "-rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"
                  )} 
                />
              </div>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden grid transition-all duration-300 ease-in-out mt-4",
            mobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
          )}
        >
          <div className="overflow-hidden">
            <div className="bg-card/95 backdrop-blur-2xl border border-border rounded-2xl p-4 shadow-2xl">
              
              {/* Quick Links */}
              <div className="mb-4 space-y-1">
                <Link
                  href="/#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Rocket size={18} className="text-startup" />
                  <span className="font-medium text-foreground text-sm">مسیرها</span>
                </Link>
                <Link
                  href="/#showcase"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Sparkles size={18} className="text-primary" />
                  <span className="font-medium text-foreground text-sm">امکانات</span>
                </Link>
                <Link
                  href="/mobile-app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-colors"
                >
                  <Smartphone size={18} className="text-primary" />
                  <span className="font-medium text-foreground text-sm">نسخه موبایل</span>
                </Link>
                <Link
                  href="/#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Crown size={18} className="text-amber-500" />
                  <span className="font-medium text-foreground text-sm">تعرفه‌ها</span>
                </Link>
                <Link
                  href="/#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <HeadphonesIcon size={18} className="text-muted-foreground" />
                  <span className="font-medium text-foreground text-sm">سوالات متداول</span>
                </Link>
                <Link
                  href="/help"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <BookOpen size={18} className="text-muted-foreground" />
                  <span className="font-medium text-foreground text-sm">راهنما</span>
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Info size={18} className="text-muted-foreground" />
                  <span className="font-medium text-foreground text-sm">درباره ما</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <HeadphonesIcon size={18} className="text-muted-foreground" />
                  <span className="font-medium text-foreground text-sm">پشتیبانی</span>
                </Link>
              </div>

              {/* Auth */}
              <div className="border-t border-border pt-4 space-y-2">
                {user ? (
                  <Link href="/dashboard/overview">
                    <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary text-white" size="lg">
                      داشبورد من
                      <ArrowLeft size={16} />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup" className="block">
                      <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary text-white" size="lg">
                        <Sparkles size={16} />
                        شروع رایگان
                      </Button>
                    </Link>
                    <Link href="/login" className="block">
                      <Button variant="outline" className="w-full rounded-xl" size="lg">
                        ورود به حساب
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
