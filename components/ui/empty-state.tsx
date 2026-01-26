"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "gradient" | "outline";
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeStyles = {
    sm: {
      container: "py-8",
      iconWrapper: "w-12 h-12",
      icon: 24,
      title: "text-lg",
      description: "text-sm",
    },
    md: {
      container: "py-12",
      iconWrapper: "w-16 h-16",
      icon: 32,
      title: "text-xl",
      description: "text-base",
    },
    lg: {
      container: "py-16",
      iconWrapper: "w-20 h-20",
      icon: 40,
      title: "text-2xl",
      description: "text-lg",
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        styles.container,
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground mb-4",
          styles.iconWrapper
        )}
      >
        <Icon size={styles.icon} className="opacity-50" />
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-bold text-foreground mb-2",
          styles.title
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "text-muted-foreground max-w-sm mb-6",
            styles.description
          )}
        >
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          size={size === "lg" ? "lg" : "default"}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Specialized empty states for common use cases
export function NoDataEmptyState({
  onAction,
  actionLabel = "شروع کنید",
}: {
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <EmptyState
      title="هنوز داده‌ای وجود ندارد"
      description="اطلاعاتی برای نمایش وجود ندارد. با اضافه کردن داده جدید شروع کنید."
      action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
    />
  );
}

export function SearchEmptyState({ query }: { query?: string }) {
  return (
    <EmptyState
      title="نتیجه‌ای یافت نشد"
      description={
        query
          ? `هیچ نتیجه‌ای برای "${query}" پیدا نشد. عبارت دیگری را امتحان کنید.`
          : "هیچ نتیجه‌ای پیدا نشد."
      }
      size="sm"
    />
  );
}

export function ErrorEmptyState({
  onRetryAction,
  message,
}: {
  onRetryAction?: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      title="خطایی رخ داد"
      description={message || "مشکلی در بارگذاری اطلاعات پیش آمد."}
      action={onRetryAction ? { label: "تلاش مجدد", onClick: onRetryAction, variant: "outline" } : undefined}
    />
  );
}
