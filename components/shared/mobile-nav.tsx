"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Map,
  Target,
  Bot,
  MoreHorizontal,
  Plus,
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutGrid, label: "پیشخوان", href: "/dashboard/overview" },
  { icon: Map, label: "نقشه راه", href: "/dashboard/roadmap" },
  { icon: Target, label: "بوم", href: "/dashboard/canvas" },
  { icon: Bot, label: "دستیار", href: "/dashboard/copilot" },
];

/**
 * Mobile Bottom Navigation (legacy export — primary shell uses MobileDashboardShell)
 */
export function MobileBottomNav({ onMoreClick }: { onMoreClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 start-0 end-0 z-40",
        "border-t border-border bg-card/95 backdrop-blur-lg",
        "md:hidden",
        "safe-bottom"
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/overview" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[56px] min-h-[44px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon
                size={22}
                className={cn("transition-transform", isActive && "scale-110")}
              />
              <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-12 h-1 rounded-b-full bg-primary" />
              )}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMoreClick}
          className="relative flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[56px] min-h-[44px] text-muted-foreground"
        >
          <MoreHorizontal size={22} />
          <span className="text-[10px] font-medium">بیشتر</span>
        </button>
      </div>
    </nav>
  );
}

export function MobileHeader({
  title,
  subtitle,
  actions,
}: {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30",
        "flex items-center justify-between",
        "h-14 px-4 safe-top",
        "bg-background/95 backdrop-blur-sm border-b border-border",
        "md:hidden"
      )}
    >
      <div className="flex-1 min-w-0">
        {title && <h1 className="font-bold text-foreground truncate">{title}</h1>}
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

export function PullToRefresh({
  children,
}: {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}) {
  return <div className="relative">{children}</div>;
}

export function FloatingActionButton({
  onClick,
  href,
  icon: Icon = Plus,
  className,
}: {
  onClick?: () => void;
  href?: string;
  icon?: React.ElementType;
  label?: string;
  className?: string;
}) {
  const content = (
    <div
      className={cn(
        "fixed bottom-20 start-4 z-30",
        "w-14 h-14 rounded-full",
        "bg-primary text-white shadow-lg shadow-primary/30",
        "flex items-center justify-center",
        "transition-transform active:scale-95",
        "md:hidden mobile-touch-target safe-bottom",
        className
      )}
    >
      <Icon size={24} />
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return <button type="button" onClick={onClick}>{content}</button>;
}
