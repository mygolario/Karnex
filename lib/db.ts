import { createClient } from "@/lib/supabase";

// Define the Data Structure (TypeScript Interface)

// User Profile Structure (Enhanced)
export interface UserProfile {
  id: string; // Changed from uid to id to match Supabase
  email: string;
  role?: 'user' | 'admin'; // Added role
  full_name?: string; // Changed from displayName
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  bio?: string;
  avatar_url?: string; // Changed from photoURL
  subscription: {
    planId: 'free' | 'plus' | 'pro';
    status: 'active' | 'expired' | 'canceled';
    startDate?: string;
    endDate?: string;
    autoRenew?: boolean;
    provider?: 'zibal' | 'zarinpal' | 'manual';
  };
  credits: {
    aiTokens: number;
    projectsUsed: number;
  };
  settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: 'fa' | 'en';
  };
  created_at: string;
  updated_at: string;
}

// ... existing interfaces (Keep them as is for now, will map to JSONB)
// Roadmap Step detailed structure
export interface RoadmapStep {
  title: string;
  category?: string;
  description?: string;
  priority?: string;
  estimatedHours?: string | number;
}

// Roadmap Phase structure
export interface RoadmapPhase {
  phase: string;
  steps: (string | RoadmapStep)[];
  weekNumber?: number;
  theme?: string;
}

// Logo concept structure
export interface LogoConcept {
  conceptName: string;
  description: string;
  imageUrl?: string;
}

// Sub-task structure for roadmap
export interface SubTask {
  parentStep: string;
  text: string;
  isCompleted: boolean;
  order?: number; // Added order
}

// Competitor structure
export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
  channel: string;
}

// Legal advice structure
export interface LegalAdvice {
  requirements: { title: string; description: string; priority: string }[];
  permits: string[];
  tips: string[];
}

// Color mood image for color story
export interface ColorMoodImage {
  color: string;
  imageUrl: string;
  prompt: string;
}

// Pattern item for pattern library
export interface BrandPattern {
  id: string;
  name: string;
  style: 'geometric' | 'gradient' | 'abstract' | 'organic';
  imageUrl: string;
  prompt: string;
}

// Mockup item for brand applications
export interface BrandMockup {
  id: string;
  type: 'tshirt' | 'mug' | 'tote_bag' | 'phone_case' | 'letterhead' | 'business_card' | 'envelope' | 'instagram' | 'linkedin' | 'whatsapp';
  category: 'product' | 'stationery' | 'social';
  imageUrl: string;
  prompt: string;
}

// Brand Kit structure (Extended with AI image fields)
export interface BrandKit {
  primaryColorHex: string;
  secondaryColorHex: string;
  colorPsychology: string;
  suggestedFont: string;
  logoConcepts: LogoConcept[];
  // New AI-generated image fields
  heroImageUrl?: string;
  heroPrompt?: string;
  colorMoodImages?: ColorMoodImage[];
  patterns?: BrandPattern[];
  mockups?: BrandMockup[];
  brandBookCoverUrl?: string;
  brandBookCoverPrompt?: string;
  // Typography & Icons
  typographySpecimenUrl?: string;
  icons?: {
    id: string;
    name: string;
    imageUrl: string;
    prompt: string
  }[];

  // ===== NEW: Brand Wizard & Studio Fields =====

  // Wizard completion status
  wizardCompleted?: boolean;

  // Wizard answers (for context-aware regeneration)
  wizardData?: {
    industry: string;
    brandPersonality: string[];  // ["professional", "friendly", "innovative"]
    targetAudience: string;
    preferredColors: string[];
    logoStyle: string;           // "minimal" | "emblem" | "wordmark" | "abstract"
    desiredFeeling: string;      // "trust" | "excitement" | "calm" | "luxury"
    competitors: string[];
    completedAt: string;
  };

  // Brand Voice
  brandVoice?: {
    tone: string;
    personality: string;
    sampleCaptions: string[];
    taglineVariations: string[];
  };

  // Logo variations
  logoVariations?: {
    primary?: string;      // Main logo URL
    secondary?: string;    // Alternative logo
    icon?: string;         // Icon-only version
    wordmark?: string;     // Text-only version
  };

  // Brand completeness score (0-100)
  completenessScore?: number;
}

// Card structure for Sticky Note Canvas
export interface CanvasCard {
  id: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'cyan' | 'red' | 'orange';
  order?: number;
}

// Business Model Canvas structure (9-block Osterwalder BMC)
// Backward compatible: allows string (legacy) or CanvasCard[] (new)
export type CanvasSectionContent = string | CanvasCard[];

export interface LeanCanvas {
  // Original 4 blocks (Lean Canvas)
  problem: CanvasSectionContent;
  solution: CanvasSectionContent;
  uniqueValue: CanvasSectionContent;
  revenueStream: CanvasSectionContent;
  // New blocks for full BMC
  customerSegments?: CanvasSectionContent;
  customerRelations?: CanvasSectionContent;
  keyActivities?: CanvasSectionContent;
  keyResources?: CanvasSectionContent;
  keyPartners?: CanvasSectionContent;
  costStructure?: CanvasSectionContent;
  channels?: CanvasSectionContent;
  unfairAdvantage?: CanvasSectionContent;
  keyMetrics?: CanvasSectionContent;
}

// Media Kit structure (For Creators)
export interface SocialStat {
  platform: 'instagram' | 'youtube' | 'twitter' | 'tiktok' | 'linkedin' | 'twitch' | 'other';
  handle: string;
  followers: string;
  engagement?: string;
}

export interface ServiceRate {
  title: string;
  price: string;
  description?: string;
}

export interface MediaKit {
  displayName: string;
  bio: string;
  contactEmail: string;
  niche: string;
  socialStats: SocialStat[];
  services: ServiceRate[];
  themeColor: string;
  profileImage?: string; // URL or base64 placeholder
  // New Fields for Redesign
  partners?: string[]; // List of brand names
  audience?: {
    male: number;
    female: number;
    topAge: string;
    topLocations: string[];
  };
  globalStats?: {
    totalFollowers?: number;
    avgEngagement?: number;
    monthlyReach?: number;
  };
}

// Permit structure (For Traditional Businesses)
export interface PermitItem {
  id: string;
  title: string;
  issuingAuthority: string;
  cost: string;
  status: 'not_started' | 'in_progress' | 'done';
  notes?: string;
  priority: 'high' | 'medium' | 'low';
}

// Pitch Deck structure (For Startups)
export interface PitchDeckSlide {
  id: string;
  type: 'title' | 'problem' | 'solution' | 'market' | 'business_model' | 'traction' | 'team' | 'ask' | 'generic' | string;
  title: string;
  bullets: string[];
  notes?: string;
  isHidden?: boolean;
}

// SWOT Analysis structure (For Traditional Businesses)
export interface SWOTAnalysis {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

// Brand Canvas structure (For Creators)
export interface BrandCanvas {
  niche: string;
  audienceAvatar: string;
  contentPillars: string;
  revenueChannels: string;
}

// --- Idea Validator Structures ---
// Removed


// --- Financial Tools ---

// Startup: Runway Calculator
export interface RunwayCalculation {
  currentCash: number;
  monthlyBurn: number;
  monthlyRevenue: number;
  runwayMonths: number;
  lastUpdated: string;
}

// Traditional: Break-Even
export interface BreakEvenAnalysis {
  fixedCosts: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
  lastUpdated: string;
}

// Creator: Rate Card
export interface ServicePackage {
  title: string;
  deliverables: string;
  price: number;
}

export interface RateCard {
  packages: ServicePackage[];
  currency: string;
  terms: string;
  lastUpdated: string;
}

// --- Operational Tools ---

// Startup: Cap Table Lite
export interface Shareholder {
  id: string;
  name: string;
  role: 'founder' | 'investor' | 'employee' | 'advisor';
  shares: number;
  investedAmount?: number;
}

export interface CapTable {
  totalShares: number;
  shareholders: Shareholder[];
  valuation: number;
  lastUpdated: string;
}

// Traditional: Inventory Tracker - Removed

// Creator: Content Calendar
export interface ContentPost {
  id: string;
  title: string;
  platform: 'instagram' | 'youtube' | 'linkedin' | 'twitter' | 'blog';
  type: 'post' | 'reel' | 'story' | 'video' | 'thread';
  status: 'idea' | 'scripting' | 'filming' | 'editing' | 'scheduled' | 'published';
  date: string; // ISO date string
  notes?: string;
}

// GeneratedDocument Removed

export interface AssistantData {
  messages: ChatMessage[];
  streak: number;
  totalXp: number;
  lastVisit?: string;
  missions?: DailyMission[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  followUps?: string[];
  xpReward?: number;
  actions?: ActionCard[]; 
}

export type ActionType =
  | "update_canvas"
  | "add_roadmap_step"
  | "generate_content"
  | "analyze_competitors"
  | "improve_strategy";

export interface ActionCard {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  preview?: string;
  targetField?: string;
  newValue?: string;
  xpReward: number;
  
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  type: 'quick_win' | 'growth' | 'learning' | 'action';
  actionPrompt?: string;
  expiresAt?: string;
}

// --- Storefront Builder Structures - Removed

// --- Customer CRM Structures ---
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  tags: string[];
  totalSpend: number;
  lastVisit: string;
  createdAt: string;
  email?: string;
  notes?: string;
}

// --- Location Analyzer Structures ---

export interface LocationAnalysis {
  id?: string;
  city: string;
  address: string;
  
  // Core Metrics
  score: number;
  scoreReason: string;
  locationConfidence?: string;
  anchorLandmark?: string;
  
  metrics?: {
    footfallIndex: "High" | "Medium" | "Low";
    spendPower: "High" | "Medium" | "Low";
    riskRewardRatio: number;
    competitionDensity: "High" | "Medium" | "Low";
  };

  // Demographics
  population?: string;
  populationDesc?: string;
  demographics: Array<{ label: string; percent: number; color: string }>;

  // Market & Competitors
  competitorAnalysis?: {
    saturationLevel?: string;
    marketGap?: string;
    competitorCount?: number;
    directCompetitors?: Array<{
        name: string;
        distance: string;
        strength: string;
        weakness: string;
    }>;
  };

  // Financials
  rentEstimate: string;
  successMatch: { label: string; color: string };

  // Strategy
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  aiInsight: string;
  recommendations?: Array<{ title: string; desc: string }>;
  
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: "birthday" | "followup" | "loyalty" | "feedback" | "custom";
  status: "active" | "draft" | "completed";
  message?: string;
  sentCount: number;
  openRate: number;
  createdAt: string;
}

// Main Business Plan interface
export interface BusinessPlan {
  id?: string;
  projectName: string;
  tagline: string;
  description?: string; // Added for AI context
  template?: string;    // Added for AI context
  overview: string;
  leanCanvas: LeanCanvas;
  swotAnalysis?: SWOTAnalysis; // Traditional
  brandCanvas?: BrandCanvas; // Creator
  contentCalendar?: ContentPost[]; // Creator (Moved to top level)
  financials?: {
    runway?: RunwayCalculation;
    breakEven?: BreakEvenAnalysis;
    rateCard?: RateCard;
  };
  operations?: {
    capTable?: CapTable;
    // inventory removed
  };
  brandKit: BrandKit;
  roadmap: RoadmapPhase[];
  marketingStrategy: string[];
  competitors: Competitor[];
  legalAdvice?: LegalAdvice;
  mediaKit?: MediaKit; // Creator
  permits?: PermitItem[]; // Traditional
  pitchDeck?: PitchDeckSlide[]; // Startup
  budget: string;
  audience: string;
  ideaInput?: string;
  projectType: 'startup' | 'traditional' | 'creator';
  genesisAnswers?: Record<string, any>;
  completedSteps?: string[];
  // growth removed
  // ideaValidation removed
  // documents removed
  assistantData?: AssistantData; // NEW: Assistant Data
  // storefront removed
  customers?: Customer[]; // Restored for CRM

  campaigns?: Campaign[]; // NEW: Campaigns Data
  locationAnalysis?: LocationAnalysis; // NEW: Location Data
  subTasks?: SubTask[];
  createdAt: string;
  updatedAt?: string;
}

// Media Library Items
export type MediaCategory = 'logo' | 'pattern' | 'mockup' | 'hero' | 'color_mood' | 'social' | 'cover';

export interface MediaItem {
  id: string;
  userId: string;
  projectId?: string;
  url: string;
  category: MediaCategory;
  subcategory?: string; // E.g., 'instagram_story'
  prompt?: string;
  model?: string;
  projectName?: string;
  createdAt: string;
}

// --- Admin & System Logging ---

export interface SystemLog {
  id: string;
  type: 'auth' | 'project' | 'error' | 'admin' | 'subscription';
  action: string;
  details?: string;
  userId?: string;
  userEmail?: string;
  timestamp: string;
  ip?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  activeSubscriptions: number;
  totalRevenue: number; // Mock or calc
}


// --- Functions to Interact with Supabase ---

export const createUserProfile = async (userData: { uid: string, email?: string | null }) => {
  const supabase = createClient();
  
  const newProfile: any = {
    id: userData.uid,
    email: userData.email || "",
    role: 'user',
    subscription: {
      planId: 'free',
      status: 'active',
      autoRenew: false
    },
    credits: {
      aiTokens: 10,
      projectsUsed: 0
    },
    settings: {
      emailNotifications: true,
      smsNotifications: false,
      theme: 'system',
      language: 'fa'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('profiles')
    .insert(newProfile);

  if (error) {
    console.error("Error creating profile:", error.message, error.code, error.details, error.hint, JSON.stringify(error));
    // Try fetching in case it was created concurrently
    return getUserProfile(userData.uid);
  }

  return newProfile as UserProfile;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // PGRST116 is "not found"
         console.error("Error fetching profile:", error.message, error.code, error.details, error.hint, JSON.stringify(error));
    }
    return null;
  }
  return data as UserProfile;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
  return true;
};

// --- Project Functions with JSONB ---

export const createProject = async (userId: string, planData: any) => {
  console.log("📤 Creating project via API for user:", userId);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
  
  try {
    const res = await fetch("/api/create-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, planData }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log("✅ Project created with ID:", data.id);
    return data.id;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Project creation timed out. Please try again.");
    }
    throw error;
  }
};

export const getUserProjects = async (userId: string): Promise<BusinessPlan[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error.message, error.code, error.details, error.hint, JSON.stringify(error));
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    ...p.data,
    // Ensure critical fields are synced
    projectName: p.project_name,
    tagline: p.tagline,
    updatedAt: p.updated_at,
    createdAt: p.created_at
  }));
};

export const getPlanFromCloud = async (userId: string, projectId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error("Error fetching plan:", error);
    return null;
  }

  return {
    id: data.id,
    ...data.data,
    projectName: data.project_name,
    tagline: data.tagline,
    updatedAt: data.updated_at,
    createdAt: data.created_at
  } as BusinessPlan;
};

export const savePlanToCloud = async (userId: string, planData: any, merge: boolean = true, projectId: string) => {
    const supabase = createClient();

    // Prepare update data
    // Supabase needs "patch" style for deep JSON updates if we want to merge, 
    // but typically we overwrite the JSON blob OR use jsonb_set logic.
    // For simplicity, we fetch-merge-save or just rely on 'data' replacements if granular updates aren't critical.
    // Given the previous Firebase logic, it was often deep updates. 
    
    // Strategy: Fetch current data if merge is true, merge in memory, then save.
    // Or if Supabase client supports deep merge? accessing jsonb keys is possible but strict.
    
    // We will do a READ - MERGE - WRITE to be safe for now, 
    // or just update specific top level keys if `planData` is robust.
    
    // IMPORTANT: If `planData` is big, this might be heavy.
    
    // Let's assume `planData` contains the parts we want to update.
    
    // 1. Fetch current
    const { data: currentProject } = await supabase
        .from('projects')
        .select('data, project_name, tagline')
        .eq('id', projectId)
        .single();
    
    if (!currentProject) throw new Error("Project not found");
    
    const newData = merge ? { ...currentProject.data, ...planData } : planData;
    
    // Sync top fields if present
    const updates: any = {
        data: newData,
        updated_at: new Date().toISOString()
    };
    
    if (planData.projectName) updates.project_name = planData.projectName;
    if (planData.tagline) updates.tagline = planData.tagline;
    
    const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);
        
    if (error) throw error;
    return true;
};

// Helper for saving specific sections (Backward compat wrapper around savePlanToCloud)
const updateProjectSection = async (userId: string, section: string, data: any, projectId: string = 'current') => {
   // Warning: 'current' logic needs to be handled by caller (ProjectContext) to resolve to ID.
   // DB layer should prefer explicit IDs.
   if (projectId === 'current') {
       console.warn("DB: explicit projectId required for Supabase");
       return false;
   }
   return savePlanToCloud(userId, { [section]: data }, true, projectId);
};

export const saveOperations = async (userId: string, type: 'capTable' | 'inventory', data: any, projectId: string) => {
    // operations is a nested field. We need to construct the update object structure.
    // simpler to just call savePlanToCloud with the nested structure?
    // Structure: { operations: { [type]: data } }
    
    // But we need to be careful not to wipe other operation fields if we do flat merge.
    // The READ-MERGE-WRITE in savePlanToCloud handles this since we pass { operations: ... }
    // Wait, { operations: { capTable: ... } } passed to savePlanToCloud
    // checks: merge=true -> newData = { ...oldData, ...planData }
    // oldData.operations might be overwriten by planData.operations if we are not careful about deep merge.
    // Spread operator ... is shallow! 
    
    // FIX: We need deep merge or specific path updates.
    // For now, let's just do a specific fetch-merge here to be safe.
    
    const supabase = createClient();
    const { data: current } = await supabase.from('projects').select('data').eq('id', projectId).single();
    if (!current) return false;
    
    const ops = current.data.operations || {};
    ops[type] = data;
    
    return savePlanToCloud(userId, { operations: ops }, true, projectId);
};

// Similar wrappers for other specific saves
export const saveFinancials = async (userId: string, type: 'runway' | 'breakEven' | 'rateCard', data: any, projectId: string) => {
    const supabase = createClient();
    const { data: current } = await supabase.from('projects').select('data').eq('id', projectId).single();
    if (!current) return false;
    
    const fins = current.data.financials || {};
    fins[type] = data;
    
    return savePlanToCloud(userId, { financials: fins }, true, projectId);
};

export const saveMediaKit = async (userId: string, mediaKitData: any, projectId: string) => {
    return savePlanToCloud(userId, { mediaKit: mediaKitData }, true, projectId);
};

export const saveLegalAdvice = async (userId: string, legalData: any, projectId: string) => {
    return savePlanToCloud(userId, { legalAdvice: legalData }, true, projectId);
};

export const savePermits = async (userId: string, permits: any[], projectId: string) => {
    return savePlanToCloud(userId, { permits: permits }, true, projectId);
};

export const savePitchDeck = async (userId: string, deck: any[], projectId: string) => {
    return savePlanToCloud(userId, { pitchDeck: deck }, true, projectId);
};

export const saveSWOT = async (userId: string, swot: SWOTAnalysis, projectId: string) => {
    return savePlanToCloud(userId, { swotAnalysis: swot }, true, projectId);
};

export const saveBrandCanvas = async (userId: string, canvas: BrandCanvas, projectId: string) => {
    return savePlanToCloud(userId, { brandCanvas: canvas }, true, projectId);
};

export const deleteProject = async (userId: string, projectId: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);
    
  if (error) throw error;
  return true;
};

// --- Media Library ---

export const getMediaLibrary = async (userId: string, filters?: { 
  category?: MediaCategory, 
  projectId?: string,
  limit?: number
}) => {
  const supabase = createClient();
  let query = supabase
    .from('media_library')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.projectId) query = query.eq('project_id', filters.projectId);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching media:", error);
    return [];
  }
  
  return data.map((item: any) => ({
      ...item,
      // flatten meta if needed or keep as is
      prompt: item.meta?.prompt,
      model: item.meta?.model,
      projectName: item.meta?.projectName,
      subcategory: item.meta?.subcategory
  })) as MediaItem[];
};

export const saveToMediaLibrary = async (userId: string, item: Partial<MediaItem>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('media_library')
    .insert({
      user_id: userId,
      project_id: item.projectId,
      url: item.url!,
      category: item.category!,
      meta: {
          prompt: item.prompt,
          model: item.model,
          subcategory: item.subcategory,
          projectName: item.projectName
      }
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
};

export const deleteFromMediaLibrary = async (userId: string, itemId: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('media_library')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

// --- Feedback ---

export interface Feedback {
  id?: string;
  user_id: string; // or 'anonymous'
  user_email?: string;
  rating: number;
  category: string;
  comment: string;
  page: string;
  user_agent: string;
  created_at?: string;
  status: 'new' | 'read' | 'archived';
}

export const saveFeedback = async (feedback: Feedback) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('feedback')
    .insert({
      user_id: feedback.user_id,
      user_email: feedback.user_email,
      rating: feedback.rating,
      category: feedback.category,
      comment: feedback.comment,
      page: feedback.page,
      user_agent: feedback.user_agent,
      status: 'new',
      created_at: new Date().toISOString()
    });

  if (error) throw error;
  return true;
};

// --- Roadmap Helpers ---

export const toggleStepCompletion = async (userId: string, stepName: string, isCompleted: boolean, projectId: string) => {
  // We need to fetch current completedSteps, update, and save.
  const supabase = createClient();
  
  // 1. Fetch current project data to get completedSteps
  const { data: currentProject, error } = await supabase
    .from('projects')
    .select('data')
    .eq('id', projectId)
    .single();
    
  if (error || !currentProject) {
      console.error("Error fetching project for toggleStep:", error);
      throw new Error("Project not found");
  }
  
  let completedSteps: string[] = currentProject.data.completedSteps || [];
  
  if (isCompleted) {
    if (!completedSteps.includes(stepName)) {
        completedSteps.push(stepName);
    }
  } else {
    completedSteps = completedSteps.filter((s: string) => s !== stepName);
  }
  
  // 2. Save updated list
  return savePlanToCloud(userId, { completedSteps }, true, projectId);
};

// --- Gamification ---

export interface GamificationProfile {
  totalXp: number;
  level: number;
  streak: number;
  badges: string[];
  lastActive?: string;
}

const XP_PER_LEVEL = 100;

export const getGamificationProfile = async (userId: string): Promise<GamificationProfile> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('gamification')
    .eq('id', userId)
    .single();

  if (error || !data?.gamification) {
    return { totalXp: 0, level: 1, streak: 0, badges: [] };
  }

  return data.gamification as GamificationProfile;
};

export const addGamificationXp = async (userId: string, amount: number, reason: string): Promise<{ newXp: number; newLevel: number; levelUp: boolean } | null> => {
  const supabase = createClient();
  
  const current = await getGamificationProfile(userId);
  const newXp = current.totalXp + amount;
  const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
  const levelUp = newLevel > current.level;

  const updated: GamificationProfile = {
    ...current,
    totalXp: newXp,
    level: newLevel,
    lastActive: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('profiles')
    .update({ gamification: updated, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error("Failed to save XP:", error);
    return null;
  }

  return { newXp, newLevel, levelUp };
};
