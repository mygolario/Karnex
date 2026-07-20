"use client";

import { useEffect, useRef } from "react";
import { useProject } from "@/contexts/project-context";
import {
  buildCanvasSummaryForRoadmap,
  isMeaningfulRoadmap,
  needsRoadmapRepair,
} from "@/lib/roadmap/quality";

/**
 * Legacy repair for projects stuck with empty/padded/generating roadmaps.
 * New Genesis waits for a full ready roadmap before create; this only
 * repairs older incomplete projects (or failed retries via «تلاش مجدد»).
 * Runs each 8-week chunk as its own server action to stay under Vercel maxDuration.
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

        const { generateRoadmapChunkAction } = await import(
          "@/lib/project-actions"
        );

        const slimCore = {
          projectName: project.projectName,
          overview: project.overview || "",
          canvasSummary: buildCanvasSummaryForRoadmap(project),
        };

        const chunkArgs = {
          idea: project.ideaInput || "",
          projectType: project.projectType,
          genesisAnswers: project.genesisAnswers as
            | Record<string, string>
            | undefined,
          corePlan: slimCore,
        };

        // Sequential client-side calls → separate serverless budgets.
        const first = await generateRoadmapChunkAction({
          ...chunkArgs,
          weekStart: 1,
          weekEnd: 8,
        });
        if (inFlightRef.current !== projectId) return;

        if (first.error || !first.roadmap) {
          await updateActiveProject({ roadmapStatus: "failed" });
          return;
        }

        const second = await generateRoadmapChunkAction({
          ...chunkArgs,
          weekStart: 9,
          weekEnd: 16,
        });
        if (inFlightRef.current !== projectId) return;

        if (second.error || !second.roadmap) {
          await updateActiveProject({ roadmapStatus: "failed" });
          return;
        }

        const roadmap = [...first.roadmap, ...second.roadmap];
        if (!isMeaningfulRoadmap(roadmap)) {
          await updateActiveProject({ roadmapStatus: "failed" });
          return;
        }

        await updateActiveProject({
          roadmap,
          roadmapStatus: "ready",
        });
      } catch (err) {
        console.error("Background roadmap generation failed:", err);
        if (inFlightRef.current === projectId) {
          try {
            await updateActiveProject({ roadmapStatus: "failed" });
          } catch {
            // best-effort status write
          }
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
