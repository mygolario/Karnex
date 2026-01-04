"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "pills" | "underline";
}

export function TabsList({ children, className, variant = "default" }: TabsListProps) {
  const variantStyles = {
    default: "bg-muted p-1 rounded-xl",
    pills: "gap-2",
    underline: "border-b border-border gap-4",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-start",
        variantStyles[variant],
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function TabsTrigger({ 
  value, 
  children, 
  className, 
  disabled = false,
  icon 
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs();
  const isSelected = selectedValue === value;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => !disabled && onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        // Default state
        "text-muted-foreground hover:text-foreground",
        // Selected state
        isSelected && "bg-background text-foreground shadow-sm rounded-lg",
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: selectedValue } = useTabs();

  if (selectedValue !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
