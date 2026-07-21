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
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size={showLabel ? "default" : "icon"}
        className={cn("relative", className)}
        disabled
        aria-label="تم"
      >
        <Sun size={18} />
        {showLabel && <span className="me-2">تم</span>}
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "default" : "icon"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("relative z-10", className)}
      title={isDark ? "تم روشن" : "تم تاریک"}
      aria-label={isDark ? "تم روشن" : "تم تاریک"}
    >
      <span className="relative w-5 h-5 block pointer-events-none" aria-hidden>
        <Sun
          size={18}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon
          size={18}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </span>
      {showLabel && (
        <span className="me-2">{isDark ? "تم تاریک" : "تم روشن"}</span>
      )}
    </Button>
  );
}
