"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body>
        <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>خطای سیستمی</h2>
          <p>مشکلی در بارگذاری برنامه رخ داد.</p>
          <button type="button" onClick={reset} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
            تلاش مجدد
          </button>
        </div>
      </body>
    </html>
  );
}
