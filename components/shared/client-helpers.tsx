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
const PostHogProvider = dynamic(
  () =>
    import("@/components/shared/posthog-provider").then((m) => m.PostHogProvider),
  { ssr: false }
);
const UtmCapture = dynamic(
  () => import("@/components/shared/utm-capture").then((m) => m.UtmCapture),
  { ssr: false }
);

export function ClientHelpers() {
  return (
    <>
      <ChunkLoadRecovery />
      <UtmCapture />
      <PostHogProvider />
      <WebVitalsReporter />
      <ServiceWorkerRegister />
      <CookieBanner />
    </>
  );
}
