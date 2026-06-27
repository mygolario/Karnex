"use client";

import type {
  CanvasState,
  CardData,
  CommentData,
  CanvasVersionData,
  CanvasType,
  CanvasViewport,
} from "./types";

const API_BASE = "/api/projects";

interface CanvasRow {
  id: string;
  projectId: string;
  name: string;
  type: string;
  viewport: unknown;
  createdAt: string;
  updatedAt: string;
  _count?: { cards: number; comments: number };
}

interface CanvasDetail extends CanvasRow {
  cards: CardRow[];
  comments: CommentRow[];
  versions: VersionRow[];
}

interface CardRow {
  id: string;
  canvasId: string;
  section: string;
  order: number;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  content: string;
  cardType: string;
  color: string;
  metadata: unknown;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CommentRow {
  id: string;
  canvasId: string;
  cardId: string | null;
  authorId: string;
  authorName: string | null;
  authorAvatar: string | null;
  body: string;
  resolved: boolean;
  parentId: string | null;
  createdAt: string;
}

interface VersionRow {
  id: string;
  canvasId: string;
  name: string | null;
  snapshot: unknown;
  createdBy: string | null;
  createdAt: string;
}

function cardRowToData(row: CardRow): CardData {
  const metadata = row.metadata as { tags?: string[]; isAIGenerated?: boolean } | null;
  return {
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
    tags: metadata?.tags,
    isAIGenerated: metadata?.isAIGenerated,
    createdBy: row.createdBy ?? undefined,
    updatedBy: row.updatedBy ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function commentRowToData(row: CommentRow): CommentData {
  return {
    id: row.id,
    canvasId: row.canvasId,
    cardId: row.cardId,
    authorId: row.authorId,
    authorName: row.authorName || undefined,
    authorAvatar: row.authorAvatar || undefined,
    body: row.body,
    resolved: row.resolved,
    parentId: row.parentId,
    createdAt: row.createdAt,
  };
}

function versionRowToData(row: VersionRow): CanvasVersionData {
  return {
    id: row.id,
    canvasId: row.canvasId,
    name: row.name || undefined,
    snapshot: row.snapshot as Record<string, CardData[]>,
    createdBy: row.createdBy || undefined,
    createdAt: row.createdAt,
  };
}

function stateToCardRows(state: CanvasState): Array<Omit<CardRow, "id" | "canvasId" | "createdAt" | "updatedAt">> {
  const rows: Array<Omit<CardRow, "id" | "canvasId" | "createdAt" | "updatedAt">> = [];
  for (const [section, cards] of Object.entries(state)) {
    for (const card of cards) {
      rows.push({
        section,
        order: card.order,
        x: card.x ?? null,
        y: card.y ?? null,
        width: card.width ?? null,
        height: card.height ?? null,
        content: card.content,
        cardType: card.cardType,
        color: card.color,
        metadata: { tags: card.tags, isAIGenerated: card.isAIGenerated },
        createdBy: card.createdBy ?? null,
        updatedBy: card.updatedBy ?? null,
      });
    }
  }
  return rows;
}

export const canvasApi = {
  async listCanvases(projectId: string): Promise<CanvasRow[]> {
    const res = await fetch(`${API_BASE}/${projectId}/canvas`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to list canvases");
    const data = await res.json();
    return data.canvases as CanvasRow[];
  },

  async getCanvas(projectId: string, canvasId: string): Promise<{ canvas: CanvasDetail; state: CanvasState; comments: CommentData[]; versions: CanvasVersionData[] }> {
    const res = await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to get canvas");
    const data = await res.json();
    const canvas = data.canvas as CanvasDetail;

    const state: CanvasState = {};
    for (const card of canvas.cards) {
      if (!state[card.section]) state[card.section] = [];
      state[card.section].push(cardRowToData(card));
    }

    return {
      canvas,
      state,
      comments: canvas.comments.map(commentRowToData),
      versions: canvas.versions.map(versionRowToData),
    };
  },

  async createCanvas(projectId: string, name: string, type: CanvasType): Promise<CanvasRow> {
    const res = await fetch(`${API_BASE}/${projectId}/canvas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, type }),
    });
    if (!res.ok) throw new Error("Failed to create canvas");
    const data = await res.json();
    return data.canvas as CanvasRow;
  },

  async updateCanvas(projectId: string, canvasId: string, updates: { name?: string; type?: CanvasType; viewport?: CanvasViewport }): Promise<void> {
    await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
  },

  async deleteCanvas(projectId: string, canvasId: string): Promise<void> {
    await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}`, {
      method: "DELETE",
      credentials: "include",
    });
  },

  async saveCards(projectId: string, canvasId: string, state: CanvasState): Promise<void> {
    const cardRows = stateToCardRows(state).map((r, i) => ({ ...r, id: `temp-${i}`, ...r }));
    await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/cards`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cards: cardRows }),
    });
  },

  async addCard(projectId: string, canvasId: string, card: Omit<CardData, "id">): Promise<CardData> {
    const res = await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(card),
    });
    if (!res.ok) throw new Error("Failed to add card");
    const data = await res.json();
    return cardRowToData(data.card as CardRow);
  },

  async deleteCard(projectId: string, canvasId: string, cardId: string): Promise<void> {
    await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/cards?cardId=${cardId}`, {
      method: "DELETE",
      credentials: "include",
    });
  },

  async getComments(projectId: string, canvasId: string): Promise<CommentData[]> {
    const res = await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/comments`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to get comments");
    const data = await res.json();
    return (data.comments as CommentRow[]).map(commentRowToData);
  },

  async addComment(projectId: string, canvasId: string, body: string, cardId?: string, parentId?: string): Promise<CommentData> {
    const res = await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body, cardId, parentId }),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    const data = await res.json();
    return commentRowToData(data.comment as CommentRow);
  },

  async resolveComment(projectId: string, canvasId: string, commentId: string, resolved: boolean): Promise<void> {
    await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/comments`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ commentId, resolved }),
    });
  },

  async deleteComment(projectId: string, canvasId: string, commentId: string): Promise<void> {
    await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/comments?commentId=${commentId}`, {
      method: "DELETE",
      credentials: "include",
    });
  },

  async getVersions(projectId: string, canvasId: string): Promise<CanvasVersionData[]> {
    const res = await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/versions`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to get versions");
    const data = await res.json();
    return (data.versions as VersionRow[]).map(versionRowToData);
  },

  async createVersion(projectId: string, canvasId: string, name?: string): Promise<CanvasVersionData> {
    const res = await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create version");
    const data = await res.json();
    return versionRowToData(data.version as VersionRow);
  },

  async restoreVersion(projectId: string, canvasId: string, versionId: string): Promise<void> {
    await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/versions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ versionId }),
    });
  },
};
