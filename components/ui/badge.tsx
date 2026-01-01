import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary",
        secondary:
          "bg-secondary/10 text-secondary",
        accent:
          "bg-accent/10 text-accent",
        info:
          "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        success:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        warning:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        danger:
          "bg-red-500/10 text-red-600 dark:text-red-400",
        outline:
          "border border-border bg-transparent text-foreground",
        muted:
          "bg-muted text-muted-foreground",
        gradient:
          "bg-gradient-to-r from-primary to-purple-600 text-white",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
      animated: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce-gentle",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animated: "none",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({
  className,
  variant,
  size,
  animated,
  dot,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size, animated }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dotColor || "bg-current"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
