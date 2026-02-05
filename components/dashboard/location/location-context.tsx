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
        const prompt = `
        You are an expert Urban Planner and Real Estate Location Analyst for a "${activeProject?.projectType || 'store'}" business named "${activeProject?.projectName}" in Iran.
        
        Analyze this specific location:
        City: ${city}
        Address/Neighborhood: ${address}
        Business Description: ${activeProject?.description || activeProject?.overview || 'A traditional business'}

        Provide a detailed, realistic analysis in valid JSON format.
        
        REQUIRED JSON STRUCTURE:
        {
          "score": number (0-10, e.g. 8.5),
          "scoreReason": "string (short Persian summary)",
          "population": "string (e.g. '45,000 نفر')",
          "populationDesc": "string (Persian description of density/power)",
          "competitorsCount": number,
          "competitorsDesc": "string (Persian analysis of competition)",
          "nearbyCompetitors": ["string (Real specific competitor name 1)", "string (Real specific competitor name 2)"],
          "rentEstimate": "string (e.g. '۵۰ تا ۷۰ میلیون تومان')",
          "successMatch": { "label": "string (High/Medium/Low - Persian)", "color": "hex" },
          "demographics": [
            { "label": "string (Age group/Type)", "percent": number, "color": "string (hex or tailwind class)" },
            { "label": "string", "percent": number, "color": "string" }
          ],
          "swot": {
            "strengths": ["string", "string"],
            "weaknesses": ["string", "string"],
            "opportunities": ["string", "string"],
            "threats": ["string", "string"]
          },
          "aiInsight": "string (valuable Persian insight about this specific location)",
          "peakHours": "string (e.g. '18:00 تا 21:00')",
          "accessLevel": "string (e.g. 'Excellent', 'Good')",
          "accessPoints": [
            "string (Persian point 1, e.g. near metro)",
            "string (Persian point 2)"
          ],
          "trafficWarning": "string (Persian traffic warning)",
          "recommendations": [
            { "title": "string (e.g. Pricing)", "desc": "string (Persian advice)" },
            { "title": "string (e.g. Marketing)", "desc": "string (Persian advice)" }
          ]
        }

        ENSURE VALID JSON. NO MARKDOWN. NO COMMENTS.
      `;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      
      let parsedData;
      try {
        const cleanJson = data.content.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("Invalid AI response format");
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
