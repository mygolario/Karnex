"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  saveAnalysis: (data: LocationAnalysis) => Promise<void>;
  analyzeLocation: (city: string, address: string, radius?: number, priceTier?: string, footfallDependency?: string, rentBudget?: number, businessCategory?: string) => Promise<void>;
  loadFromHistory: (item: LocationAnalysis) => void;
  addToComparison: (item: LocationAnalysis) => void;
  removeFromComparison: (id: string) => void;
  toggleComparisonMode: () => void;
  deleteFromHistory: (createdAt: string) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { activeProject, updateActiveProject } = useProject();
  const [analysis, setAnalysis] = useState<LocationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<LocationAnalysis[]>([]);
  const [comparisonItems, setComparisonItems] = useState<LocationAnalysis[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    if (activeProject?.locationAnalysis) {
      setAnalysis(activeProject.locationAnalysis);
    }
    if (activeProject?.locationHistory) {
      setHistory(activeProject.locationHistory);
    }
  }, [activeProject]);

  const saveAnalysis = async (data: LocationAnalysis) => {
    if (!activeProject) return;
    setLoading(true);
    try {
      setAnalysis(data);

      // Build updated history (newest first, max 10)
      const newHistory = [data, ...history.filter(h => h.createdAt !== data.createdAt)].slice(0, 10);
      setHistory(newHistory);

      await updateActiveProject({
        locationAnalysis: data,
        locationHistory: newHistory,
      });
      
      toast.success("تحلیل ذخیره شد");
    } catch (error) {
      console.error(error);
      toast.error("خطا در ذخیره تحلیل");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: LocationAnalysis) => {
    setAnalysis(item);
  };

  const addToComparison = (item: LocationAnalysis) => {
    if (comparisonItems.length >= 3) {
      toast.error("حداکثر ۳ مکان قابل مقایسه است");
      return;
    }
    if (comparisonItems.find(c => c.createdAt === item.createdAt)) return;
    setComparisonItems(prev => [...prev, item]);
    if (!comparisonMode) setComparisonMode(true);
  };

  const removeFromComparison = (createdAt: string) => {
    setComparisonItems(prev => prev.filter(c => c.createdAt !== createdAt));
  };

  const toggleComparisonMode = () => {
    setComparisonMode(prev => !prev);
    if (comparisonMode) setComparisonItems([]);
  };

  const deleteFromHistory = async (createdAt: string) => {
    if (!activeProject) return;
    const newHistory = history.filter(h => h.createdAt !== createdAt);
    setHistory(newHistory);
    
    // If the currently viewed analysis is the one being deleted, clear it
    if (analysis?.createdAt === createdAt) {
      setAnalysis(newHistory[0] || null);
    }

    // Remove from comparison too
    setComparisonItems(prev => prev.filter(c => c.createdAt !== createdAt));

    await updateActiveProject({
      locationHistory: newHistory,
      locationAnalysis: analysis?.createdAt === createdAt ? (newHistory[0] ?? undefined) : (analysis ?? undefined),
    });
    toast.success("تحلیل حذف شد");
  };

  const analyzeLocation = async (city: string, address: string, radius = 500, priceTier = 'mid', footfallDependency = 'high', rentBudget = 25000000, businessCategory = '') => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'analyze-location',
          city,
          address,
          activeProject,
          radius,
          priceTier,
          footfallDependency,
          rentBudget,
          businessCategory,
          modelOverride: 'google/gemini-2.5-flash' 
        }),
      });



      if (response.status === 429) {
          setShowLimitModal(true);
          setLoading(false);
          return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Location Analysis Failed:", response.status, errorText);
        throw new Error(`Analysis failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      let parsedData;
      
      if (data.analysis) {
        parsedData = data.analysis;
      } else {
        try {
            const cleanJson = data.content.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            throw new Error("Invalid AI response format");
        }
      }

      const analysisData: LocationAnalysis = {
        ...parsedData,
        city,
        address,
        businessCategory: businessCategory || parsedData.businessCategory,
        inputs: {
          ...parsedData.inputs,
          footfallDependency: footfallDependency as "high" | "destination",
          priceTier: priceTier as "budget" | "mid" | "premium",
          rentBudget,
          businessCategory,
        },
        createdAt: new Date().toISOString()
      };

      await saveAnalysis(analysisData);

    } catch (error) {
       console.error(error);
       toast.error("خطا در تحلیل مکان");
       throw error;
    } finally {
        setLoading(false);
    }
  };

  return (
    <LocationContext.Provider value={{ 
      analysis, loading, history, 
      comparisonItems, comparisonMode,
      saveAnalysis, analyzeLocation, loadFromHistory,
      addToComparison, removeFromComparison, toggleComparisonMode,
      deleteFromHistory
    }}>
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
