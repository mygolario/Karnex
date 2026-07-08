export type TourPersona = "founder" | "creator" | "marketer" | "general";

export type TourExperienceLevel = "beginner" | "intermediate" | "pro";

export type TourPrimaryGoal =
  | "validate-idea"
  | "grow-audience"
  | "raise-funding"
  | "launch-product"
  | "just-exploring";

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
  /** Subscription tier, e.g. "free" | "plus" | "pro" | "ultra" */
  subscriptionPlan?: string;
  /** App-level role, e.g. "user" | "admin" */
  role?: string;
  experienceLevel?: TourExperienceLevel;
  primaryGoal?: TourPrimaryGoal;
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
  /** Restrict step to specific subscription tiers, e.g. ["free"] to only show upsell steps to free users */
  plans?: string[];
  /** Restrict step to specific app roles, e.g. ["admin"] */
  roles?: string[];
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
  /** Rough estimate shown in the Tour Hub, e.g. "۲ دقیقه" */
  estimatedTime?: string;
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
  experienceLevel: TourExperienceLevel | null;
  primaryGoal: TourPrimaryGoal | null;
  hasSeenWelcome: boolean;
  disableAutoStart: boolean;
  activeTourId: string | null;
  activeStepIndex: number;
  lastSeenWhatsNewVersion: string | null;
  /** Last project type the tour set was personalized for; used to detect drift and offer re-personalization */
  lastKnownProjectType: string | null;
  /** Last subscription tier seen; used to detect upgrades/downgrades for re-personalization */
  lastKnownPlan: string | null;
  /** Timestamp (ms) this state was last written, used to reconcile with server copy */
  updatedAt: number;
}

export interface ResolvedTarget {
  rect: DOMRect;
  element: Element;
}
