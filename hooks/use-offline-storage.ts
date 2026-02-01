"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Helper to check network status
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function useOfflineStorage<T>(
  key: string,
  initialValue: T,
  saveToCloud?: (data: T) => Promise<any>
) {
  const isOnline = useOnlineStatus();
  
  // Initialize state from LocalStorage if available, else initialValue
  const [data, setData] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Update LocalStorage whenever data changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
      setIsDirty(true);
    } catch (error) {
      console.error("Failed to save to local storage", error);
    }
  }, [key, data]);

  // Sync Logic
  const sync = useCallback(async () => {
    if (!saveToCloud || !isDirty) return;
    
    // If offline, we can't sync
    if (!navigator.onLine) {
        toast.warning("اینترنت قطع است. تغییرات در دستگاه شما ذخیره شد.");
        return;
    }

    setIsSyncing(true);
    try {
      await saveToCloud(data);
      setIsDirty(false);
      setLastSynced(new Date());
      toast.success("تغییرات با سرور همگام‌سازی شد.");
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error("خطا در همگام‌سازی با سرور.");
    } finally {
      setIsSyncing(false);
    }
  }, [data, isDirty, saveToCloud]);

  // Auto-Sync when coming back online
  useEffect(() => {
    if (isOnline && isDirty) {
      const timeout = setTimeout(() => {
          sync();
      }, 2000); // Debounce slightly
      return () => clearTimeout(timeout);
    }
  }, [isOnline, isDirty, sync]);

  return {
    data,
    setData,
    isDirty,
    isSyncing,
    lastSynced,
    isOnline,
    syncManual: sync
  };
}
