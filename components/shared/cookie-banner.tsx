"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie } from "lucide-react";

const AUTH_PATHS = ["/login", "/signup", "/reset-password"];

export function CookieBanner() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  const onAuthPage = AUTH_PATHS.some(
    (p) => pathname === p || pathname?.startsWith(`${p}/`)
  );

  useEffect(() => {
    if (onAuthPage) {
      setShow(false);
      return;
    }
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [onAuthPage]);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    window.dispatchEvent(new Event("cookie-consent-change"));
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "false");
    window.dispatchEvent(new Event("cookie-consent-change"));
    setShow(false);
  };

  if (!show || onAuthPage) return null;

  return (
    <div
      className="fixed bottom-4 end-4 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-full animate-in slide-in-from-bottom duration-500"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
    >
      <Card variant="default" className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <Cookie size={20} />
          </div>
          <div>
            <h3 id="cookie-banner-title" className="font-bold text-foreground mb-1">استفاده از کوکی‌ها</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              ما برای بهبود تجربه شما از کوکی‌ها استفاده می‌کنیم. با ادامه استفاده از سایت، شما با این موضوع موافقت می‌کنید.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="gradient" onClick={handleAccept} className="flex-1">
                می‌پذیرم
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDecline} className="flex-1">
                رد می‌کنم
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
