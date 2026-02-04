"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { BusinessPlan, getUserProjects, getPlanFromCloud, savePlanToCloud, createProject } from "@/lib/db";
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
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Load Projects on Auth
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setActiveProject(null);
      setLoading(false);
      return;
    }
    
    refreshProjects();
  }, [user]);

  const refreshProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch all projects
      const allProjects = await getUserProjects(user.uid);
      setProjects(allProjects);

      // determine active project
      // 1. If currently active, keep it (refresh data)
      // 2. If 'current' exists (legacy), use it
      // 3. Use first available
      
      let selected = activeProject;
      
      // If we have an active project ID, find it in new list
      if (selected && selected.id) {
         selected = allProjects.find(p => p.id === selected!.id) || null;
      }
      
      // If no selection yet, try 'current' or first
      if (!selected && allProjects.length > 0) {
        // Prefer 'current' if it exists (for backward compat)
        // Adjust logic based on how we store IDs. 
        // For now, let's just pick the most recently updated.
        selected = allProjects.sort((a, b) => 
            new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        )[0];
      }

      setActiveProject(selected);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async (planData: any) => {
    if (!user) throw new Error("User not found");
    // Create in DB
    const newId = await createProject(user.uid, planData);
    
    // Refresh list
    await refreshProjects();
    
    // Set as active
    const newProject = await getPlanFromCloud(user.uid, newId);
    if (newProject) setActiveProject(newProject);
    
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
    if (!activeProject || !user) return;
    
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
        await savePlanToCloud(user.uid, updates as any, true, activeProject.id);
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
