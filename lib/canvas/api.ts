"use client";

import type {
  CanvasState,
  CardData,
  CommentData,
  CanvasVersionData,
  CanvasType,
  CanvasViewport,
  CanvasConnection,
  CanvasViewMode,
} from "./types";
import {
  buildCanvasLayout,
  dbCardsToState,
  parseCanvasLayout,
  stateToSyncPayload,
} from "./persistence";

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
  layout?: unknown;
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
  const metadata = row.metadata as { tags?: string[]; isAIGenerated?: boolean } & Record<string, unknown> | null;
  const { tags, isAIGenerated, ...restMeta } = metadata || {};
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
    tags: tags as string[] | undefined,
    isAIGenerated: Boolean(isAIGenerated),
    metadata: restMeta && Object.keys(restMeta).length > 0 ? restMeta : undefined,
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

export const canvasApi = {
  async ensureCanvas(
    projectId: string,
    opts?: { projectType?: string; name?: string; type?: CanvasType }
  ): Promise<{ canvas: CanvasDetail; created: boolean }> {
    const res = await fetch(`${API_BASE}/${projectId}/canvas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(opts ?? {}),
    });
    if (!res.ok) throw new Error("Failed to ensure canvas");
    const data = await res.json();
    return { canvas: data.canvas as CanvasDetail, created: Boolean(data.created) };
  },

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

  async syncState(
    projectId: string,
    canvasId: string,
    state: CanvasState,
    connections: CanvasConnection[],
    viewMode: CanvasViewMode
  ): Promise<void> {
    const res = await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/cards`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        state,
        layout: buildCanvasLayout(connections, viewMode),
      }),
    });
    if (!res.ok) throw new Error("Failed to sync canvas state");
  },

  async saveCards(projectId: string, canvasId: string, state: CanvasState): Promise<void> {
    await this.syncState(projectId, canvasId, state, [], "grid");
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

  async restoreVersion(projectId: string, canvasId: string, versionId: string): Promise<CanvasState> {
    const res = await fetch(`${API_BASE}/${projectId}/canvas/${canvasId}/versions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ versionId }),
    });
    if (!res.ok) throw new Error("Failed to restore version");
    const data = await res.json();
    return data.state as CanvasState;
  },
};
