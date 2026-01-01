import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-all duration-200",
          "placeholder:text-muted-foreground",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "outline-none resize-none",
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
