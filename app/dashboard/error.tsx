"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div
      className="min-h-[60vh] flex items-center justify-center p-8"
      dir="rtl"
    >
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3">
          مشکلی پیش آمد
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          یک خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید یا به صفحه اصلی
          داشبورد برگردید.
        </p>

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              داشبورد
            </Button>
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && error.message && (
          <details className="mt-8 text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              جزئیات خطا (فقط در محیط توسعه)
            </summary>
            <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto text-destructive">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
