"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useProject } from "@/contexts/project-context";
import { LocationAnalysis } from "@/lib/db";
import { toast } from "sonner";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";

interface LocationContextType {
  analysis: LocationAnalysis | null;
  loading: boolean;
  history: LocationAnalysis[];
  comparisonItems: LocationAnalysis[];
  comparisonMode: boolean;
  pendingPin: { lat: number; lon: number } | null;
  saveAnalysis: (data: LocationAnalysis) => Promise<void>;
  analyzeLocation: (
    city: string,
    address: string,
    businessDescription?: string,
    options?: {
      radius?: number;
      priceTier?: string;
      footfallDependency?: string;
      rentBudget?: number;
      businessCategory?: string;
    }
  ) => Promise<void>;
  loadFromHistory: (item: LocationAnalysis) => void;
  loadDemoAnalysis: (analysis: LocationAnalysis) => void;
  addToComparison: (item: LocationAnalysis) => void;
  removeFromComparison: (createdAt: string) => void;
  toggleComparisonMode: () => void;
  deleteFromHistory: (createdAt: string) => Promise<void>;
  requestPinAnalysis: (lat: number, lon: number) => void;
  confirmPinAnalysis: () => Promise<void>;
  cancelPinAnalysis: () => void;
  updateStorefrontPhoto: (dataUrl: string) => Promise<void>;
  toggleOnSiteCheck: (id: string) => Promise<void>;
  toggleReadinessCheck: (id: string) => Promise<void>;
  getReadinessChecked: () => Set<string>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const DEFAULT_CHECKLIST = [
  { id: "signage", label: "زاویه دید تابلو از خیابان اصلی" },
  { id: "parking", label: "خط دید پارکینگ / توقف" },
  { id: "entrance", label: "دسترسی ورودی بدون مانع" },
  { id: "evening", label: "نور کافی در ساعات شب" },
];

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { activeProject, updateActiveProject } = useProject();
  const [analysis, setAnalysis] = useState<LocationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<LocationAnalysis[]>([]);
  const [comparisonItems, setComparisonItems] = useState<LocationAnalysis[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ lat: number; lon: number } | null>(null);
  const [lastSearch, setLastSearch] = useState({
    city: "Tehran",
    address: "",
    businessDescription: "",
    options: {} as Record<string, unknown>,
  });

  useEffect(() => {
    if (activeProject?.locationAnalysis) {
      setAnalysis(activeProject.locationAnalysis);
    }
    if (activeProject?.locationHistory) {
      setHistory(activeProject.locationHistory);
    }
  }, [activeProject]);

  const persistAnalysis = useCallback(
    async (data: LocationAnalysis, silent?: boolean) => {
      if (!activeProject) return;
      setAnalysis(data);
      const newHistory = [data, ...history.filter((h) => h.createdAt !== data.createdAt)].slice(0, 10);
      setHistory(newHistory);
      await updateActiveProject({
        locationAnalysis: data,
        locationHistory: newHistory,
      });
      if (!silent) toast.success("تحلیل ذخیره شد");
    },
    [activeProject, history, updateActiveProject]
  );

  const saveAnalysis = async (data: LocationAnalysis) => {
    setLoading(true);
    try {
      await persistAnalysis(data);
    } catch (error) {
      console.error(error);
      toast.error("خطا در ذخیره تحلیل");
    } finally {
      setLoading(false);
    }
  };

  const analyzeLocation = async (
    city: string,
    address: string,
    businessDescription = "",
    options: {
      radius?: number;
      priceTier?: string;
      footfallDependency?: string;
      rentBudget?: number;
      businessCategory?: string;
    } = {}
  ) => {
    setLoading(true);
    setLastSearch({ city, address, businessDescription, options });
    try {
      const inferredRent =
        options.rentBudget ||
        activeProject?.locationAnalysis?.inputs?.rentBudget ||
        parseInt(String(activeProject?.budget || "0").replace(/\D/g, ""), 10) ||
        0;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze-location",
          city,
          address,
          activeProject,
          radius: options.radius,
          priceTier: options.priceTier || activeProject?.locationAnalysis?.inputs?.priceTier || "mid",
          footfallDependency:
            options.footfallDependency ||
            activeProject?.locationAnalysis?.inputs?.footfallDependency ||
            "high",
          rentBudget: inferredRent,
          businessCategory: options.businessCategory || "",
          businessDescription: businessDescription || activeProject?.overview || "",
          modelOverride: "google/gemini-2.5-flash",
        }),
      });

      if (response.status === 429) {
        setShowLimitModal(true);
        return;
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      const parsedData = data.analysis ?? JSON.parse(
        String(data.content || "{}")
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim()
      );

      const analysisData: LocationAnalysis = {
        ...parsedData,
        city,
        address,
        businessDescription,
        businessCategory:
          parsedData.aiCategory?.slug ||
          parsedData.businessCategory ||
          options.businessCategory,
        inputs: {
          ...parsedData.inputs,
          footfallDependency: (options.footfallDependency || "high") as "high" | "destination",
          priceTier: (options.priceTier || "mid") as "budget" | "mid" | "premium",
          rentBudget: inferredRent,
          businessCategory: parsedData.aiCategory?.slug || options.businessCategory,
          businessDescription,
        },
        storefront: {
          ...parsedData.storefront,
          onSiteChecklist: DEFAULT_CHECKLIST.map((c) => ({
            ...c,
            checked: false,
          })),
        },
        createdAt: new Date().toISOString(),
      };

      await persistAnalysis(analysisData);
    } catch (error) {
      console.error(error);
      toast.error("خطا در تحلیل مکان");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: LocationAnalysis) => setAnalysis(item);

  const loadDemoAnalysis = (demo: LocationAnalysis) => {
    setAnalysis({ ...demo, createdAt: demo.createdAt || new Date().toISOString() });
    toast.info("پیش‌نمایش نمونه — برای ذخیره تحلیل واقعی اجرا کنید");
  };

  const addToComparison = (item: LocationAnalysis) => {
    if (comparisonItems.length >= 3) {
      toast.error("حداکثر ۳ مکان قابل مقایسه است");
      return;
    }
    if (comparisonItems.find((c) => c.createdAt === item.createdAt)) return;
    setComparisonItems((prev) => [...prev, item]);
    if (!comparisonMode) setComparisonMode(true);
  };

  const removeFromComparison = (createdAt: string) => {
    setComparisonItems((prev) => prev.filter((c) => c.createdAt !== createdAt));
  };

  const toggleComparisonMode = () => {
    setComparisonMode((prev) => !prev);
    if (comparisonMode) setComparisonItems([]);
  };

  const deleteFromHistory = async (createdAt: string) => {
    if (!activeProject) return;
    const newHistory = history.filter((h) => h.createdAt !== createdAt);
    setHistory(newHistory);
    if (analysis?.createdAt === createdAt) {
      setAnalysis(newHistory[0] || null);
    }
    setComparisonItems((prev) => prev.filter((c) => c.createdAt !== createdAt));
    await updateActiveProject({
      locationHistory: newHistory,
      locationAnalysis:
        analysis?.createdAt === createdAt ? newHistory[0] ?? undefined : analysis ?? undefined,
    });
    toast.success("تحلیل حذف شد");
  };

  const requestPinAnalysis = (lat: number, lon: number) => {
    setPendingPin({ lat, lon });
    toast("نقطه جدید انتخاب شد", {
      description: "برای تحلیل مجدد دکمه تأیید را بزنید (یک اعتبار AI)",
      action: {
        label: "تحلیل",
        onClick: () => void confirmPinAnalysisInternal(lat, lon),
      },
    });
  };

  const confirmPinAnalysisInternal = async (lat: number, lon: number) => {
    const coordsStr = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    setPendingPin(null);
    await analyzeLocation(
      lastSearch.city,
      coordsStr,
      lastSearch.businessDescription,
      lastSearch.options as Parameters<LocationContextType["analyzeLocation"]>[3]
    );
  };

  const confirmPinAnalysis = async () => {
    if (pendingPin) await confirmPinAnalysisInternal(pendingPin.lat, pendingPin.lon);
  };

  const cancelPinAnalysis = () => setPendingPin(null);

  const patchAnalysis = async (patch: Partial<LocationAnalysis>) => {
    if (!analysis) return;
    const next = { ...analysis, ...patch };
    setAnalysis(next);
    await updateActiveProject({ locationAnalysis: next });
  };

  const updateStorefrontPhoto = async (dataUrl: string) => {
    await patchAnalysis({
      storefront: {
        ...analysis?.storefront,
        photoDataUrl: dataUrl,
        visibilityAssessment:
          analysis?.storefront?.visibilityAssessment ||
          "عکس آپلود شد — برای ارزیابی دقیق‌تر visibility تحلیل مجدد بگیرید.",
      },
    });
    toast.success("عکس ویترین ذخیره شد");
  };

  const toggleOnSiteCheck = async (id: string) => {
    if (!analysis) return;
    const list =
      analysis.storefront?.onSiteChecklist ||
      DEFAULT_CHECKLIST.map((c) => ({ ...c, checked: false }));
    const nextList = list.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    await patchAnalysis({ storefront: { ...analysis.storefront, onSiteChecklist: nextList } });
  };

  const getReadinessChecked = (): Set<string> => {
    const key = analysis?.createdAt;
    if (!key || !activeProject?.locationReadinessChecked) return new Set();
    return new Set(activeProject.locationReadinessChecked[key] || []);
  };

  const toggleReadinessCheck = async (id: string) => {
    if (!analysis || !activeProject) return;
    const key = analysis.createdAt;
    const current = new Set(getReadinessChecked());
    if (current.has(id)) current.delete(id);
    else current.add(id);
    const map = { ...(activeProject.locationReadinessChecked || {}), [key]: Array.from(current) };
    await updateActiveProject({ locationReadinessChecked: map });
  };

  return (
    <LocationContext.Provider
      value={{
        analysis,
        loading,
        history,
        comparisonItems,
        comparisonMode,
        pendingPin,
        saveAnalysis,
        analyzeLocation,
        loadFromHistory,
        loadDemoAnalysis,
        addToComparison,
        removeFromComparison,
        toggleComparisonMode,
        deleteFromHistory,
        requestPinAnalysis,
        confirmPinAnalysis,
        cancelPinAnalysis,
        updateStorefrontPhoto,
        toggleOnSiteCheck,
        toggleReadinessCheck,
        getReadinessChecked,
      }}
    >
      {children}
      <LimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
