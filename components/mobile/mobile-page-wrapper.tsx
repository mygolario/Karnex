"use client";

import { cn } from "@/lib/utils";
import { useMobileContextOptional } from "@/contexts/mobile-context";

interface MobilePageWrapperProps {
  children: React.ReactNode;
  immersive?: boolean;
  className?: string;
  noPadding?: boolean;
}

/**
 * Consistent mobile page wrapper with optional immersive (full-bleed) mode.
 */
export function MobilePageWrapper({
  children,
  immersive = false,
  className,
  noPadding = false,
}: MobilePageWrapperProps) {
  const mobile = useMobileContextOptional();
  const isMobile = mobile?.isMobile ?? false;

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        immersive ? "mobile-immersive" : !noPadding && "px-4 py-3",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Hook for pages to toggle immersive mode (hide bottom nav).
 */
export function useImmersiveMode(active: boolean) {
  const mobile = useMobileContextOptional();

  if (typeof window !== "undefined" && mobile) {
    // Sync on render — pages call this at top level via useEffect in ImmersivePage
  }

  return mobile;
}
