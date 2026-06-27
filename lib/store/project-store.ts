import { create } from "zustand";
import { BusinessPlan, savePlanToCloud } from "@/lib/db";

async function fetchProjectDetail(projectId: string): Promise<BusinessPlan | null> {
  const res = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.project as BusinessPlan;
}

interface ProjectState {
  projects: BusinessPlan[];
  activeProject: BusinessPlan | null;
  loading: boolean;

  setProjects: (projects: BusinessPlan[]) => void;
  setActiveProject: (project: BusinessPlan | null) => void;
  setLoading: (loading: boolean) => void;

  refreshProjects: (userId?: string) => Promise<void>;
  createNewProject: (userId: string, planData: Record<string, unknown>) => Promise<string>;
  switchProject: (projectId: string) => Promise<void>;
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
      const res = await fetch("/api/projects", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null);

      let summaries: BusinessPlan[] = [];

      if (res?.success && res.projects) {
        summaries = res.projects;
      } else {
        const { getUserProjectsAction } = await import("@/lib/project-actions");
        const actionRes = await getUserProjectsAction();
        if (actionRes.error) {
          console.error("Error fetching projects:", actionRes.error);
          set({ loading: false });
          return;
        }
        summaries = (actionRes.projects as BusinessPlan[]) || [];
      }

      set({ projects: summaries });

      let selectedId = get().activeProject?.id;
      if (selectedId && !summaries.find((p) => p.id === selectedId)) {
        selectedId = undefined;
      }
      if (!selectedId && summaries.length > 0) {
        selectedId = [...summaries].sort(
          (a, b) =>
            new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        )[0].id;
      }

      if (selectedId) {
        const full = await fetchProjectDetail(selectedId);
        if (full) {
          set({
            activeProject: full,
            projects: summaries.map((p) => (p.id === full.id ? full : p)),
          });
        } else {
          set({ activeProject: summaries.find((p) => p.id === selectedId) || null });
        }
      } else {
        set({ activeProject: null });
      }
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
      const full = await fetchProjectDetail(newId);

      if (full) {
        set((state) => ({
          projects: [full, ...state.projects.filter((p) => p.id !== newId)],
          activeProject: full,
        }));
      } else {
        await get().refreshProjects(userId);
      }

      return newId;
    } catch (err) {
      console.error("Error creating project:", err);
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  switchProject: async (projectId) => {
    const { projects, activeProject } = get();
    if (activeProject?.id === projectId && activeProject.roadmap) {
      return;
    }

    const cached = projects.find((p) => p.id === projectId);
    if (cached?.roadmap) {
      set({ activeProject: cached });
      return;
    }

    set({ loading: true });
    try {
      const full = await fetchProjectDetail(projectId);
      if (full) {
        set({
          activeProject: full,
          projects: projects.map((p) => (p.id === projectId ? full : p)),
        });
      }
    } finally {
      set({ loading: false });
    }
  },

  updateActiveProject: async (userId, updates) => {
    const { activeProject } = get();
    if (!activeProject?.id) return;

    const updatedProject = { ...activeProject, ...updates };
    set({
      activeProject: updatedProject,
      projects: get().projects.map((p) =>
        p.id === activeProject.id ? updatedProject : p
      ),
    });

    if (typeof window !== "undefined" && !navigator.onLine) {
      const { addUpdateProjectToQueue } = await import("@/lib/offline-sync");
      addUpdateProjectToQueue(userId, activeProject.id, updates);
      return;
    }

    try {
      await savePlanToCloud(userId, updates as Partial<BusinessPlan>, true, activeProject.id);
    } catch (err) {
      console.error("Failed to save project updates, queuing offline", err);
      const { addUpdateProjectToQueue } = await import("@/lib/offline-sync");
      addUpdateProjectToQueue(userId, activeProject.id, updates);
    }
  },
}));
