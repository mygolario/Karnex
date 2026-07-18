"use client";

import Link from "next/link";
import { Smartphone, ExternalLink, CheckCircle2 } from "lucide-react";
import { useMobileContextOptional } from "@/contexts/mobile-context";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";
import { IosInstallGuide } from "@/components/pwa/ios-install-guide";

export function PwaSettingsCard() {
  const mobile = useMobileContextOptional();

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Smartphone size={20} />
        </div>
        <div>
          <h3 className="font-bold">اپلیکیشن موبایل (PWA)</h3>
          <p className="text-xs text-muted-foreground">نصب کارنکس روی صفحه اصلی موبایل</p>
        </div>
      </div>

      {mobile?.isInstalled ? (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle2 size={18} />
          <span>اپلیکیشن نصب شده و در حال اجرا است</span>
        </div>
      ) : (
        <>
          <PwaInstallButton className="w-full justify-center" />
          {mobile?.isIOS && <IosInstallGuide />}
          <Link
            href="/mobile-app"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink size={14} />
            راهنمای کامل نصب
          </Link>
        </>
      )}
    </div>
  );
}
