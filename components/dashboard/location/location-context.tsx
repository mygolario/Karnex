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
  analyzeLocation: (city: string, address: string) => Promise<void>;
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

  const analyzeLocation = async (city: string, address: string) => {
    setLoading(true);
    try {
      const prompt = `
        ROLE: Senior Retail Location Strategist & Investment Analyst.
        
        CONTEXT:
        You are advising a major investor who demands data-driven insights, not generic advice.
        You have access to "REAL-TIME MAP DATA" (OSM) provided below.
        
        INPUT:
        City: ${city}
        Address: ${address}
        Project Type: "${activeProject?.projectType}"
        Business Name: "${activeProject?.projectName}"
        
        YOUR TASK:
        Perform a Deep-Dive Feasibility Study.
        
        1.  **VERIFY:** Cross-reference the provided OSM data with your internal knowledge of the neighborhood's socioeconomic status.
        2.  **ESTIMATE:** metrics like "Footfall", "Spend Power", and "Risk".
        3.  **ANALYZE:** Why is this specific street good or bad? (e.g. "One-way street", "Hard to park", "Near Metro").
        4.  **PROFILE:** Write a 2-sentence personality profile of this neighborhood.
        5.  **IDENTIFY GAPS:** What business concepts are MISSING in this area? What would thrive here?
        6.  **PRIORITIZE:** Rank your recommendations by urgency.
        7.  **SCORE COMPETITORS:** Rate each competitor on 4 axes (product, marketing, price, support) from 0-10.
        8.  **BREAK DOWN RISK:** Score 4 risk categories independently.
        
        OUTPUT FORMAT (JSON Persian):
        {
          "locationConfidence": "High" | "Medium" | "Low",
          "anchorLandmark": "string (Major traffic generator nearby)",
          "score": number (0-10, strict evaluation),
          "scoreReason": "string (Professional justification, max 2 sentences)",
          
          "metrics": {
             "footfallIndex": "High" | "Medium" | "Low",
             "spendPower": "High" | "Medium" | "Low" (Local disposable income),
             "riskRewardRatio": number (0-100, where 100 is High Risk/High Reward),
             "competitionDensity": "High" | "Medium" | "Low"
          },

          "population": "string (e.g. '15,000 in 1km radius')",
          "populationDesc": "string (Demographic profile summary)",
          
          "competitorAnalysis": {
            "saturationLevel": "Blue Ocean (Opportunity)" | "Red Ocean (Saturated)" | "Niche Market",
            "marketGap": "string (What specific concept is missing?)",
            "competitorCount": number,
            "directCompetitors": [
              { 
                "name": "string", 
                "distance": "string", 
                "strength": "string", 
                "weakness": "string",
                "scores": { "product": number(0-10), "marketing": number(0-10), "price": number(0-10), "support": number(0-10) }
              }
            ]
          },
          
          "rentEstimate": "string (Price range per meter or total monthly)",
          "successMatch": { "label": "Excellent" | "Good" | "Risky", "color": "emerald" | "amber" | "red" },
          
          "demographics": [
            { "label": "Young Professionals (25-35)", "percent": number, "color": "#8884d8" },
            { "label": "Families", "percent": number, "color": "#00C49F" },
            { "label": "Students", "percent": number, "color": "#FFBB28" },
            { "label": "Seniors", "percent": number, "color": "#FF8042" }
          ],
          
          "swot": {
            "strengths": ["string", "string"],
            "weaknesses": ["string", "string"],
            "opportunities": ["string", "string"],
            "threats": ["string", "string"]
          },
          
          "aiInsight": "string (One 'Inside Scoop' tip a pro broker would know)",
          
          "neighborhoodProfile": "string (2-sentence personality profile of the area - e.g. 'محله‌ای پرتحرک با بافت جوان و دانشجویی. فضای تجاری رقابتی اما فرصت‌های خلاقانه در بخش غذا و کافه.')",
          
          "marketGapCards": [
            { "title": "string (Missing concept name)", "description": "string (Why this would work here)", "potential": "High" | "Medium" | "Low" }
          ],
          
          "prioritizedRecommendations": [
            { "title": "string", "desc": "string", "urgency": "فوری" | "مهم" | "پیشنهادی" }
          ],
          
          "riskBreakdown": {
            "financial": number (0-100),
            "competition": number (0-100),
            "accessibility": number (0-100),
            "market": number (0-100)
          },
          
          "peakHours": "string (e.g. 'ساعات ۱۷ تا ۲۱ بیشترین تردد')",
          
          "recommendations": [
             { "title": "string", "desc": "string" }
          ]
        }
        
        RULES:
        - **Accurate OSM Data:** Use the provided list of places.
        - **Realistic Scores:** Do not give 9/10 easily. Be critical.
        - **Language:** Professional Persian (Business Farsi).
        - **Competitor scores** must be realistic and differentiated.
        - **Market gap cards** should be specific and actionable (minimum 2, maximum 4).
        - **prioritizedRecommendations** must have at least 3 items with mixed urgency levels.
      `;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          action: 'analyze-location',
          city,
          address,
          activeProject,
          modelOverride: 'google/gemini-2.5-flash-lite' 
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
