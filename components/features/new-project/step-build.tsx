"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useGenesisWizard } from "./genesis-wizard-context";
import { cn, toPersianDigits } from "@/lib/utils";

/**
 * Build phase: auto-starts generate once auth is ready and shows phased checklist + peek.
 */
export function StepBuild() {
  const { user, loading: authLoading } = useAuth();
  const {
    generate,
    isGenerating,
    isCreating,
    generatingPhase,
    buildChecklist,
    overviewPeek,
    creditEstimate,
    error,
    clearError,
    retreat,
  } = useGenesisWizard();

  const startedForKey = useRef<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    // Wait for auth hydration so we don't fire generate() with user=null and get stuck.
    if (authLoading) return;
    const authKey = user?.id ?? "anon";
    if (startedForKey.current === authKey && retryToken === 0) return;
    startedForKey.current = authKey;
    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryToken, authLoading, user?.id]);

  const busy = isGenerating || isCreating || authLoading;

  return (
    <div className="w-full max-w-lg mx-auto px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-lg shadow-primary/25">
          {busy ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : (
            <Check className="w-7 h-7" />
          )}
        </div>
        <h2 className="text-2xl md:text-3xl font-black mb-2">
          {authLoading
            ? "در حال بررسی ورود…"
            : isCreating
              ? "در حال ذخیره پروژه…"
              : "کارنکس در حال طراحی استراتژی…"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {generatingPhase ||
            `حدود ۱ تا ۳ دقیقه · ${toPersianDigits(creditEstimate.total)} اعتبار`}
        </p>
      </motion.div>

      <ul className="space-y-3 text-start mb-8">
        {buildChecklist.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
              item.done
                ? "border-brand-primary/30 bg-brand-primary/5"
                : "border-border/50 bg-card/40"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border",
                item.done
                  ? "bg-brand-primary border-brand-primary text-white"
                  : "border-border text-muted-foreground"
              )}
            >
              {item.done ? (
                <Check className="w-4 h-4" />
              ) : busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
              )}
            </span>
            <span className="font-medium">{item.label}</span>
          </li>
        ))}
      </ul>

      {overviewPeek && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-brand-secondary/30 bg-brand-secondary/5 p-4 text-start mb-6"
        >
          <p className="text-xs font-semibold text-brand-secondary mb-1">
            پیش‌نمایش خلاصه
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {overviewPeek}
            {overviewPeek.length >= 280 ? "…" : ""}
          </p>
        </motion.div>
      )}

      {error && (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{error}</p>
          {error.includes("وارد شوید") ? (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent("/new-project?step=5")}`}
              className="inline-block text-sm font-semibold text-brand-primary hover:underline"
            >
              ورود مجدد
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  clearError();
                  retreat();
                }}
                className="text-sm font-semibold text-brand-primary hover:underline"
              >
                بازگشت به تأیید و تلاش دوباره
              </button>
              <button
                type="button"
                onClick={() => {
                  clearError();
                  startedForKey.current = null;
                  setRetryToken((t) => t + 1);
                }}
                className="block mx-auto text-sm text-muted-foreground hover:text-foreground"
              >
                تلاش مجدد همین‌جا
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
