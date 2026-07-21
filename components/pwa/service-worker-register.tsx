"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;

    const register = () =>
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // Pull updates when a tab becomes visible again (post-deploy recovery).
          const checkUpdate = () => {
            registration.update().catch(() => {});
          };
          checkUpdate();
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") checkUpdate();
          });

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                toast("نسخه جدید آماده است", {
                  description: "برای دریافت آخرین تغییرات، صفحه را بروزرسانی کنید.",
                  action: {
                    label: "بروزرسانی",
                    onClick: () => {
                      newWorker.postMessage({ type: "SKIP_WAITING" });
                      window.location.reload();
                    },
                  },
                  duration: Infinity,
                });
              }
            });
          });
        })
        .catch((err) => {
          console.warn("SW registration failed:", err);
        });

    register();

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      // Activate new SW (skipWaiting) then hard-reload so RSC/nav rules apply.
      window.location.reload();
    });
  }, []);

  return null;
}
