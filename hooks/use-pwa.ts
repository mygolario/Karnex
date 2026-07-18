"use client";

import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "karnex-pwa-banner-dismissed";
const ONBOARDING_KEY = "karnex-pwa-onboarding-seen";

export function usePwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true);
  const [onboardingSeen, setOnboardingSeen] = useState(true);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

    setIsInstalled(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream);

    setBannerDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    setOnboardingSeen(localStorage.getItem(ONBOARDING_KEY) === "true");

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "true");
    setBannerDismissed(true);
  }, []);

  const markOnboardingSeen = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOnboardingSeen(true);
  }, []);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    bannerDismissed,
    onboardingSeen,
    promptInstall,
    dismissBanner,
    markOnboardingSeen,
    canShowInstallBanner: !isInstalled && !bannerDismissed && (isInstallable || isIOS),
  };
}
