import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/90 hover:shadow-lg hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg",
        outline:
          "border-2 border-border bg-background hover:bg-muted hover:border-primary/50 text-foreground",
        ghost:
          "hover:bg-muted text-muted-foreground hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0",
        glass:
          "glass text-foreground hover:bg-white/80 dark:hover:bg-white/10 shadow-lg backdrop-blur-md",
        accent:
          "bg-accent text-accent-foreground shadow-md hover:bg-accent/90 hover:shadow-lg",
        // NEW PREMIUM VARIANTS
        shimmer:
          "relative overflow-hidden bg-primary text-primary-foreground shadow-lg before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700 hover:shadow-xl",
        glow:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 animate-glow-pulse hover:-translate-y-0.5",
        "3d":
          "bg-primary text-primary-foreground shadow-[0_4px_0_0] shadow-primary/50 hover:shadow-[0_2px_0_0] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all duration-100",
        soft:
          "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      rounded: {
        default: "rounded-xl",
        full: "rounded-full",
        md: "rounded-md",
        lg: "rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            <span>در حال پردازش...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="icon-start">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="icon-end">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
