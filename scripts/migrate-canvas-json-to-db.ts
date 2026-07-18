/**
 * One-time migration: Project.data JSON canvas → Prisma Canvas/Card tables.
 * Usage: npx tsx scripts/migrate-canvas-json-to-db.ts
 */
import prisma from "../lib/prisma";
import { migrateLegacyState } from "../lib/canvas/store";
import { stateToSyncPayload, buildCanvasLayout, defaultCanvasTypeForProject } from "../lib/canvas/persistence";
import type { CanvasConnection, CanvasViewMode } from "../lib/canvas/types";

interface ProjectData {
  leanCanvas?: Record<string, unknown>;
  brandCanvas?: Record<string, unknown>;
  canvasConnections?: CanvasConnection[];
  canvasViewMode?: CanvasViewMode;
  projectType?: string;
}

async function migrateProject(projectId: string, data: ProjectData, projectType?: string) {
  const isBrand = projectType === "creator";
  const source = isBrand ? data.brandCanvas : data.leanCanvas;
  if (!source || Object.keys(source).length === 0) {
    console.log(`  skip ${projectId}: no canvas JSON`);
    return;
  }

  let canvas = await prisma.canvas.findFirst({
    where: { projectId },
    include: { cards: true },
  });

  if (!canvas) {
    const canvasType = defaultCanvasTypeForProject(projectType);
    canvas = await prisma.canvas.create({
      data: {
        projectId,
        name: "بوم کسب‌وکار",
        type: canvasType,
        layout: buildCanvasLayout(
          data.canvasConnections || [],
          data.canvasViewMode || "grid"
        ) as object,
      },
      include: { cards: true },
    });
  }

  if (canvas.cards.length > 0) {
    console.log(`  skip ${projectId}: already has ${canvas.cards.length} DB cards`);
    return;
  }

  const canvasType = canvas.type as Parameters<typeof migrateLegacyState>[1];
  const state = migrateLegacyState(source, canvasType);
  const syncCards = stateToSyncPayload(state);

  for (const card of syncCards) {
    await prisma.card.create({
      data: {
        id: card.id,
        canvasId: canvas.id,
        section: card.section,
        content: card.content,
        cardType: card.cardType,
        color: card.color,
        order: card.order,
        x: card.x,
        y: card.y,
        width: card.width,
        height: card.height,
        metadata: card.metadata ? (card.metadata as object) : undefined,
      },
    });
  }

  await prisma.canvas.update({
    where: { id: canvas.id },
    data: {
      layout: buildCanvasLayout(
        data.canvasConnections || [],
        data.canvasViewMode || "grid"
      ) as object,
    },
  });

  console.log(`  migrated ${projectId}: ${syncCards.length} cards`);
}

async function main() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    select: { id: true, data: true },
  });

  console.log(`Found ${projects.length} projects`);
  for (const project of projects) {
    const data = (project.data ?? {}) as ProjectData;
    const projectType = data.projectType as string | undefined;
    await migrateProject(project.id, data, projectType);
  }
  console.log("Migration complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
