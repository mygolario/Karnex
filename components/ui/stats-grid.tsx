"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
    direction: "up" | "down" | "neutral";
  };
  variant?: "default" | "primary" | "secondary" | "accent" | "glass";
  className?: string;
  footer?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
  footer,
}: StatCardProps) {
  const variantStyles = {
    default: "bg-card border border-border",
    primary: "bg-primary/5 border border-primary/10",
    secondary: "bg-secondary/5 border border-secondary/10",
    accent: "bg-amber-500/5 border border-amber-500/10",
    glass: "bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/20",
  };

  const iconVariantStyles = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-amber-500/10 text-amber-600",
    glass: "bg-white/20 text-foreground",
  };

  const TrendIcon = trend?.direction === "up" 
    ? TrendingUp 
    : trend?.direction === "down" 
      ? TrendingDown 
      : Minus;

  const trendColor = trend?.direction === "up" 
    ? "text-emerald-600" 
    : trend?.direction === "down" 
      ? "text-red-500" 
      : "text-muted-foreground";

  return (
    <div
      className={cn(
        "rounded-2xl p-5 transition-all duration-200 hover:shadow-md",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                iconVariantStyles[variant]
              )}
            >
              <Icon size={20} />
            </div>
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-3xl font-black text-foreground">{value}</div>
        
        {trend && (
          <div className={cn("flex items-center gap-1.5 text-sm", trendColor)}>
            <TrendIcon size={14} />
            <span className="font-medium">
              {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
              {Math.abs(trend.value)}%
            </span>
            {trend.label && (
              <span className="text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}
      </div>

      {footer && <div className="mt-4 pt-4 border-t border-border/50">{footer}</div>}
    </div>
  );
}

// Mini stat for inline display
interface MiniStatProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
}

export function MiniStat({ label, value, icon: Icon, className }: MiniStatProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50",
        className
      )}
    >
      {Icon && <Icon size={14} className="text-muted-foreground" />}
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}
