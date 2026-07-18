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

const serwist = new Serwist({
  precacheEntries: self.__WB_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  // navigationPreload + NetworkOnly navigate caused no-response on dashboard reloads.
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
      matcher: ({ url }) =>
        url.pathname.startsWith("/api/projects") ||
        url.pathname.startsWith("/api/user-data") ||
        url.pathname.startsWith("/api/copilot") ||
        url.pathname.startsWith("/api/user") ||
        url.pathname.startsWith("/api/ai-generate"),
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
