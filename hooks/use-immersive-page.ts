"use client";

import { useEffect } from "react";
import { useMobileContextOptional } from "@/contexts/mobile-context";

/** Call at page level to hide the bottom nav on mobile (Canvas, Copilot, etc.) */
export function useImmersivePage(active = true) {
  const mobile = useMobileContextOptional();
  const isMobile = mobile?.isMobile ?? false;
  // Depend on the stable setter rather than the whole context object: the
  // context identity changes when `immersiveMode` does, which would make this
  // effect tear down and re-apply itself on every toggle.
  const setImmersiveMode = mobile?.setImmersiveMode;

  useEffect(() => {
    if (!isMobile || !setImmersiveMode) return;
    setImmersiveMode(active);
    return () => setImmersiveMode(false);
  }, [isMobile, setImmersiveMode, active]);
}
