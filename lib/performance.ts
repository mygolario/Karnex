"use client";

import { memo, useMemo, useCallback, useState, useEffect, ReactNode } from "react";

/**
 * Debounce hook - prevents excessive re-renders from rapid state changes
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook - limits how often a callback can be executed
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [lastCall, setLastCall] = useState(0);

  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        setLastCall(now);
        return callback(...args);
      }
    }) as T,
    [callback, delay, lastCall]
  );
}

/**
 * Lazy load component - only renders when visible in viewport
 */
export function useLazyLoad(ref: React.RefObject<HTMLElement | null>): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return isVisible;
}

/**
 * Local storage hook with SSR safety
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    setStoredValue(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Preload critical resources
 */
export function preloadResources(urls: string[]) {
  if (typeof window === "undefined") return;
  
  urls.forEach(url => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    
    if (url.endsWith(".js")) link.as = "script";
    else if (url.endsWith(".css")) link.as = "style";
    else if (url.match(/\.(png|jpg|jpeg|webp|avif|gif|svg)$/)) link.as = "image";
    else if (url.match(/\.(woff2?|ttf|eot)$/)) link.as = "font";
    
    document.head.appendChild(link);
  });
}
