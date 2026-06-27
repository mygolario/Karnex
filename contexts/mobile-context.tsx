"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useIsMobile, useIsStandalone } from "@/hooks/use-is-mobile";
import { usePwa } from "@/hooks/use-pwa";

interface MobileContextValue {
  isMobile: boolean;
  isStandalone: boolean;
  immersiveMode: boolean;
  setImmersiveMode: (value: boolean) => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  canShowInstallBanner: boolean;
  bannerDismissed: boolean;
  onboardingSeen: boolean;
  promptInstall: () => Promise<boolean>;
  dismissBanner: () => void;
  markOnboardingSeen: () => void;
}

const MobileContext = createContext<MobileContextValue | null>(null);

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const isStandalone = useIsStandalone();
  const pwa = usePwa();
  const [immersiveMode, setImmersiveModeState] = useState(false);

  const setImmersiveMode = useCallback((value: boolean) => {
    setImmersiveModeState(value);
  }, []);

  const value = useMemo<MobileContextValue>(
    () => ({
      isMobile,
      isStandalone,
      immersiveMode,
      setImmersiveMode,
      ...pwa,
    }),
    [isMobile, isStandalone, immersiveMode, setImmersiveMode, pwa]
  );

  return <MobileContext.Provider value={value}>{children}</MobileContext.Provider>;
}

export function useMobileContext() {
  const ctx = useContext(MobileContext);
  if (!ctx) {
    throw new Error("useMobileContext must be used within MobileProvider");
  }
  return ctx;
}

export function useMobileContextOptional() {
  return useContext(MobileContext);
}
