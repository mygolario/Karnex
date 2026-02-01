"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Show after a small delay
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "false");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-bottom duration-500">
      <Card variant="default" className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <Cookie size={20} />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">استفاده از کوکی‌ها</h3>
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
