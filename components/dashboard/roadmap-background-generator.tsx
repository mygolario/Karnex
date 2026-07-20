"use client";

import { useEffect, useRef } from "react";
import { useProject } from "@/contexts/project-context";
import { needsRoadmapRepair } from "@/lib/roadmap/quality";

/**
 * Repair path for projects stuck with empty/padded roadmaps.
 * New Genesis waits for a full roadmap before create; this only
 * repairs legacy incomplete projects.
 */
export function RoadmapBackgroundGenerator() {
  const { activeProject, updateActiveProject } = useProject();
  const inFlightRef = useRef<string | null>(null);

  useEffect(() => {
    const project = activeProject;
    if (!project?.id) return;
    if (project.roadmapStatus === "failed") return;
    if (!needsRoadmapRepair(project)) return;
    if (inFlightRef.current === project.id) return;

    inFlightRef.current = project.id;
    const projectId = project.id;

    void (async () => {
      try {
        if (project.roadmapStatus !== "generating") {
          await updateActiveProject({
            roadmap: [],
            roadmapStatus: "generating",
          });
        }

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
    activeProject?.roadmap,
    activeProject?.ideaInput,
    activeProject?.projectType,
    activeProject?.projectName,
    activeProject?.overview,
    activeProject?.genesisAnswers,
    updateActiveProject,
  ]);

  return null;
}
