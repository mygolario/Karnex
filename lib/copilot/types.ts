// Copilot shared types — used across the workspace UI, store, and API.

export type CopilotMode = "cofounder" | "customer_bot" | "insights";

export type CopilotPersona = "startup" | "traditional" | "creator" | "default";

export type CopilotModelTier = "hard" | "fast";

export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface ToolCall {
  name: string;
  status: "success" | "error";
  result: unknown;
}

export interface CopilotMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  followUps?: string[];
  toolCall?: ToolCall;
  /** Server-assigned DB id once the message is persisted. */
  dbId?: string;
  /** Parent message id (for branching). */
  parentMessageId?: string | null;
}

/**
 * Mention types span every Karnex pillar so the composer can attach rich,
 * cross-feature context. New types are introduced incrementally per phase.
 */
export interface MentionItem {
  id: string;
  type:
    | "roadmap"
    | "canvas"
    | "slide"
    | "help"
    | "calendar"
    | "script"
    | "location"
    | "sponsor"
    | "idea"
    | "memory";
  title: string;
  subtitle: string;
  data: unknown;
  icon: string;
}

export interface PromptTemplate {
  icon: string;
  title: string;
  prompt: string;
  color: string;
}

export interface SlashCommand {
  command: string;
  label: string;
  description: string;
  icon: string;
}

export interface CopilotConversation {
  id: string;
  title: string;
  mode: CopilotMode;
  persona: CopilotPersona;
  model?: string;
  tier: CopilotModelTier;
  pinned: boolean;
  projectId?: string | null;
  lastMessagePreview?: string;
  lastMessageAt?: number;
  messageCount: number;
  createdAt?: number;
}

/** Shape returned by the conversations CRUD API. */
export interface CopilotConversationRow {
  id: string;
  title: string;
  mode: string;
  persona: string | null;
  model: string | null;
  pinned: boolean;
  projectId: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: number | null;
  messageCount: number;
  createdAt: number;
}

/** Shape returned when loading a conversation's messages. */
export interface CopilotMessageRow {
  id: string;
  role: string;
  content: string;
  followUps: string[] | null;
  toolCalls: ToolCall[] | null;
  parentMessageId: string | null;
  createdAt: number;
}

/** Shape returned by the insights API. */
export interface CopilotInsight {
  id: string;
  type: "gap" | "competitor" | "streak" | "decision" | "summary";
  priority: "info" | "warning" | "urgent";
  title: string;
  body: string;
  payload?: Record<string, any> | null;
  actionPayload?: {
    type: "open_copilot" | "open_page";
    label: string;
    href?: string;
    prefill?: string;
  } | null;
  status: "unread" | "read" | "dismissed" | "snoozed";
  createdAt: string;
}
