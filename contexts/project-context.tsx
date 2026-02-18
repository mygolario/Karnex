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
      // Use server action
      const { getUserProjectsAction } = await import("@/lib/project-actions");
      const res = await getUserProjectsAction();
      
      if (res.error) {
        console.error("Error fetching projects:", res.error);
        setIsLoading(false);
        return;
      }
      
      const allProjects: BusinessPlan[] = (res.projects as BusinessPlan[]) || [];
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
    console.log("📝 Creating project via Server Action for user:", user.id);
    
    const { createProjectAction } = await import("@/lib/project-actions");
    const res = await createProjectAction(planData);

    if (res.error || !res.success || !res.id) {
        throw new Error(res.error || "Failed to create project");
    }

    const newId = res.id;
    console.log("✅ Project created:", newId);
    
    // FORCE REFRESH & SWITCH
    setIsLoading(true); // Manually set loading to prevent UI flicker
    try {
        // Fetch fresh list
        const { getUserProjectsAction } = await import("@/lib/project-actions");
        const fetchRes = await getUserProjectsAction();
        
        if (fetchRes.error) throw new Error("Failed to refresh projects");
        
        let allProjects: BusinessPlan[] = (fetchRes.projects as BusinessPlan[]) || [];
        
        // Find the specific new project
        let newProject = allProjects.find(p => p.id === newId);
        
        if (!newProject) {
            console.warn("⚠️ New project created but not found in fetch. constructing optimistic project.");
            // Construct optimistic project to ensure UI updates
            newProject = {
                id: newId,
                userId: user.id,
                projectName: planData.projectName,
                tagline: planData.tagline,
                description: planData.description || "",
                data: planData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Add any other required fields from BusinessPlan interface
                ...planData 
            } as BusinessPlan;
            
            allProjects = [newProject, ...allProjects];
        }
        
        setProjects(allProjects);
        console.log("🔄 Switching to new project:", newProject.projectName);
        setActiveProject(newProject);

    } catch (err) {
        console.error("❌ Error switching to new project:", err);
        // Even if fetch fails entirely, try to set optimistic state if we have the ID? 
        // For now, let's rely on the try block flow above.
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
        await savePlanToCloud(user.id!, updates as any, true, activeProject.id!);
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
