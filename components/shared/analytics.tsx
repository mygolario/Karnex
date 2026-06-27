"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebVitalsReporter } from "@/components/shared/web-vitals-reporter";

function getInitialConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem("cookieConsent");
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const [consented, setConsented] = useState<boolean | null>(null);

  useEffect(() => {
    setConsented(getInitialConsent());

    const onStorage = () => setConsented(getInitialConsent());
    window.addEventListener("storage", onStorage);
    window.addEventListener("cookie-consent-change", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cookie-consent-change", onStorage);
    };
  }, []);

  if (!GA_ID || consented !== true) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}

export function PerformanceMonitoring() {
  return <SpeedInsights />;
}
