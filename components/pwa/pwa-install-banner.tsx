"use client";

import Link from "next/link";
import { X, Smartphone, Download } from "lucide-react";
import { useMobileContextOptional } from "@/contexts/mobile-context";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";

export function PwaInstallBanner() {
  const mobile = useMobileContextOptional();

  if (!mobile?.isMobile || !mobile.canShowInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-[var(--mobile-bottom-nav-offset)] start-3 end-3 z-50 md:hidden">
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl shadow-xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Smartphone size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm mb-0.5">کارنکس را نصب کنید</p>
          <p className="text-xs text-white/80 mb-2">
            تجربه اپلیکیشن موبایل از صفحه اصلی
          </p>
          <div className="flex flex-wrap gap-2">
            <PwaInstallButton variant="outline" className="!border-white/40 !text-white !bg-white/10 !text-xs !py-1.5 !px-3" />
            <Link
              href="/mobile-app"
              className="inline-flex items-center gap-1 text-xs font-medium text-white/90 underline underline-offset-2"
            >
              <Download size={14} />
              راهنمای نصب
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={mobile.dismissBanner}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0 mobile-touch-target"
          aria-label="بستن"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
