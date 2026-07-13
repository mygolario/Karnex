"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { BusinessPlan } from "@/lib/db";
import { useProjectStore } from "@/lib/store/project-store";
import { useShallow } from "zustand/react/shallow";

interface ProjectContextType {
  projects: BusinessPlan[];
  activeProject: BusinessPlan | null;
  loading: boolean;
  refreshProjects: () => Promise<void>;
  createNewProject: (planData: any) => Promise<string>; // Returns ID
  switchProject: (projectId: string) => void;
  updateActiveProject: (updates: Partial<BusinessPlan>) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  activeProject: null,
  loading: true,
  refreshProjects: async () => {},
  createNewProject: async () => "",
  switchProject: () => {},
  updateActiveProject: () => {},
});

export const useProject = () => useContext(ProjectContext);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const {
    projects,
    activeProject,
    loading,
    refreshProjects: storeRefresh,
    createNewProject: storeCreate,
    switchProject: storeSwitch,
    updateActiveProject: storeUpdate,
  } = useProjectStore(
    useShallow((s) => ({
      projects: s.projects,
      activeProject: s.activeProject,
      loading: s.loading,
      refreshProjects: s.refreshProjects,
      createNewProject: s.createNewProject,
      switchProject: s.switchProject,
      updateActiveProject: s.updateActiveProject,
    }))
  );

  // Load Projects on Auth
  useEffect(() => {
    storeRefresh(user?.id);
  }, [user?.id, storeRefresh]);

  const refreshProjects = async () => {
    await storeRefresh(user?.id);
  };

  const createNewProject = async (planData: any) => {
    if (!user?.id) throw new Error("User not found");
    return storeCreate(user.id, planData);
  };

  const switchProject = (projectId: string) => {
    void storeSwitch(projectId);
  };

  // Replay offline queue on online — silent refresh avoids unmounting dashboard pages.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastReplayAt = 0;

    const handleOnline = async () => {
      const now = Date.now();
      if (now - lastReplayAt < 3000) return;
      lastReplayAt = now;


      console.log("PWA: Device is online. Replaying queued mutations...");
      const { replayOfflineQueue } = await import("@/lib/offline-sync");
      const success = await replayOfflineQueue();
      if (success) {
        await storeRefresh(user?.id, { silent: true });
      }
    };

    window.addEventListener("online", handleOnline);

    if (navigator.onLine) {
      void handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [user?.id, storeRefresh]);

  const updateActiveProject = async (updates: Partial<BusinessPlan>) => {
    if (!user?.id) return;
    await storeUpdate(user.id, updates);
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
