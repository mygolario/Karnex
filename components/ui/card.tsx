import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "bg-card text-card-foreground border border-border/50 shadow-sm",
        elevated:
          "bg-card text-card-foreground shadow-lg hover:shadow-xl border-t border-white/20",
        glass:
          "card-glass text-foreground",
        gradient:
          "bg-gradient-to-br from-primary via-purple-600 to-secondary text-white border-0",
        ghost:
          "bg-transparent text-foreground border-0 shadow-none",
        muted:
          "bg-muted/40 text-foreground border border-border/50 backdrop-blur-sm",
        // NEW PREMIUM VARIANTS
        spotlight:
          "card-spotlight text-card-foreground",
        floating:
          "card-floating text-card-foreground",
        bento:
          "bento-item text-card-foreground",
        "gradient-border":
          "card-gradient-border bg-card text-card-foreground",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        lift: "hover-lift",
        glow: "hover:glow-primary transition-shadow cursor-pointer",
        shine: "card-shine cursor-pointer overflow-hidden",
        scale: "hover:scale-[1.02] cursor-pointer",
        // NEW PREMIUM HOVER EFFECTS
        tilt: "card-3d perspective-1000 cursor-pointer",
        floating: "float-shadow cursor-pointer",
        spotlight: "group cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: "none",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hover, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold leading-tight tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 border-t border-border mt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Icon container for cards
const CardIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "primary" | "secondary" | "accent" | "muted";
  }
>(({ className, variant = "primary", ...props }, ref) => {
  const variants = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    muted: "bg-muted text-muted-foreground",
  };
  
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
CardIcon.displayName = "CardIcon";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardIcon,
  cardVariants,
};
