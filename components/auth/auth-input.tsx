"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AuthInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  error?: boolean;
  hint?: React.ReactNode;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  (
    { label, icon, rightSlot, error, hint, id, className, ...props },
    ref
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground/80"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors flex items-center">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-label={!label ? props["aria-label"] : undefined}
            className={cn(
              "input-premium h-12",
              icon && "ps-11",
              rightSlot && "pe-11",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              className
            )}
            {...props}
          />
          {rightSlot && (
            <span className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center">
              {rightSlot}
            </span>
          )}
        </div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";
