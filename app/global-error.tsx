"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { recoverFromChunkError } from "@/components/shared/chunk-load-recovery";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (recoverFromChunkError(error)) return;
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body>
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            fontFamily: "sans-serif",
            maxWidth: 420,
            margin: "4rem auto",
          }}
        >
          <h2 style={{ marginBottom: "0.75rem" }}>خطای سیستمی</h2>
          <p style={{ color: "#666", lineHeight: 1.7 }}>
            مشکلی در بارگذاری برنامه رخ داد. معمولاً بعد از بروزرسانی سایت با یک
            رفرش کامل برطرف می‌شود.
          </p>
          <button
            type="button"
            onClick={() => {
              if (!recoverFromChunkError(error)) {
                try {
                  sessionStorage.removeItem("karnex_chunk_reload");
                } catch {
                  /* ignore */
                }
                window.location.reload();
              }
            }}
            style={{
              marginTop: "1.25rem",
              padding: "0.65rem 1.25rem",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(90deg,#ec4899,#f97316)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            تلاش مجدد
          </button>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              display: "block",
              margin: "0.75rem auto 0",
              background: "transparent",
              border: "none",
              color: "#888",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            تلاش بدون رفرش کامل
          </button>
        </div>
      </body>
    </html>
  );
}
