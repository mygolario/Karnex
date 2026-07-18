import type { CanvasState, CardData, CanvasConnection, CanvasViewMode, CanvasType } from "./types";

export interface CanvasLayoutData {
  connections?: CanvasConnection[];
  viewMode?: CanvasViewMode;
}

export interface SyncCardPayload {
  id: string;
  section: string;
  content: string;
  cardType: string;
  color: string;
  order: number;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  metadata?: Record<string, unknown> | null;
}

export function stateToSyncPayload(state: CanvasState): SyncCardPayload[] {
  const cards: SyncCardPayload[] = [];
  for (const [section, sectionCards] of Object.entries(state)) {
    for (const card of sectionCards) {
      cards.push({
        id: card.id,
        section,
        content: card.content,
        cardType: card.cardType,
        color: card.color,
        order: card.order,
        x: card.x ?? null,
        y: card.y ?? null,
        width: card.width ?? null,
        height: card.height ?? null,
        metadata: {
          tags: card.tags,
          isAIGenerated: card.isAIGenerated,
          ...(card.metadata ?? {}),
        },
      });
    }
  }
  return cards;
}

export function dbCardsToState(
  rows: Array<{
    id: string;
    section: string;
    content: string;
    cardType: string;
    color: string;
    order: number;
    x: number | null;
    y: number | null;
    width: number | null;
    height: number | null;
    metadata: unknown;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }>
): CanvasState {
  const state: CanvasState = {};
  for (const row of rows) {
    if (!state[row.section]) state[row.section] = [];
    const meta = (row.metadata ?? {}) as Record<string, unknown>;
    const { tags, isAIGenerated, ...restMeta } = meta;
    state[row.section].push({
      id: row.id,
      section: row.section,
      content: row.content,
      cardType: row.cardType as CardData["cardType"],
      color: row.color as CardData["color"],
      order: row.order,
      x: row.x ?? undefined,
      y: row.y ?? undefined,
      width: row.width ?? undefined,
      height: row.height ?? undefined,
      tags: Array.isArray(tags) ? (tags as string[]) : undefined,
      isAIGenerated: Boolean(isAIGenerated),
      metadata: Object.keys(restMeta).length > 0 ? restMeta : undefined,
      createdBy: row.createdBy ?? undefined,
      updatedBy: row.updatedBy ?? undefined,
      createdAt: row.createdAt ? String(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? String(row.updatedAt) : undefined,
    });
  }
  for (const section of Object.keys(state)) {
    state[section].sort((a, b) => a.order - b.order);
  }
  return state;
}

export function parseCanvasLayout(layout: unknown): CanvasLayoutData {
  if (!layout || typeof layout !== "object") return {};
  const l = layout as Record<string, unknown>;
  return {
    connections: Array.isArray(l.connections) ? (l.connections as CanvasConnection[]) : [],
    viewMode: l.viewMode === "freeform" ? "freeform" : "grid",
  };
}

export function buildCanvasLayout(
  connections: CanvasConnection[],
  viewMode: CanvasViewMode
): CanvasLayoutData {
  return { connections, viewMode };
}

export function countCardsInState(state: CanvasState): number {
  return Object.values(state).reduce((sum, cards) => sum + cards.length, 0);
}

export function defaultCanvasTypeForProject(projectType?: string): CanvasType {
  if (projectType === "creator") return "BRAND";
  return "BMC";
}
