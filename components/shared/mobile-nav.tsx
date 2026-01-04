"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Map, 
  Palette, 
  LayoutGrid, 
  Megaphone,
  Settings,
  Plus
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "داشبورد", href: "/dashboard/overview" },
  { icon: Map, label: "نقشه راه", href: "/dashboard/roadmap" },
  { icon: LayoutGrid, label: "بوم", href: "/dashboard/canvas" },
  { icon: Megaphone, label: "بازاریابی", href: "/dashboard/marketing" },
  { icon: Settings, label: "تنظیمات", href: "/dashboard/settings" },
];

/**
 * Mobile Bottom Navigation
 * Fixed bottom navigation bar for mobile devices
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "border-t border-border bg-card/95 backdrop-blur-lg",
        "md:hidden", // Only show on mobile
        "safe-bottom" // iOS safe area
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard/overview" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all",
                "min-w-[56px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon 
                size={22} 
                className={cn(
                  "transition-transform",
                  isActive && "scale-110"
                )} 
              />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-bold"
              )}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 w-12 h-1 rounded-b-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Mobile Header Component
 * Sticky header for mobile with project name and actions
 */
interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export function MobileHeader({ title, subtitle, showBack, actions }: MobileHeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-30",
      "flex items-center justify-between",
      "h-14 px-4",
      "bg-background/95 backdrop-blur-sm border-b border-border",
      "md:hidden"
    )}>
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="font-bold text-foreground truncate">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}

/**
 * Pull to Refresh Indicator
 * Shows a loading indicator when pulling down to refresh
 */
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  // Note: Full implementation would require touch event handlers
  // This is a placeholder component structure
  return (
    <div className="relative">
      {children}
    </div>
  );
}

/**
 * Floating Action Button
 * Used for primary actions on mobile
 */
interface FABProps {
  onClick?: () => void;
  href?: string;
  icon?: React.ElementType;
  label?: string;
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  href, 
  icon: Icon = Plus,
  label,
  className 
}: FABProps) {
  const content = (
    <div className={cn(
      "fixed bottom-20 left-4 z-30", // Above bottom nav
      "w-14 h-14 rounded-full",
      "bg-primary text-white shadow-lg shadow-primary/30",
      "flex items-center justify-center",
      "transition-transform active:scale-95",
      "md:hidden", // Only show on mobile
      className
    )}>
      <Icon size={24} />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button onClick={onClick}>{content}</button>;
}
