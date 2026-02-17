"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={showLabel ? "default" : "icon"}
        className={cn("relative", className)}
        disabled
      >
        <Sun size={18} />
        {showLabel && <span className="mr-2">تم</span>}
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size={showLabel ? "default" : "icon"}
      onClick={toggleTheme}
      className={cn(
        "relative overflow-hidden",
        className
      )}
      title={theme === "dark" ? "تم روشن" : "تم تاریک"}
      aria-label={theme === "dark" ? "تم روشن" : "تم تاریک"}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun
          size={18}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            theme === "dark" 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        {/* Moon Icon */}
        <Moon
          size={18}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </div>
      {showLabel && (
        <span className="mr-2">
          {theme === "dark" ? "تم تاریک" : "تم روشن"}
        </span>
      )}
    </Button>
  );
}
