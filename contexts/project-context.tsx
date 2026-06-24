"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { BusinessPlan, savePlanToCloud, createProject } from "@/lib/db";
import { useRouter, usePathname } from "next/navigation";

import { useProjectStore } from "@/lib/store/project-store";

interface ProjectContextType {
  projects: BusinessPlan[];
  activeProject: BusinessPlan | null;
  loading: boolean;
  refreshProjects: () => Promise<void>;
  createNewProject: (planData: any) => Promise<string>; // Returns ID
  switchProject: (projectId: string) => void;
  updateActiveProject: (updates: Partial<BusinessPlan>) => void; // Update active project in-place
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
    updateActiveProject: storeUpdate
  } = useProjectStore();

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
    storeSwitch(projectId);
  };

  // Replay offline queue on online
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = async () => {
      console.log("PWA: Device is online. Replaying queued mutations...");
      const { replayOfflineQueue } = await import("@/lib/offline-sync");
      const success = await replayOfflineQueue();
      if (success) {
        await refreshProjects();
      }
    };

    window.addEventListener("online", handleOnline);
    
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [user?.id]);

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
