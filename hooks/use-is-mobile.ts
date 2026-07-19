"use client";

import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";
const STANDALONE_QUERY = "(display-mode: standalone)";

function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia(STANDALONE_QUERY).matches ||
    // iOS Safari legacy
    ("standalone" in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function getIsMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

export function useIsStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(STANDALONE_QUERY);
    const update = () => setIsStandalone(getIsStandalone());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isStandalone;
}

/** True only for narrow viewports (≤767px). Standalone PWA on large screens stays desktop. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);

    const update = () => {
      setIsMobile(getIsMobileViewport());
    };

    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return isMobile;
}

export function useIsMobileViewport(): boolean {
  const [isViewport, setIsViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsViewport(getIsMobileViewport());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isViewport;
}
