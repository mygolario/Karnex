"use client";

import { useEffect } from "react";
import { useMobileContextOptional } from "@/contexts/mobile-context";

/** Call at page level to hide bottom nav on mobile (Canvas, Copilot, etc.) */
export function useImmersivePage(active = true) {
  const mobile = useMobileContextOptional();

  useEffect(() => {
    if (!mobile?.isMobile) return;
    mobile.setImmersiveMode(active);
    return () => mobile.setImmersiveMode(false);
  }, [mobile, active]);
}
