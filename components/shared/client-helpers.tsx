"use client";

import dynamic from "next/dynamic";
import { ChunkLoadRecovery } from "@/components/shared/chunk-load-recovery";

const CookieBanner = dynamic(
  () => import("@/components/shared/cookie-banner").then((m) => m.CookieBanner),
  { ssr: false }
);
const WebVitalsReporter = dynamic(
  () => import("@/components/shared/web-vitals-reporter").then((m) => m.WebVitalsReporter),
  { ssr: false }
);
const ServiceWorkerRegister = dynamic(
  () => import("@/components/pwa/service-worker-register").then((m) => m.ServiceWorkerRegister),
  { ssr: false }
);

export function ClientHelpers() {
  return (
    <>
      <ChunkLoadRecovery />
      <WebVitalsReporter />
      <ServiceWorkerRegister />
      <CookieBanner />
    </>
  );
}
