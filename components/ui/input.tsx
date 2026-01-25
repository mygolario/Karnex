import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex w-full rounded-xl border transition-all duration-200 bg-transparent text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 outline-none",
  {
    variants: {
      variant: {
        default:
          "border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20",
        ghost:
          "border-transparent bg-muted/50 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20",
        premium:
          "border-border bg-muted/50 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20",
      },
      inputSize: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3 py-1 text-xs",
        lg: "h-14 px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant, inputSize }),
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            icon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
