"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { LucideIcon } from "lucide-react";

/** Section header — replaces the per-page hero banners across account tabs. */
export function AccountSectionHeader({
  title,
  subtitle,
  icon: Icon,
  accent = "primary",
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: "primary" | "violet" | "emerald" | "amber" | "danger";
  action?: React.ReactNode;
}) {
  const accentClasses: Record<string, string> = {
    primary: "from-primary to-brand-secondary",
    violet: "from-violet-500 to-purple-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    danger: "from-red-500 to-rose-600",
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-start gap-4">
        {Icon && (
          <div
            className={cn(
              "w-12 h-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg shrink-0",
              accentClasses[accent]
            )}
          >
            <Icon size={22} />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xl">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** A consistent settings card with optional accent border. */
export function SettingsCard({
  title,
  description,
  icon: Icon,
  accent = "primary",
  className,
  children,
  footer,
  action,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  accent?: "primary" | "violet" | "emerald" | "amber" | "blue" | "danger";
  className?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const borderAccent: Record<string, string> = {
    primary: "border-l-primary",
    violet: "border-l-violet-500",
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
    blue: "border-l-blue-500",
    danger: "border-l-red-500",
  };
  return (
    <Card
      variant="glass"
      className={cn("p-6 border-l-4 relative overflow-hidden", borderAccent[accent], className)}
    >
      {title && (
        <div className="flex items-start gap-3 mb-4">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground shrink-0">
              <Icon size={18} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-lg">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
      {footer && <div className="mt-5 pt-4 border-t border-border/50">{footer}</div>}
    </Card>
  );
}

/** A single settings row with label/description on the left and a control on the right. */
export function SettingsRow({
  label,
  description,
  children,
  divider = true,
}: {
  label: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-6 p-5 transition-colors hover:bg-muted/20", divider && "border-b border-border/40 last:border-b-0")}>
      <div className="min-w-0">
        <div className="font-bold text-foreground text-sm">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Circular usage ring showing used/total. */
export function UsageRing({
  used,
  total,
  label,
  size = 120,
  stroke = 10,
}: {
  used: number;
  total: number | "unlimited";
  label?: string;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const numericTotal = total === "unlimited" ? Math.max(used, 1) : total;
  const pct = numericTotal > 0 ? Math.min(100, (used / numericTotal) * 100) : 0;
  const offset = circumference - (pct / 100) * circumference;
  const danger = pct >= 90;
  const warn = pct >= 75 && pct < 90;

  const ringColor = danger ? "#ef4444" : warn ? "#f59e0b" : "var(--brand-primary)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/30" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-foreground tabular-nums">
          {total === "unlimited" ? "∞" : `${Math.round(pct)}%`}
        </span>
        {label && <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

/** Linear usage bar with used/limit label. */
export function UsageBar({
  used,
  total,
  label,
  showNumbers = true,
}: {
  used: number;
  total: number | "unlimited";
  label?: string;
  showNumbers?: boolean;
}) {
  const numericTotal = total === "unlimited" ? used : total;
  const pct = numericTotal > 0 ? Math.min(100, (used / numericTotal) * 100) : 0;
  const danger = pct >= 90;
  const warn = pct >= 75 && pct < 90;
  const indicator = danger ? "bg-red-500" : warn ? "bg-amber-500" : "bg-primary";

  return (
    <div className="space-y-1.5">
      {(label || showNumbers) && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">{label}</span>
          {showNumbers && (
            <span className="font-bold text-foreground tabular-nums">
              {used}
              {total !== "unlimited" ? ` / ${total}` : ""}
            </span>
          )}
        </div>
      )}
      <Progress value={pct} indicatorClassName={indicator} className="h-2.5" />
    </div>
  );
}

/** Avatar with gradient ring. */
export function ProfileAvatar({
  name,
  src,
  size = 96,
  ring = true,
  className,
}: {
  name?: string;
  src?: string | null;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  const initial = (name?.trim()?.[0] || "U").toUpperCase();
  return (
    <div
      className={cn(
        "relative rounded-[1.75rem] bg-gradient-to-br from-primary to-brand-secondary flex items-center justify-center text-white font-black shadow-xl overflow-hidden",
        ring && "ring-4 ring-background",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name || "avatar"} className="w-full h-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

/** Consistent plan badge including Ultra. */
export function PlanBadge({ planId }: { planId: string }) {
  const map: Record<string, { label: string; variant: "muted" | "info" | "gradient" }> = {
    free: { label: "رایگان", variant: "muted" },
    plus: { label: "پلاس", variant: "info" },
    pro: { label: "پرو", variant: "gradient" },
    ultra: { label: "اولترا", variant: "gradient" },
  };
  const cfg = map[planId] || map.free;
  return (
    <Badge variant={cfg.variant} size="lg" className="font-bold">
      {cfg.label}
    </Badge>
  );
}
