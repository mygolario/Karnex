export type CanvasType = "BMC" | "LEAN" | "BRAND" | "SWOT" | "EMPATHY" | "VPC" | "OKR";

export type CanvasViewMode = "grid" | "freeform";

export interface CanvasConnection {
  id: string;
  fromId: string; // cardId
  toId: string;   // cardId
  label?: string;
  color?: string;
}

export type CardType = "NOTE" | "CHECKLIST" | "IMAGE" | "LINK" | "METRIC" | "VOTE";

export type CardColor =
  | "yellow"
  | "blue"
  | "green"
  | "pink"
  | "purple"
  | "cyan"
  | "red"
  | "orange"
  | "indigo"
  | "rose"
  | "violet"
  | "emerald"
  | "amber";

export interface CardData {
  id: string;
  section: string;
  content: string;
  cardType: CardType;
  color: CardColor;
  order: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  tags?: string[];
  isAIGenerated?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommentData {
  id: string;
  canvasId: string;
  cardId?: string | null;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  body: string;
  resolved: boolean;
  parentId?: string | null;
  createdAt: string;
}

export interface CanvasVersionData {
  id: string;
  canvasId: string;
  name?: string;
  snapshot: Record<string, CardData[]>;
  createdBy?: string;
  createdAt: string;
}

export interface CanvasViewport {
  zoom: number;
  panX: number;
  panY: number;
}

export type CanvasState = Record<string, CardData[]>;

export interface CanvasSectionDef {
  id: string;
  title: string;
  icon: string;
  color: CardColor;
  area: string;
  description?: string;
}

export interface CanvasTemplate {
  type: CanvasType;
  name: string;
  nameFa: string;
  description: string;
  sections: CanvasSectionDef[];
  gridTemplateAreas: string;
  gridTemplateColumns: string;
  gridTemplateRows: string;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

export type ToolType =
  | "select"
  | "sticky"
  | "text"
  | "pen"
  | "arrow"
  | "eraser"
  | "image"
  | "ai";

export type RightPanelTab = "properties" | "comments" | "history" | "ai";
