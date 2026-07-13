"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Presentation, Calendar, Video, DollarSign,
  Settings, User, HelpCircle, BarChart3, Lightbulb,
  Headphones, RefreshCw, ImageIcon, Shield, UtensilsCrossed,
  Activity, Package, Wallet, ShoppingCart, Megaphone, Star, Calculator, LucideIcon,
  Waves, Receipt, Gift, Ticket, CalendarCheck, FileText, Target, Share2, Users, Heart,
  FlaskConical,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useProject } from "@/contexts/project-context";
import { cn } from "@/lib/utils";

interface MoreRoute {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface MobileMoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMoreSheet({ open, onOpenChange }: MobileMoreSheetProps) {
  const pathname = usePathname();
  const { activeProject: plan } = useProject();

  const isStartup = plan?.projectType === "startup";
  const isTraditional = plan?.projectType === "traditional";
  const isCreator = plan?.projectType === "creator";

  const projectRoutes: MoreRoute[] = [
    ...(isStartup ? [
      { icon: Presentation, label: "پیچ‌دک", href: "/dashboard/pitch-deck" },
      { icon: FlaskConical, label: "اعتبارسنجی ایده", href: "/dashboard/validation" },
      { icon: Target, label: "تحلیل رقبا", href: "/dashboard/competitors" },
    ] : []),
    ...(isTraditional ? [
      { icon: Target, label: "تحلیل رقبا", href: "/dashboard/competitors" },
      { icon: Activity, label: "سلامت کسب‌وکار", href: "/dashboard/health" },
      { icon: Wallet, label: "سود و زیان", href: "/dashboard/finance" },
      { icon: Waves, label: "جریان نقدی", href: "/dashboard/cashflow" },
      { icon: Receipt, label: "هزینه‌ها", href: "/dashboard/expenses" },
      { icon: Receipt, label: "برآورد مالیات", href: "/dashboard/tax" },
      { icon: Package, label: "موجودی و انبار", href: "/dashboard/inventory" },
      { icon: ShoppingCart, label: "صندوق فروش", href: "/dashboard/sales" },
      { icon: Users, label: "کارکنان و شیفت", href: "/dashboard/staff" },
      { icon: Heart, label: "باشگاه مشتریان", href: "/dashboard/loyalty" },
      { icon: Megaphone, label: "تخفیف و کمپین", href: "/dashboard/promotions" },
      { icon: Share2, label: "پیام گروهی", href: "/dashboard/broadcast" },
      { icon: Gift, label: "معرفی دوستان", href: "/dashboard/referral" },
      { icon: Ticket, label: "کوپن و QR", href: "/dashboard/coupons" },
      { icon: CalendarCheck, label: "نوبت‌دهی", href: "/dashboard/appointments" },
      { icon: Star, label: "نظرات مشتریان", href: "/dashboard/reviews" },
      { icon: Calculator, label: "قیمت‌گذاری", href: "/dashboard/pricing" },
      { icon: FileText, label: "مرور ماهانه", href: "/dashboard/monthly-review" },
      { icon: Target, label: "اهداف KPI", href: "/dashboard/goals" },
    ] : []),
    ...(isCreator ? [
      { icon: Calendar, label: "تقویم محتوا", href: "/dashboard/content-calendar" },
      { icon: Video, label: "اسکریپت‌نویسی", href: "/dashboard/scripts" },
      { icon: DollarSign, label: "تعرفه اسپانسری", href: "/dashboard/sponsor-rates" },
    ] : []),
    ...(isTraditional ? [{ icon: UtensilsCrossed, label: "منوی دیجیتال", href: "/dashboard/menu" }] : []),
  ];

  const generalRoutes: MoreRoute[] = [
    { icon: BarChart3, label: "آنالیتیکس", href: "/dashboard/analytics" },
    { icon: Lightbulb, label: "ایده‌ها", href: "/dashboard/ideas" },
    { icon: ImageIcon, label: "مدیاکیت", href: "/dashboard/media-kit" },
    { icon: RefreshCw, label: "توزیع محتوا", href: "/dashboard/repurpose" },
    { icon: Headphones, label: "پشتیبانی", href: "/dashboard/support" },
    { icon: HelpCircle, label: "راهنما", href: "/dashboard/help" },
    { icon: User, label: "پروفایل", href: "/dashboard/profile" },
    { icon: Settings, label: "تنظیمات", href: "/dashboard/settings" },
    { icon: Shield, label: "مدیریت", href: "/dashboard/admin" },
  ];

  const renderLink = (route: MoreRoute) => {
    const isActive = pathname === route.href || pathname.startsWith(route.href + "/");
    return (
      <Link
        key={route.href}
        href={route.href}
        onClick={() => onOpenChange(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
          isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/80 text-foreground"
        )}
      >
        <route.icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
        <span className="font-medium text-sm">{route.label}</span>
      </Link>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[75dvh] rounded-t-2xl p-0">
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
          <SheetTitle>منوی بیشتر</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto px-2 py-3 safe-bottom space-y-4">
          {projectRoutes.length > 0 && (
            <div>
              <p className="px-4 text-xs font-bold text-muted-foreground mb-2">ابزارهای پروژه</p>
              <div className="space-y-1">{projectRoutes.map(renderLink)}</div>
            </div>
          )}
          <div>
            <p className="px-4 text-xs font-bold text-muted-foreground mb-2">سایر بخش‌ها</p>
            <div className="space-y-1">{generalRoutes.map(renderLink)}</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
