"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

/**
 * Toasts render top-center on every breakpoint: the bottom of the mobile
 * viewport is occupied by the dashboard tab bar, and `safe-top` keeps them
 * clear of the notch when running standalone with `viewportFit: 'cover'`.
 */
export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      dir="rtl"
      position="top-center"
      theme={(theme as "light" | "dark" | "system") ?? "system"}
      richColors
      closeButton
      offset="calc(env(safe-area-inset-top, 0px) + 0.75rem)"
      toastOptions={{
        classNames: {
          toast:
            "font-[inherit] rounded-2xl border-border bg-card text-card-foreground shadow-2xl",
          description: "text-muted-foreground",
          actionButton: "rounded-lg",
          cancelButton: "rounded-lg",
          closeButton: "rounded-lg",
        },
      }}
    />
  );
}
