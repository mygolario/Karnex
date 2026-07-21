"use client";

import { useEffect } from "react";

const RELOAD_KEY = "karnex_chunk_reload";
const RELOAD_TTL_MS = 30_000;

function isChunkLoadFailure(err: unknown): boolean {
  if (!err) return false;
  const name = err instanceof Error ? err.name : "";
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : String(err);
  return (
    name === "ChunkLoadError" ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    (/_next\/static\//i.test(message) && /failed|404|MIME|text\/plain/i.test(message))
  );
}

function hardReloadOnce(): boolean {
  try {
    const raw = sessionStorage.getItem(RELOAD_KEY);
    const last = raw ? Number(raw) : 0;
    if (Number.isFinite(last) && Date.now() - last < RELOAD_TTL_MS) {
      return false;
    }
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* private mode — still attempt reload */
  }
  // Cache-bust navigation so HTML picks up the latest deployment manifest.
  const url = new URL(window.location.href);
  url.searchParams.set("_cb", String(Date.now()));
  window.location.replace(url.toString());
  return true;
}

/**
 * After a Vercel deploy, open tabs can request deleted `/_next/static` chunks
 * (404 served as text/plain → ChunkLoadError → global-error "خطای سیستمی").
 * One hard reload recovers; a short TTL prevents infinite reload loops.
 */
export function ChunkLoadRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLScriptElement &&
        typeof target.src === "string" &&
        target.src.includes("/_next/static/")
      ) {
        hardReloadOnce();
        return;
      }
      if (isChunkLoadFailure(event.error) || isChunkLoadFailure(event.message)) {
        hardReloadOnce();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadFailure(event.reason)) {
        hardReloadOnce();
      }
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}

export function recoverFromChunkError(error: unknown): boolean {
  if (!isChunkLoadFailure(error)) return false;
  return hardReloadOnce();
}
