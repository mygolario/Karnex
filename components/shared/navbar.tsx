"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  Crown,
  ArrowLeft,
  HeadphonesIcon,
  Sparkles,
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
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
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="relative"
            >
              <Image 
                src="/logo.png" 
                alt="کارنکس" 
                width={44} 
                height={44} 
                className="rounded-xl shadow-lg shadow-primary/20"
                priority
              />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </motion.div>
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
              
              {/* Pricing */}
              <Link
                href="/#pricing"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                <Crown size={14} />
                تعرفه‌ها
              </Link>

              {/* Help */}
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
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden mt-4"
            >
              <div className="bg-card/95 backdrop-blur-2xl border border-border rounded-2xl p-4 shadow-2xl">
                
                {/* Quick Links */}
                <div className="mb-4 space-y-1">
                  <Link
                    href="/#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <Crown size={18} className="text-amber-500" />
                    <span className="font-medium text-foreground text-sm">تعرفه‌ها</span>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
