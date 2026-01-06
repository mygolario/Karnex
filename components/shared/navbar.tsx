"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { 
  Menu, 
  X, 
  Sparkles, 
  ChevronDown,
  Rocket,
  BarChart3,
  Palette,
  Map,
  Megaphone,
  Crown,
  ArrowLeft,
  Zap,
  Shield,
  HeadphonesIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ElementType;
  description?: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const productFeatures: NavItem[] = [
  { 
    label: "طرح کسب‌وکار", 
    href: "#features", 
    icon: Rocket,
    description: "تولید خودکار بیزینس پلن با AI"
  },
  { 
    label: "هویت برند", 
    href: "#features", 
    icon: Palette,
    description: "رنگ، لوگو و راهنمای برند"
  },
  { 
    label: "نقشه راه اجرا", 
    href: "#features", 
    icon: Map,
    description: "گام به گام تا موفقیت"
  },
  { 
    label: "بازاریابی هوشمند", 
    href: "#features", 
    icon: Megaphone,
    description: "استراتژی و محتوای تبلیغاتی",
    badge: "جدید"
  },
];

const resources: NavItem[] = [
  { 
    label: "راهنمای شروع", 
    href: "/help", 
    icon: Zap,
    description: "آموزش استفاده از پلتفرم"
  },
  { 
    label: "پشتیبانی", 
    href: "/help", 
    icon: HeadphonesIcon,
    description: "پاسخ به سوالات شما"
  },
];

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-14" ref={dropdownRef}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all overflow-hidden",
                "shadow-lg shadow-indigo-500/25",
                "group-hover:shadow-indigo-500/40 group-hover:scale-105"
              )}>
                <Image 
                  src="/logo.png" 
                  alt="کارنکس" 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 object-cover"
                />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-background" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-foreground tracking-tight">
                کارنکس
              </span>
              <Badge 
                variant="outline" 
                className="hidden sm:flex text-[10px] font-bold bg-primary/5 text-primary border-primary/20"
              >
                <Sparkles size={8} className="ml-1" />
                BETA
              </Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("products")}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeDropdown === "products"
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                محصول
                <ChevronDown 
                  size={14} 
                  className={cn(
                    "transition-transform duration-200",
                    activeDropdown === "products" && "rotate-180"
                  )} 
                />
              </button>

              {/* Products Dropdown Menu */}
              <div className={cn(
                "absolute top-full right-0 mt-2 w-80 p-2 rounded-2xl border border-border bg-card shadow-2xl",
                "transition-all duration-200 origin-top-right",
                activeDropdown === "products"
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible"
              )}>
                <div className="p-2 mb-2 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl">
                  <p className="text-xs font-medium text-primary mb-1">دستیار هوشمند کارآفرینی</p>
                  <p className="text-xs text-muted-foreground">ایده‌ات رو به کسب‌وکار واقعی تبدیل کن</p>
                </div>
                {productFeatures.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    {item.icon && (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <item.icon size={18} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-none">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Pricing Link */}
            <Link
              href="/pricing"
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                pathname === "/pricing"
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Crown size={14} />
              تعرفه‌ها
            </Link>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("resources")}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeDropdown === "resources"
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                منابع
                <ChevronDown 
                  size={14} 
                  className={cn(
                    "transition-transform duration-200",
                    activeDropdown === "resources" && "rotate-180"
                  )} 
                />
              </button>

              {/* Resources Dropdown Menu */}
              <div className={cn(
                "absolute top-full right-0 mt-2 w-64 p-2 rounded-2xl border border-border bg-card shadow-2xl",
                "transition-all duration-200 origin-top-right",
                activeDropdown === "resources"
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible"
              )}>
                {resources.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    {item.icon && (
                      <div className="w-9 h-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <item.icon size={16} />
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-foreground text-sm">{item.label}</span>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            
            {user ? (
              <Link href="/dashboard/overview">
                <Button variant="default" size="sm" className="gap-2">
                  داشبورد
                  <ArrowLeft size={14} />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">ورود</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="gradient" size="sm" className="gap-2 shadow-lg shadow-primary/20">
                    <Sparkles size={14} />
                    شروع رایگان
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="relative"
            >
              <div className="relative w-5 h-5">
                <span className={cn(
                  "absolute left-0 w-5 h-0.5 bg-current transition-all duration-300",
                  mobileMenuOpen ? "top-2.5 rotate-45" : "top-1"
                )} />
                <span className={cn(
                  "absolute left-0 top-2.5 w-5 h-0.5 bg-current transition-all duration-300",
                  mobileMenuOpen ? "opacity-0" : "opacity-100"
                )} />
                <span className={cn(
                  "absolute left-0 w-5 h-0.5 bg-current transition-all duration-300",
                  mobileMenuOpen ? "top-2.5 -rotate-45" : "top-4"
                )} />
              </div>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-out",
            mobileMenuOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
          )}
        >
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
            {/* Product Features */}
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 px-2">محصول</p>
              <div className="space-y-1">
                {productFeatures.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    {item.icon && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <item.icon size={16} />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-[10px]">{item.badge}</Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="border-t border-border pt-4 mb-4">
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Crown size={18} className="text-amber-500" />
                <span className="font-medium text-foreground text-sm">تعرفه‌ها</span>
              </Link>
              {resources.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  {item.icon && <item.icon size={18} className="text-muted-foreground" />}
                  <span className="font-medium text-foreground text-sm">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Auth Actions */}
            <div className="border-t border-border pt-4 space-y-2">
              {user ? (
                <Link href="/dashboard/overview">
                  <Button variant="gradient" className="w-full" size="lg">
                    داشبورد من
                    <ArrowLeft size={16} />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="block">
                    <Button variant="gradient" className="w-full" size="lg">
                      <Sparkles size={16} />
                      شروع رایگان
                    </Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      ورود به حساب
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
