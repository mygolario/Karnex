"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Menu, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "ویژگی‌ها", href: "/#features" },
    { label: "قیمت‌ها", href: "/pricing" },
    { label: "ارتباط با ما", href: "/contact" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-border/50 shadow-sm"
          : "bg-transparent py-2"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Image 
              src="/logo-icon-dark.png" 
              alt="Karnex Logo" 
              width={40} 
              height={40} 
              className="rounded-xl shadow-lg dark:invert-0 invert group-hover:scale-105 transition-transform"
            />
          </div>
          <span className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
            کارنکس
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative hover:text-primary",
                  isActive ? "text-primary font-bold" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard/overview">
              <Button variant="default" className="rounded-full px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105">
                داشبورد
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground">ورود</Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-full px-5 font-bold bg-foreground text-background hover:bg-foreground/90 transition-all">
                  شروع کنید
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 top-[64px] bg-background/95 backdrop-blur-xl border-b border-border transition-all duration-300 ease-out origin-top",
          mobileMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="p-4 space-y-4 container">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block p-4 rounded-xl text-base font-medium transition-colors hover:bg-muted",
                pathname === link.href ? "bg-primary/10 text-primary" : "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-border my-4" />
          {user ? (
            <Link href="/dashboard/overview" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full rounded-xl py-6 text-lg">
                داشبورد من
              </Button>
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl py-6">
                  ورود
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-xl py-6">
                  ثبت‌نام
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
