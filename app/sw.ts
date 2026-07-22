/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkOnly } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __WB_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * App Router soft navigations use RSC GET flights (RSC: 1), not mode=navigate.
 * defaultCache NetworkFirst on those (and HTML) causes Workbox `no-response`
 * when the network misses — breaking /dashboard/* and /new-project client nav.
 * Keep POST + navigate + RSC/Action on NetworkOnly ahead of defaultCache.
 * Do not enable navigationPreload with NetworkOnly navigate (known no-response).
 */
const serwist = new Serwist({
  precacheEntries: self.__WB_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  fallbacks: {
    entries: [
      {
        url: "/offline.html",
        matcher: ({ request }) => request.mode === "navigate",
      },
    ],
  },
  runtimeCaching: [
    {
      matcher: ({ request }) => request.method === "POST",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ request, url }) =>
        request.mode === "navigate" && !url.pathname.startsWith("/_next"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ request }) => {
        const headers = request.headers;
        return (
          headers.get("RSC") === "1" ||
          headers.get("Next-Router-Prefetch") === "1" ||
          headers.get("Next-Router-State-Tree") != null ||
          headers.get("Next-Action") != null
        );
      },
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/api/projects") ||
        url.pathname.startsWith("/api/user-data") ||
        url.pathname.startsWith("/api/copilot") ||
        url.pathname.startsWith("/api/user") ||
        url.pathname.startsWith("/api/ai-generate") ||
        url.pathname.startsWith("/api/auth") ||
        url.pathname.startsWith("/login") ||
        url.pathname.startsWith("/signup"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.hostname.includes("enamad.ir"),
      handler: async ({ request }) => {
        try {
          return await fetch(request);
        } catch {
          return new Response(null, { status: 408, statusText: "Network Error" });
        }
      },
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
