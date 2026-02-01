"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null; // Don't show anything if online (unintrusive)

  return (
    <div className={cn(
      "fixed top-4 left-1/2 -translate-x-1/2 z-50",
      "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg",
      "bg-red-500 text-white animate-in slide-in-from-top-4"
    )}>
      <WifiOff size={16} />
      <span className="text-sm font-bold">شما آفلاین هستید (ذخیره داخلی فعال است)</span>
    </div>
  );
}
