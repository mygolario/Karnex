"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-bold">مشکلی پیش آمد</h2>
      <p className="text-muted-foreground max-w-md">
        خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.
      </p>
      <Button onClick={reset}>تلاش مجدد</Button>
    </div>
  );
}
