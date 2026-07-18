"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Smartphone, Download, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMobileContextOptional } from "@/contexts/mobile-context";
import { PwaInstallButton } from "@/components/pwa/pwa-install-button";

export function PwaOnboardingModal() {
  const mobile = useMobileContextOptional();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!mobile?.isMobile || mobile.isInstalled || mobile.onboardingSeen) return;
    const timer = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [mobile]);

  const handleClose = () => {
    mobile?.markOnboardingSeen();
    setOpen(false);
  };

  if (!mobile?.isMobile) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="text-primary" size={22} />
            نسخه موبایل کارنکس
          </DialogTitle>
          <DialogDescription>
            کارنکس را روی موبایل نصب کنید و مثل یک اپلیکیشن از آن استفاده کنید.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 text-sm text-muted-foreground my-2">
          <li>• نوار پایین برای دسترسی سریع</li>
          <li>• کار آفلاین روی نقشه راه</li>
          <li>• رابط تمام‌صفحه بدون نوار مرورگر</li>
        </ul>

        <div className="flex flex-col gap-2">
          <PwaInstallButton />
          <Link
            href="/mobile-app"
            onClick={handleClose}
            className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary hover:underline"
          >
            <Download size={16} />
            مشاهده راهنمای کامل نصب
          </Link>
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
            بعداً یادآوری کن
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
