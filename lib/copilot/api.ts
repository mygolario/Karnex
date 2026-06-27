"use client";

import type {
  CopilotConversation,
  CopilotConversationRow,
  CopilotMessage,
  CopilotMessageRow,
  CopilotMode,
  CopilotPersona,
  CopilotModelTier,
} from "./types";

function rowToConversation(row: CopilotConversationRow): CopilotConversation {
  return {
    id: row.id,
    title: row.title,
    mode: (row.mode as CopilotMode) || "cofounder",
    persona: (row.persona as CopilotPersona) || "default",
    model: row.model || undefined,
    tier: "hard",
    pinned: row.pinned,
    projectId: row.projectId,
    lastMessagePreview: row.lastMessagePreview || undefined,
    lastMessageAt: row.lastMessageAt || undefined,
    messageCount: row.messageCount,
    createdAt: row.createdAt,
  };
}

function rowToMessage(row: CopilotMessageRow): CopilotMessage {
  const toolCalls = Array.isArray(row.toolCalls) ? row.toolCalls : null;
  return {
    id: row.id,
    dbId: row.id,
    role: (row.role as CopilotMessage["role"]) || "assistant",
    content: row.content,
    timestamp: row.createdAt,
    followUps: Array.isArray(row.followUps) ? row.followUps : undefined,
    toolCall: toolCalls && toolCalls.length > 0 ? toolCalls[0] : undefined,
    parentMessageId: row.parentMessageId,
  };
}

export const copilotApi = {
  /** List conversations for the current user, optionally scoped to a project. */
  async listConversations(projectId?: string): Promise<CopilotConversation[]> {
    const url = projectId
      ? `/api/copilot/conversations?projectId=${encodeURIComponent(projectId)}`
      : `/api/copilot/conversations`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load conversations");
    const data = await res.json();
    return (data.conversations as CopilotConversationRow[]).map(rowToConversation);
  },

  /** Create a new conversation. Returns the created conversation. */
  async createConversation(input: {
    projectId?: string;
    mode?: CopilotMode;
    persona?: CopilotPersona;
    tier?: CopilotModelTier;
    title?: string;
  }): Promise<CopilotConversation> {
    const res = await fetch(`/api/copilot/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Failed to create conversation");
    const data = await res.json();
    return rowToConversation(data.conversation as CopilotConversationRow);
  },

  /** Load full message history for a conversation. */
  async getMessages(conversationId: string): Promise<CopilotMessage[]> {
    const res = await fetch(`/api/copilot/conversations/${conversationId}`);
    if (!res.ok) throw new Error("Failed to load messages");
    const data = await res.json();
    return (data.messages as CopilotMessageRow[]).map(rowToMessage);
  },

  /** Update conversation metadata (title, pinned, mode, persona). */
  async updateConversation(
    conversationId: string,
    updates: { title?: string; pinned?: boolean; mode?: CopilotMode; persona?: CopilotPersona }
  ): Promise<void> {
    const res = await fetch(`/api/copilot/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update conversation");
  },

  /** Delete a conversation and all its messages. */
  async deleteConversation(conversationId: string): Promise<void> {
    const res = await fetch(`/api/copilot/conversations/${conversationId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete conversation");
  },
};
