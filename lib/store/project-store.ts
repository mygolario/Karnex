import { create } from "zustand";
import { BusinessPlan, savePlanToCloud } from "@/lib/db";
import { repairMisalignedProjectName } from "@/lib/roadmap/align-project-name";

async function fetchProjectDetail(projectId: string): Promise<BusinessPlan | null> {
  const res = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.project as BusinessPlan;
}

/** Fix roadmap/overview copy that still uses an AI-invented brand name. */
async function maybeRepairProjectName(
  userId: string | undefined,
  project: BusinessPlan
): Promise<BusinessPlan> {
  const { plan, changed } = repairMisalignedProjectName(
    project as unknown as Record<string, unknown>
  );
  if (!changed) return project;

  const repaired = plan as unknown as BusinessPlan;
  const ownerId = userId || (project as BusinessPlan & { userId?: string }).userId;
  if (!ownerId || !project.id) return repaired;

  // Persist only content fields — avoid writing client metadata into JSON `data`.
  const {
    id: _id,
    userId: _uid,
    createdAt: _ca,
    updatedAt: _ua,
    ...content
  } = repaired as BusinessPlan & {
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  try {
    await savePlanToCloud(ownerId, content, true, project.id);
  } catch (err) {
    console.error("Failed to persist project-name alignment repair:", err);
  }
  return repaired;
}

interface ProjectState {
  projects: BusinessPlan[];
  activeProject: BusinessPlan | null;
  loading: boolean;

  setProjects: (projects: BusinessPlan[]) => void;
  setActiveProject: (project: BusinessPlan | null) => void;
  setLoading: (loading: boolean) => void;

  refreshProjects: (userId?: string, options?: { silent?: boolean }) => Promise<void>;
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

  refreshProjects: async (userId, options) => {
    if (!userId) {
      set({ projects: [], activeProject: null, loading: false });
      return;
    }
    const silent = options?.silent === true;
    if (!silent) {
      set({ loading: true });
    }
    try {
      const response = await fetch("/api/projects", { cache: "no-store" });
      if (response.status === 401 || response.status === 403) {
        // Stale client session — treat as logged out; do not spam server actions.
        set({ projects: [], activeProject: null, loading: false });
        return;
      }

      const res = await response.json().catch(() => null);

      let summaries: BusinessPlan[] = [];

      if (res?.success && res.projects) {
        summaries = res.projects;
      } else if (response.ok) {
        const { getUserProjectsAction } = await import("@/lib/project-actions");
        const actionRes = await getUserProjectsAction();
        if (actionRes.error) {
          if (actionRes.error !== "Unauthorized") {
            console.error("Error fetching projects:", actionRes.error);
          }
          set({ loading: false });
          return;
        }
        summaries = (actionRes.projects as BusinessPlan[]) || [];
      } else {
        set({ loading: false });
        return;
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
          const repaired = await maybeRepairProjectName(userId, full);
          set({
            activeProject: repaired,
            projects: summaries.map((p) => (p.id === repaired.id ? repaired : p)),
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
        const err = new Error(
          (typeof res.message === "string" && res.message) ||
            res.error ||
            "Failed to create project"
        ) as Error & { limitKind?: "project" | "ai"; limitReached?: boolean };
        if (res.limitReached) {
          err.limitKind = "project";
          err.limitReached = true;
        }
        throw err;
      }

      const newId = res.id;
      try {
        const { trackProductEvent } = await import("@/lib/analytics/product");
        trackProductEvent("project_created", {
          project_id: newId,
          project_type:
            typeof planData?.projectType === "string"
              ? planData.projectType
              : typeof planData?.type === "string"
                ? planData.type
                : undefined,
        });
      } catch {
        // analytics must never break project creation
      }

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
    // Empty roadmap + generating status must still refresh when chunks finish.
    if (
      activeProject?.id === projectId &&
      (activeProject.roadmap?.length ?? 0) > 0 &&
      activeProject.roadmapStatus !== "generating"
    ) {
      return;
    }

    const cached = projects.find((p) => p.id === projectId);
    if (
      cached &&
      (cached.roadmap?.length ?? 0) > 0 &&
      cached.roadmapStatus !== "generating"
    ) {
      set({ activeProject: cached });
      return;
    }

    set({ loading: true });
    try {
      const full = await fetchProjectDetail(projectId);
      if (full) {
        const ownerId = (full as BusinessPlan & { userId?: string }).userId;
        const repaired = await maybeRepairProjectName(ownerId, full);
        set({
          activeProject: repaired,
          projects: projects.map((p) => (p.id === projectId ? repaired : p)),
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
