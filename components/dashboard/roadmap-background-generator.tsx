"use client";

import { useEffect, useRef } from "react";
import { useProject } from "@/contexts/project-context";

/**
 * When Genesis creates a project with roadmapStatus === "generating",
 * finish both roadmap chunks in parallel and merge into the active project.
 */
export function RoadmapBackgroundGenerator() {
  const { activeProject, updateActiveProject } = useProject();
  const inFlightRef = useRef<string | null>(null);

  useEffect(() => {
    const project = activeProject;
    if (!project?.id) return;
    if (project.roadmapStatus !== "generating") return;
    if ((project.roadmap?.length ?? 0) > 0) return;
    if (inFlightRef.current === project.id) return;

    inFlightRef.current = project.id;
    const projectId = project.id;

    void (async () => {
      try {
        const { completeGenesisRoadmapAction } = await import(
          "@/lib/project-actions"
        );
        const result = await completeGenesisRoadmapAction({
          projectId,
          idea: project.ideaInput || "",
          projectType: project.projectType,
          genesisAnswers: project.genesisAnswers as
            | Record<string, string>
            | undefined,
          projectName: project.projectName,
          overview: project.overview || "",
        });

        // Only apply if this project is still the one we started for.
        if (inFlightRef.current !== projectId) return;

        if (result.error || !result.roadmap) {
          await updateActiveProject({ roadmapStatus: "failed" });
          return;
        }

        await updateActiveProject({
          roadmap: result.roadmap,
          roadmapStatus: "ready",
        });
      } catch (err) {
        console.error("Background roadmap generation failed:", err);
        if (inFlightRef.current === projectId) {
          await updateActiveProject({ roadmapStatus: "failed" });
        }
      } finally {
        if (inFlightRef.current === projectId) {
          inFlightRef.current = null;
        }
      }
    })();
  }, [
    activeProject?.id,
    activeProject?.roadmapStatus,
    activeProject?.roadmap?.length,
    activeProject?.ideaInput,
    activeProject?.projectType,
    activeProject?.projectName,
    activeProject?.overview,
    activeProject?.genesisAnswers,
    updateActiveProject,
  ]);

  return null;
}
