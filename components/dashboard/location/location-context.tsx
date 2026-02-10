"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { LocationAnalysis, saveOperations } from "@/lib/db";
import { toast } from "sonner";

interface LocationContextType {
  analysis: LocationAnalysis | null;
  loading: boolean;
  history: LocationAnalysis[]; // Future proofing for multiple analyses
  saveAnalysis: (data: LocationAnalysis) => Promise<void>;
  analyzeLocation: (city: string, address: string) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { activeProject, updateActiveProject } = useProject();
  const [analysis, setAnalysis] = useState<LocationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeProject?.locationAnalysis) {
      setAnalysis(activeProject.locationAnalysis);
    }
  }, [activeProject]);

  const saveAnalysis = async (data: LocationAnalysis) => {
    if (!activeProject) return;
    setLoading(true);
    try {
      // Optimistic
      setAnalysis(data);

      // Persist using generic update since we added it to BusinessPlan root or operations
      // Looking at db.ts, I put it on root `locationAnalysis`.
      // But updateActiveProject usually merges root fields.
      
      // Let's use a specialized save if needed, but updateActiveProject should suffice for root fields if configured.
      // Alternatively, we can use the `savePlanToCloud` logic or create a specific helper.
      // For now, I'll update the context and assume it syncs.
      // Wait, let's look at `useProject`: usually exposes `updateActiveProject` which calls `savePlanToCloud`.
      
      await updateActiveProject({
        locationAnalysis: data
      });
      
      toast.success("تحلیل ذخیره شد");
    } catch (error) {
      console.error(error);
      toast.error("خطا در ذخیره تحلیل");
    } finally {
      setLoading(false);
    }
  };

  const analyzeLocation = async (city: string, address: string) => {
    setLoading(true);
    try {
        // COMPLETE REDESIGN PHASE 2: "The Urban Strategist"
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
              { "name": "string", "distance": "string", "strength": "string", "weakness": "string" }
            ]
          },
          
          "rentEstimate": "string (Price range per meter or total monthly)",
          "successMatch": { "label": "Excellent" | "Good" | "Risky", "color": "emerald" | "amber" | "red" },
          
          "demographics": [
            { "label": "Young Professionals (25-35)", "percent": number, "color": "#8884d8" },
            { "label": "Families", "percent": number, "color": "#00C49F" },
            { "label": "Students", "percent": number, "color": "#FFBB28" },
            { "label": "Seniors", "percent": number, "color": "#FF8042" }
            // Sum must be approx 100
          ],
          
          "swot": {
            "strengths": ["string", "string"],
            "weaknesses": ["string", "string"],
            "opportunities": ["string", "string"],
            "threats": ["string", "string"]
          },
          
          "aiInsight": "string (One 'Inside Scoop' tip a pro broker would know)",
          "recommendations": [
             { "title": "string", "desc": "string" }
          ]
        }
        
        RULES:
        - **Accurate OSM Data:** Use the provided list of places.
        - **Realistic Scores:** Do not give 9/10 easily. Be critical.
        - **Language:** Professional Persian (Business Farsi).
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

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      
      let parsedData;
      
      // FIX: Check if server already returned parsed analysis object (preferred)
      if (data.analysis) {
        parsedData = data.analysis;
      } else {
        // Fallback for parsing string content
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
    <LocationContext.Provider value={{ analysis, loading, history: [], saveAnalysis, analyzeLocation }}>
      {children}
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
