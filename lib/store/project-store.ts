import { create } from "zustand";
import { BusinessPlan, savePlanToCloud } from "@/lib/db";

interface ProjectState {
  projects: BusinessPlan[];
  activeProject: BusinessPlan | null;
  loading: boolean;
  
  setProjects: (projects: BusinessPlan[]) => void;
  setActiveProject: (project: BusinessPlan | null) => void;
  setLoading: (loading: boolean) => void;
  
  refreshProjects: (userId?: string) => Promise<void>;
  createNewProject: (userId: string, planData: any) => Promise<string>;
  switchProject: (projectId: string) => void;
  updateActiveProject: (userId: string, updates: Partial<BusinessPlan>) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  loading: false,

  setProjects: (projects) => set({ projects }),
  setActiveProject: (activeProject) => set({ activeProject }),
  setLoading: (loading) => set({ loading }),

  refreshProjects: async (userId) => {
    if (!userId) {
      set({ projects: [], activeProject: null, loading: false });
      return;
    }
    set({ loading: true });
    try {
      // Fetch via standard HTTP GET so Serwist service worker can intercept and cache it
      const res = await fetch("/api/projects").then(r => r.json()).catch(err => {
        console.warn("API fetch failed, falling back to direct server action", err);
        return null;
      });

      let allProjects: BusinessPlan[] = [];

      if (res && res.success && res.projects) {
        allProjects = res.projects;
      } else {
        // Fallback to server action if fetch failed or returned error
        const { getUserProjectsAction } = await import("@/lib/project-actions");
        const actionRes = await getUserProjectsAction();
        if (actionRes.error) {
          console.error("Error fetching projects via server action:", actionRes.error);
          set({ loading: false });
          return;
        }
        allProjects = (actionRes.projects as BusinessPlan[]) || [];
      }
      
      set({ projects: allProjects });

      // Determine active project
      let selected = get().activeProject;
      if (selected && selected.id) {
         selected = allProjects.find((p) => p.id === selected!.id) || null;
      }
      
      if (!selected && allProjects.length > 0) {
        selected = [...allProjects].sort((a, b) => 
            new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        )[0];
      }

      set({ activeProject: selected });
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      set({ loading: false });
    }
  },

  createNewProject: async (userId, planData) => {
    set({ loading: true });
    try {
      const { createProjectAction } = await import("@/lib/project-actions");
      const res = await createProjectAction(planData);

      if (res.error || !res.success || !res.id) {
        throw new Error(res.error || "Failed to create project");
      }

      const newId = res.id;
      
      // Fetch fresh list
      const { getUserProjectsAction } = await import("@/lib/project-actions");
      const fetchRes = await getUserProjectsAction();
      
      if (fetchRes.error) throw new Error("Failed to refresh projects");
      
      let allProjects = (fetchRes.projects as BusinessPlan[]) || [];
      let newProject = allProjects.find(p => p.id === newId);
      
      if (!newProject) {
        newProject = {
          id: newId,
          userId,
          projectName: planData.projectName,
          tagline: planData.tagline,
          description: planData.description || "",
          data: planData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...planData 
        } as BusinessPlan;
        
        allProjects = [newProject, ...allProjects];
      }
      
      set({ projects: allProjects, activeProject: newProject });
      return newId;
    } catch (err) {
      console.error("❌ Error switching to new project:", err);
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  switchProject: (projectId) => {
    const { projects } = get();
    const target = projects.find(p => p.id === projectId);
    if (target) {
      set({ activeProject: target });
    }
  },

  updateActiveProject: async (userId, updates) => {
    const { activeProject } = get();
    if (!activeProject || !activeProject.id) return;
    
    // Optimistic Update
    const updatedProject = { ...activeProject, ...updates };
    set({
      activeProject: updatedProject,
      projects: get().projects.map(p => p.id === activeProject.id ? updatedProject : p)
    });

    // Save to Cloud
    if (typeof window !== "undefined" && !navigator.onLine) {
      const { addUpdateProjectToQueue } = await import("@/lib/offline-sync");
      addUpdateProjectToQueue(userId, activeProject.id, updates);
      return;
    }

    try {
      await savePlanToCloud(userId, updates as any, true, activeProject.id);
    } catch (err) {
      console.error("Failed to save project updates, queuing offline", err);
      const { addUpdateProjectToQueue } = await import("@/lib/offline-sync");
      addUpdateProjectToQueue(userId, activeProject.id, updates);
    }
  }
}));
