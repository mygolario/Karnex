export type TourPersona = "founder" | "creator" | "marketer" | "general";

export type MascotMood = "welcome" | "tip" | "action" | "success" | "idle" | "celebrate";

export type TourStepType = "info" | "interactive" | "pro-tip" | "centered";

export type TourPosition = "top" | "bottom" | "left" | "right" | "auto";

export type TourAccent =
  | "indigo"
  | "violet"
  | "emerald"
  | "amber"
  | "sky"
  | "rose"
  | "fuchsia"
  | "teal"
  | "primary";

export interface TourMedia {
  type: "image" | "gif" | "video";
  src: string;
  alt?: string;
}

export interface TourStepContext {
  persona: TourPersona;
  planId?: string;
  projectType?: string;
  subscriptionPlan?: string;
  hasProjectData?: boolean;
}

export interface TourStep {
  id: string;
  target?: string;
  title: string;
  description: string;
  type?: TourStepType;
  route?: string;
  position?: TourPosition;
  offset?: number;
  mood?: MascotMood;
  media?: TourMedia;
  proTip?: string;
  /** CSS selector or data-tour-id for interactive steps */
  actionTarget?: string;
  /** Event to listen for on actionTarget (default: click) */
  actionEvent?: string;
  showIf?: (ctx: TourStepContext) => boolean;
  personas?: TourPersona[];
}

export interface TourDefinition {
  id: string;
  title: string;
  description: string;
  accent: TourAccent;
  route: string;
  helpCenterHref?: string;
  xpReward: number;
  checklistItem?: boolean;
  personas?: TourPersona[];
  projectTypes?: ("startup" | "traditional" | "creator")[];
  steps: TourStep[];
  version?: string;
}

export interface ChecklistItem {
  id: string;
  tourId: string;
  title: string;
  description: string;
  xpReward: number;
  order: number;
  personas?: TourPersona[];
  projectTypes?: ("startup" | "traditional" | "creator")[];
}

export interface TourPersistedState {
  completedTours: string[];
  skippedTours: string[];
  completedChecklistItems: string[];
  dismissedBeacons: string[];
  persona: TourPersona | null;
  hasSeenWelcome: boolean;
  disableAutoStart: boolean;
  activeTourId: string | null;
  activeStepIndex: number;
  lastSeenWhatsNewVersion: string | null;
}

export interface ResolvedTarget {
  rect: DOMRect;
  element: Element;
}
