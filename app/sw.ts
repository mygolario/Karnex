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
  navigationPreload: true,
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
      matcher: ({ url }) =>
        url.pathname.startsWith("/api/projects") ||
        url.pathname.startsWith("/api/user-data") ||
        url.pathname.startsWith("/api/copilot") ||
        url.pathname.startsWith("/api/user"),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
