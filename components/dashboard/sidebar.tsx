"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LayoutGrid,
  Palette,
  Map,
  Settings,
  Hexagon,
  Megaphone,
  ImageIcon
} from "lucide-react";

const sidebarLinks = [
  {
    title: "مرور کلی",
    href: "/dashboard/overview",
    icon: LayoutDashboard,
  },
  {
    title: "بوم کسب‌وکار",
    href: "/dashboard/canvas",
    icon: LayoutGrid,
  },
  {
    title: "هویت بصری",
    href: "/dashboard/brand",
    icon: Palette,
  },
  {
    title: "نقشه راه",
    href: "/dashboard/roadmap",
    icon: Map,
  },
  {
    title: "بازاریابی",
    href: "/dashboard/marketing",
    icon: Megaphone,
  },
  {
    title: "کتابخانه رسانه",
    href: "/dashboard/library",
    icon: ImageIcon,
  },
  {
    title: "تنظیمات",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-l bg-card pb-4">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
           <Hexagon className="h-6 w-6 text-primary fill-primary/10" />
           <span className="text-lg font-bold tracking-tight text-primary">Karnex</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive
                    ? "bg-muted text-primary font-bold"
                    : "text-muted-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
          <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground text-center">
                  نسخه آزمایشی ۱.۰.۰
              </p>
          </div>
      </div>
    </div>
  );
}
