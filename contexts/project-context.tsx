"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { BusinessPlan, savePlanToCloud, createProject } from "@/lib/db";
import { useRouter, usePathname } from "next/navigation";

interface ProjectContextType {
  projects: BusinessPlan[];
  activeProject: BusinessPlan | null;
  loading: boolean;
  refreshProjects: () => Promise<void>;
  createNewProject: (planData: any) => Promise<string>; // Returns ID
  switchProject: (projectId: string) => void;
  updateActiveProject: (updates: Partial<BusinessPlan>) => void; // NEW: Update active project in-place
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  activeProject: null,
  loading: true,
  refreshProjects: async () => {},
  createNewProject: async () => "",
  switchProject: () => {},
  updateActiveProject: () => {}, // NEW
});

export const useProject = () => useContext(ProjectContext);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<BusinessPlan[]>([]);
  const [activeProject, setActiveProject] = useState<BusinessPlan | null>(null);
  const [loading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Load Projects on Auth — use user?.id to prevent unnecessary re-fetches
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setActiveProject(null);
      setIsLoading(false);
      return;
    }
    
    refreshProjects();
  }, [user?.id]);

  const refreshProjects = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Use server-side API route instead of browser Supabase client
      const res = await fetch("/api/user-data?type=projects");
      if (!res.ok) {
        console.error("Error fetching projects: HTTP", res.status);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      const allProjects: BusinessPlan[] = data.projects || [];
      setProjects(allProjects);

      // determine active project
      // 1. If currently active, keep it (refresh data)
      // 2. If 'current' exists (legacy), use it
      // 3. Use first available
      
      let selected = activeProject;
      
      // If we have an active project ID, find it in new list
      if (selected && selected.id) {
         selected = allProjects.find((p: BusinessPlan) => p.id === selected!.id) || null;
      }
      
      // If no selection yet, try 'current' or first
      if (!selected && allProjects.length > 0) {
        // Prefer 'current' if it exists (for backward compat)
        // Adjust logic based on how we store IDs. 
        // For now, let's just pick the most recently updated.
        selected = allProjects.sort((a: BusinessPlan, b: BusinessPlan) => 
            new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        )[0];
      }

      setActiveProject(selected);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewProject = async (planData: any) => {
    if (!user) throw new Error("User not found");
    
    // Only do the critical insert — dashboard will load projects on its own
    console.log("📝 Creating project in Supabase for user:", user.id);
    const newId = await createProject(user.id, planData);
    console.log("✅ Project created:", newId);
    
    // FORCE REFRESH & SWITCH
    setIsLoading(true); // Manually set loading to prevent UI flicker
    try {
        // Fetch fresh list
        const res = await fetch("/api/user-data?type=projects");
        if (!res.ok) throw new Error("Failed to refresh projects");
        
        const data = await res.json();
        const allProjects: BusinessPlan[] = data.projects || [];
        
        setProjects(allProjects);
        
        // Find the specific new project
        const newProject = allProjects.find(p => p.id === newId);
        
        if (newProject) {
            console.log("🔄 Switching to new project:", newProject.projectName);
            setActiveProject(newProject);
            // Optional: You could allow the caller to handle routing, 
            // but ensuring state is cohesive here is safer.
        } else {
            console.warn("⚠️ New project created but not found in list. Using fallback.");
            // Fallback to what refreshProjects normally does
            if (allProjects.length > 0) setActiveProject(allProjects[0]);
        }

    } catch (err) {
        console.error("❌ Error switching to new project:", err);
        // Dont throw, let the flow continue so the user at least gets redirected (even if to old project)
    } finally {
        setIsLoading(false);
    }

    return newId;
  };

  const switchProject = (projectId: string) => {
    const target = projects.find(p => p.id === projectId);
    if (target) {
      setActiveProject(target);
      // Optional: Persist selection to local storage or URL
    }
  };

  // NEW: Update active project in-place for immediate UI feedback AND save to cloud
  const updateActiveProject = async (updates: Partial<BusinessPlan>) => {
    if (!activeProject || !activeProject.id || !user) return;
    
    // Optimsitic Update
    const updatedProject = { ...activeProject, ...updates };
    setActiveProject(updatedProject);
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === activeProject.id ? updatedProject : p
      )
    );

    // Save to Cloud (Fire and forget or await if needed, but for context we usually just trigger it)
    try {
        await savePlanToCloud(user.id, updates as any, true, activeProject.id);
    } catch (err) {
        console.error("Failed to save project updates", err);
        // revert if needed? For now we assume eventual consistency or user retry
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProject,
      loading,
      refreshProjects,
      createNewProject,
      switchProject,
      updateActiveProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
}
