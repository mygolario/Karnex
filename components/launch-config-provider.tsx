"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  hydrateLaunchOverrides,
  mergeLaunchConfig,
  type EffectiveLaunchConfig,
  type LaunchOverrides,
} from "@/lib/launch/config";

type LaunchConfigContextValue = {
  config: EffectiveLaunchConfig;
  overrides: LaunchOverrides | null;
  refresh: () => Promise<void>;
};

const LaunchConfigContext = createContext<LaunchConfigContextValue | null>(null);

export function LaunchConfigProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<LaunchOverrides | null>(null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/launch-config");
      if (!res.ok) return;
      const data = (await res.json()) as { overrides?: LaunchOverrides | null };
      const next = data.overrides ?? null;
      hydrateLaunchOverrides(next);
      setOverrides(next);
      setVersion((v) => v + 1);
    } catch {
      /* keep defaults */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => {
      void refresh();
    };
    window.addEventListener("karnex:launch-config", onUpdate);
    return () => window.removeEventListener("karnex:launch-config", onUpdate);
  }, [refresh]);

  const value = useMemo<LaunchConfigContextValue>(() => {
    void version;
    return {
      config: mergeLaunchConfig(overrides),
      overrides,
      refresh,
    };
  }, [overrides, refresh, version]);

  return (
    <LaunchConfigContext.Provider value={value}>
      {children}
    </LaunchConfigContext.Provider>
  );
}

export function useLaunchConfig() {
  const ctx = useContext(LaunchConfigContext);
  if (!ctx) {
    return {
      config: mergeLaunchConfig(null),
      overrides: null,
      refresh: async () => {},
    };
  }
  return ctx;
}
