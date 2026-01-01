"use client";

import { Card, CardIcon } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { VariantProps } from "class-variance-authority";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  variant?: "default" | "primary" | "secondary" | "accent" | "muted" | "glass" | "gradient";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  trendLabel?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = "default",
  trend,
  trendValue,
  trendLabel
}: StatsCardProps) {
  // Map specific stats variants to generic card variants
  const cardVariant = (variant === 'primary' || variant === 'secondary' || variant === 'accent') 
    ? 'default' 
    : variant;

  return (
    <Card variant={cardVariant as any} hover="lift" className="relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <CardIcon variant={(variant === 'glass' || variant === 'gradient' || variant === 'default') ? 'primary' : variant as any} className="w-12 h-12 rounded-xl">
          <Icon size={24} />
        </CardIcon>
        
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === "up" ? "bg-emerald-50 text-emerald-600" :
            trend === "down" ? "bg-rose-50 text-rose-600" :
            "bg-gray-50 text-gray-600"
          }`}>
            {trend === "up" && <ArrowUp size={12} />}
            {trend === "down" && <ArrowDown size={12} />}
            {trend === "neutral" && <Minus size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-3xl font-black text-foreground mb-1">{value}</h3>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        
        {trendLabel && (
          <p className="text-xs text-muted-foreground/60 mt-2">
            {trendLabel}
          </p>
        )}
      </div>

      {/* Decorative background element */}
      <Icon className="absolute -bottom-4 -right-4 w-24 h-24 opacity-[0.03] text-foreground rotate-12" />
    </Card>
  );
}
