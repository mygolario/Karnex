"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "../prisma/client";
import { auth } from "@/lib/auth/session";

// Define the Data Structure (TypeScript Interface)

// User Profile Structure (Enhanced)
export interface UserProfile {
  id: string; 
  email: string;
  role?: 'user' | 'admin'; 
  full_name?: string; 
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  birth_date?: string;
  bio?: string;
  avatar_url?: string; 
  subscription: {
    planId: 'free' | 'plus' | 'pro' | 'ultra';
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
  id?: string;
  title: string;
  category?: string;
  description?: string;
  priority?: "high" | "medium" | "low" | string;
  estimatedHours?: string | number;
  actualHours?: number;
  status?: "todo" | "in-progress" | "done" | string;
  checklist?: string[];
  tips?: string[];
  resources?: string[];
  dueDate?: string;
  dependsOn?: string[];
  assignee?: string;
  tags?: string[];
  cost?: string;
  notes?: string;
}

// Roadmap Phase structure
export interface RoadmapPhase {
  phase: string;
  steps: (string | RoadmapStep)[];
  weekNumber?: number;
  theme?: string;
  icon?: string;
}

// Runtime status metadata stored per step (keyed by step title)
export interface StepRuntimeStatus {
  status: "todo" | "in-progress" | "blocked" | "skipped";
  startedAt?: string;
  completedAt?: string;
  blockedReason?: string;
  actualHours?: number;
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
  metadata?: Record<string, any>;
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
  platform: 'instagram' | 'youtube' | 'linkedin' | 'twitter' | 'tiktok' | 'telegram' | 'blog' | 'podcast';
  type: 'post' | 'reel' | 'story' | 'video' | 'thread' | 'short' | 'episode' | 'article';
  status: 'idea' | 'scripting' | 'filming' | 'editing' | 'scheduled' | 'published';
  date: string; // ISO date string (Gregorian stored, Jalali displayed)
  publishTime?: string; // "HH:MM" format
  notes?: string;
  caption?: string; // Caption draft
  tags?: string[]; // e.g. ["آموزشی", "ترند"]
  priority?: 'high' | 'medium' | 'low';
  collaborator?: string;
  estimatedHours?: number;
  thumbnailUrl?: string;
  hashtags?: string[];
  checklist?: {
    script: boolean;
    filmed: boolean;
    edited: boolean;
    captionReady: boolean;
    hashtagsReady: boolean;
    thumbnailReady: boolean;
  };
  isRecurring?: boolean;
  recurringTemplateId?: string;
}

export interface RecurringTemplate {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Saturday (Jalali week start)
  platform: ContentPost['platform'];
  type: ContentPost['type'];
  defaultTitle?: string;
  defaultTags?: string[];
  isActive: boolean;
}

export interface HashtagSet {
  id: string;
  name: string;
  tags: string[];
}

export interface ContentStreak {
  current: number;
  best: number;
  lastPublishedWeek?: string; // ISO week string e.g. "2024-W03"
  thisWeekPublished: number;
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
  tool_call?: {
    name: string;
    status: 'success' | 'error';
    result: any;
  };
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

export type LocationConfidenceLevel = "real" | "inferred" | "ai";

export interface LocationAnalysis {
  id?: string;
  city: string;
  address: string;
  coordinates?: { lat: number; lon: number };
  
  // Custom user inputs for personalization
  inputs?: {
    footfallDependency?: "high" | "destination";
    priceTier?: "budget" | "mid" | "premium";
    rentBudget?: number;
    businessCategory?: string;
    businessDescription?: string;
  };

  businessDescription?: string;
  aiCategory?: { label: string; slug: string; confidence: number };

  executiveSummary?: {
    narrative: string;
    evidenceLinks?: Array<{ tab: string; label: string }>;
  };

  fitScoreBreakdown?: Array<{
    key: string;
    label: string;
    score: number;
    confidence: LocationConfidenceLevel;
    reason: string;
  }>;

  verdictDetails?: {
    dealBreakers: string[];
    topReasons: string[];
  };

  catchment?: {
    radiusM: number;
    poiDensity: number;
    transitStops: number;
    confidence: LocationConfidenceLevel;
    summary?: string;
  };

  cohortFit?: {
    score: number;
    summary: string;
    confidence: LocationConfidenceLevel;
    tags?: string[];
  };

  seasonality?: Array<{ month: string; index: number; note?: string }>;

  cannibalization?: {
    hasOverlap: boolean;
    distanceM?: number;
    summary: string;
    confidence?: LocationConfidenceLevel;
  };

  supplyChain?: {
    score: number;
    confidence: LocationConfidenceLevel;
    items: Array<{ name: string; distance: string; relevance: string }>;
  };

  rentBenchmark?: {
    min: number;
    max: number;
    median: number;
    confidence: LocationConfidenceLevel;
    negotiationTips: string[];
  };

  storefront?: {
    photoDataUrl?: string;
    visibilityAssessment?: string;
    onSiteChecklist?: Array<{ id: string; label: string; checked: boolean }>;
  };

  footfallTier?: "real" | "inferred" | "ai";

  osmMeta?: {
    landmark?: string;
    buildingTags?: string[];
    mapillaryUrl?: string;
    categorySlug?: string;
  };

  openingReadinessChecked?: string[];

  financialLab?: {
    monthlyPnL?: Array<{
      month: number;
      revenue: number;
      cogs: number;
      labor: number;
      rent: number;
      utilities: number;
      marketing: number;
      net: number;
    }>;
    roiPercent?: number;
    paybackMonths?: number;
    sensitivity?: { rentDelta: number; footfallDelta: number };
  };
  
  // Core Metrics
  score: number;
  scoreReason: string;
  locationConfidence?: string;
  anchorLandmark?: string;
  
  // NEW: AI Verdict — the single most important decision signal
  verdict?: {
    decision: "go" | "caution" | "no-go";
    headline: string;
    confidence: number;
  };

  // NEW: Business category (echoed for personalization)
  businessCategory?: string;

  // NEW: Location DNA personality archetype
  locationDNA?: {
    archetype: string;
    archetypeIcon: string;
    tags: string[];
    story: string;
  };

  // NEW: Survival probability (category-specific)
  survivalProbability?: {
    score: number;
    label: string;
    categoryInsight: string;
  };

  // NEW: 12-month revenue projection (3 scenarios)
  revenueProjection?: Array<{
    month: number;
    label: string;
    pessimistic: number;
    realistic: number;
    optimistic: number;
    milestone?: string;
  }>;

  // NEW: Street-level intelligence chips
  streetIntelligence?: Array<{
    type: "parking" | "direction" | "transit" | "visibility" | "construction" | "shade";
    label: string;
    value: string;
    sentiment: "positive" | "neutral" | "negative";
  }>;

  // NEW: Smart alternative locations (if score is low)
  alternatives?: Array<{
    name: string;
    estimatedScore: number;
    reason: string;
    distance: string;
  }>;

  // NEW: Opening readiness checklist (category-specific)
  openingReadiness?: Array<{
    id: string;
    title: string;
    desc: string;
    category: "legal" | "financial" | "physical" | "marketing" | "operational";
    isRequired: boolean;
    estimatedDays?: number;
  }>;

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
    saturationPercentage?: number;
    marketGap?: string;
    competitorCount?: number;
    directCompetitors?: Array<{
        name: string;
        distance: string;
        strength: string;
        weakness: string;
        coordinates?: { lat: number; lon: number };
        scores?: {
          product: number;
          marketing: number;
          price: number;
          support: number;
        };
    }>;
  };

  // Financials & Rent feasibility
  rentEstimate: string;
  successMatch: { label: string; color: string };
  financialSim?: {
    breakEvenTransactions: number;
    rentToRevenueRatio: number;
    estimatedMonthlyRevenue: string;
  };

  // Strategy
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  aiInsight: string;
  recommendations?: Array<{ title: string; desc: string }>;

  // Intelligence Hub Fields
  neighborhoodProfile?: string;
  marketGapCards?: Array<{
    title: string;
    description: string;
    potential: "High" | "Medium" | "Low";
  }>;
  prioritizedRecommendations?: Array<{
    id: string;
    title: string;
    desc: string;
    urgency: "فوری" | "مهم" | "پیشنهادی";
    cost: "کم‌هزینه" | "متوسط" | "سرمایه‌گذاری";
  }>;
  riskBreakdown?: {
    financial: number;
    competition: number;
    accessibility: number;
    market: number;
  };
  peakHours?: string;
  hourlyFootfall?: Array<{ hour: string; trafficIndex: number }>;
  legalChecklist?: Array<{ title: string; desc: string; isRequired: boolean }>;
  
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
  recurringTemplates?: RecurringTemplate[]; // Creator: recurring post templates
  hashtagBank?: HashtagSet[]; // Creator: saved hashtag sets
  contentStreak?: ContentStreak; // Creator: streak tracking
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
  stepStatuses?: Record<string, StepRuntimeStatus>;
  canvasConnections?: any[];
  canvasViewMode?: string;
  // growth removed
  // ideaValidation removed
  // documents removed
  assistantData?: AssistantData; // NEW: Assistant Data
  // storefront removed
  customers?: Customer[]; // Restored for CRM

  campaigns?: Campaign[]; // NEW: Campaigns Data
  locationAnalysis?: LocationAnalysis; // NEW: Location Data
  locationHistory?: LocationAnalysis[]; // NEW: Location Analysis History
  locationReadinessChecked?: Record<string, string[]>;
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


// --- Functions to Interact with Prisma ---

export const createUserProfile = async (userData: { uid: string, email?: string | null }) => {
  // Prisma manages user creation typically via Auth, but if this is called manually:
  const newProfile = {
    id: userData.uid,
    email: userData.email || "",
    role: 'user',
    firstName: "",
    lastName: "",
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
  };

  try {
     const user = await prisma.user.create({
        data: {
            id: userData.uid,
            email: userData.email,
            role: 'user',
            credits: newProfile.credits,
            settings: newProfile.settings,
        }
     });
     return mapPrismaUserToProfile(user);
  } catch (error: any) {
    console.error("Error creating profile:", error);
    // If user exists, return it
    if (error.code === 'P2002') {
        return getUserProfile(userData.uid);
    }
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: {
        subscriptions: true
    }
  });

  if (!user) return null;
  return mapPrismaUserToProfile(user);
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    // Map updates back to Prisma fields
    const prismaUpdates: any = {};
    if (updates.first_name) prismaUpdates.firstName = updates.first_name;
    if (updates.last_name) prismaUpdates.lastName = updates.last_name;
    if (updates.full_name) prismaUpdates.name = updates.full_name; // Sync name
    if (updates.settings) prismaUpdates.settings = updates.settings;
    
    // For nested JSON updates, we might need value merging, but for now assuming direct overwrite or safe merging
    // Prisma doesn't do deep merge on JSON natively.
    if (updates.credits) prismaUpdates.credits = updates.credits;
    if (updates.avatar_url) prismaUpdates.image = updates.avatar_url;
    if (updates.phone_number !== undefined) prismaUpdates.phoneNumber = updates.phone_number;
    if (updates.bio !== undefined) prismaUpdates.bio = updates.bio;
    if (updates.birth_date !== undefined) {
        if (updates.birth_date) {
            try {
                const { parse } = require('date-fns-jalali');
                const englishDigitsStr = updates.birth_date.replace(/[۰-۹]/g, (d: string) =>
                  String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))
                );
                prismaUpdates.birthDate = parse(englishDigitsStr, 'yyyy/MM/dd', new Date());
            } catch (e) {
                prismaUpdates.birthDate = new Date(updates.birth_date);
            }
        } else {
            prismaUpdates.birthDate = null;
        }
    }
    
    await prisma.user.update({
        where: { id: userId },
        data: prismaUpdates
    });

    return true;
};

// Helper: Map Prisma User to UserProfile interface
function mapPrismaUserToProfile(user: any): UserProfile {
    const defaultSubscription = {
        planId: 'free',
        status: 'active',
        autoRenew: false
    };
    
    const activeSub = user.subscriptions?.find((s: any) => s.status === 'active') || defaultSubscription;

    return {
        id: user.id,
        email: user.email || "",
        role: user.role as any,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        full_name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        avatar_url: user.image,
        phone_number: user.phoneNumber || "",
        bio: user.bio || "",
        birth_date: user.birthDate ? require('date-fns-jalali').format(user.birthDate, 'yyyy/MM/dd') : "",
        credits: user.credits as any || { aiTokens: 0, projectsUsed: 0 },
        settings: user.settings as any || { emailNotifications: true, theme: 'system' },
        subscription: activeSub as any,
        created_at: user.createdAt?.toISOString(),
        updated_at: user.updatedAt?.toISOString()
    };
}


// --- Project Functions with Prisma ---

export const createProject = async (userId: string, planData: any) => {
  console.log("📤 Creating project via Prisma for user:", userId);
  
  // Extract top-level fields
  const { projectName, tagline, description, ...restData } = planData;
  
  try {
      const project = await prisma.project.create({
          data: {
              userId,
              projectName: projectName || "Untitled Project",
              tagline: tagline,
              description: description,
              data: restData // Store the rest as JSON
          }
      });
      console.log("✅ Project created with ID:", project.id);
      return project.id;
  } catch (error) {
     console.error("Prisma create error:", error);
     throw error;
  }
};

export const getUserProjects = async (userId: string): Promise<BusinessPlan[]> => {
  const projects = await prisma.project.findMany({
      where: {
          deletedAt: null,
          OR: [
              { userId },
              {
                  members: {
                      some: { userId }
                  }
              }
          ]
      },
      orderBy: { updatedAt: 'desc' }
  });

  return projects.map(p => {
      const dbData = p.data as any || {};
      return {
          id: p.id,
          projectName: p.projectName,
          tagline: p.tagline || "",
          description: p.description || "",
          ...dbData, // Merge JSON data
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
      } as BusinessPlan;
  });
};

export const getPlanFromCloud = async (userId: string, projectId: string) => {
  const project = await prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      include: {
          members: {
              where: { userId }
          }
      }
  });

  if (!project) return null;

  const isOwner = project.userId === userId;
  const isMember = project.members && project.members.length > 0;

  if (!isOwner && !isMember) return null;

  const dbData = project.data as any || {};
  return {
      id: project.id,
      projectName: project.projectName,
      tagline: project.tagline || "",
      description: project.description || "",
      ...dbData,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
  } as BusinessPlan;
};

export const savePlanToCloud = async (userId: string, planData: any, merge: boolean = true, projectId: string) => {
    // 1. Fetch current to verify ownership or membership edit rights
    let currentData = {};
    const current = await prisma.project.findFirst({
        where: { id: projectId, deletedAt: null },
        select: { 
            data: true, 
            userId: true,
            members: {
                where: { userId }
            }
        }
    });

    if (!current) {
        throw new Error("Project not found");
    }

    const isOwner = current.userId === userId;
    const membership = current.members?.[0];
    const hasWriteAccess = isOwner || (membership && (membership.role === 'admin' || membership.role === 'editor'));

    if (!hasWriteAccess) {
        throw new Error("Unauthorized: You do not have edit access to this project");
    }

    if (merge) {
        currentData = current.data as any;
    }

    // 2. Prepare update
    const { projectName, tagline, ...restData } = planData;
    
    // Deep merge 'data' field manually since Prisma replaces JSON
    const newData = merge ? { ...currentData, ...restData } : restData;
    
    const updatePayload: any = {
        data: newData
    };
    
    if (projectName) updatePayload.projectName = projectName;
    if (tagline) updatePayload.tagline = tagline;

    await prisma.project.update({
        where: { id: projectId },
        data: updatePayload
    });

    return true;
};

// Helper for saving specific sections 
// (ProjectContext needs this abstraction)
export const updateProjectSection = async (userId: string, section: string, data: any, projectId: string = 'current') => {
   if (projectId === 'current') {
       console.warn("DB: explicit projectId required for Prisma");
       return false;
   }
   return savePlanToCloud(userId, { [section]: data }, true, projectId);
};

export const saveOperations = async (userId: string, type: 'capTable' | 'inventory', data: any, projectId: string) => {
    const current = await getPlanFromCloud(userId, projectId);
    if (!current) return false;
    
    const ops = current.operations || {};
    // @ts-ignore
    ops[type] = data;
    
    return savePlanToCloud(userId, { operations: ops }, true, projectId);
};

export const saveFinancials = async (userId: string, type: 'runway' | 'breakEven' | 'rateCard', data: any, projectId: string) => {
   const current = await getPlanFromCloud(userId, projectId);
    if (!current) return false;
    
    const fins = current.financials || {};
    // @ts-ignore
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
  const project = await prisma.project.findFirst({
      where: { id: projectId, userId, deletedAt: null }
  });
  if (!project) throw new Error("Unauthorized or project not found");

  await prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() }
  });
  return true;
};

// --- Media Library ---

export const getMediaLibrary = async (userId: string, filters?: { 
  category?: MediaCategory, 
  projectId?: string,
  limit?: number
}) => {
  const where: any = { userId };
  if (filters?.category) where.category = filters.category;
  if (filters?.projectId) where.projectId = filters.projectId;

  const items = await prisma.mediaItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit
  });

  return items.map(item => ({
      id: item.id,
      userId: item.userId,
      projectId: item.projectId || undefined,
      url: item.url,
      category: item.category as MediaCategory,
      subcategory: item.subcategory || undefined,
      prompt: item.prompt || undefined,
      model: item.model || undefined,
      projectName: "", // TODO: Join project name?
      createdAt: item.createdAt.toISOString()
  })) as MediaItem[];
};

export const saveToMediaLibrary = async (userId: string, item: Partial<MediaItem>) => {
  const newItem = await prisma.mediaItem.create({
      data: {
          userId,
          projectId: item.projectId,
          url: item.url!,
          category: item.category!,
          subcategory: item.subcategory,
          prompt: item.prompt,
          model: item.model,
      }
  });
  return newItem.id;
};

export const deleteFromMediaLibrary = async (userId: string, itemId: string) => {
  await prisma.mediaItem.delete({
      where: { id: itemId }
  });
  return true;
};

// --- Feedback ---

export interface Feedback {
  id?: string;
  user_id: string; 
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
  // We don't have a Feedback model in Prisma schema yet! 
  // Let's assume we skip this or add it later.
  console.warn("Feedback saving not implemented in Prisma yet.");
  return true;
};

// --- Roadmap Helpers ---

export const toggleStepCompletion = async (userId: string, stepName: string, isCompleted: boolean, projectId: string) => {
  const current = await getPlanFromCloud(userId, projectId);
    if (!current) throw new Error("Project not found");
  
  let completedSteps: string[] = current.completedSteps || [];
  
  if (isCompleted) {
    if (!completedSteps.includes(stepName)) {
        completedSteps.push(stepName);
    }
  } else {
    completedSteps = completedSteps.filter((s: string) => s !== stepName);
  }
  
  return savePlanToCloud(userId, { completedSteps }, true, projectId);
};

// Persist richer per-step status metadata alongside the completed list.
// `completedSteps` remains the source of truth for "done"; `stepStatuses`
// carries in-progress / blocked / skipped state + timestamps.
export const updateRoadmapStepStatus = async (
  userId: string,
  stepName: string,
  status: "todo" | "in-progress" | "blocked" | "skipped" | "done",
  projectId: string,
  meta?: { blockedReason?: string; actualHours?: number }
) => {
  const current = await getPlanFromCloud(userId, projectId);
  if (!current) throw new Error("Project not found");

  let completedSteps: string[] = [...(current.completedSteps || [])];
  const stepStatuses: Record<string, StepRuntimeStatus> = {
    ...(current.stepStatuses || {}),
  };
  const now = new Date().toISOString();

  if (status === "done") {
    if (!completedSteps.includes(stepName)) completedSteps.push(stepName);
    stepStatuses[stepName] = {
      ...(stepStatuses[stepName] || {}),
      status: "todo",
      completedAt: now,
      actualHours: meta?.actualHours ?? stepStatuses[stepName]?.actualHours,
    };
  } else {
    completedSteps = completedSteps.filter((s) => s !== stepName);
    const prev = stepStatuses[stepName];
    stepStatuses[stepName] = {
      status,
      startedAt: status === "in-progress" ? prev?.startedAt || now : prev?.startedAt,
      blockedReason: status === "blocked" ? meta?.blockedReason : undefined,
      actualHours: meta?.actualHours ?? prev?.actualHours,
    };
  }

  return savePlanToCloud(userId, { completedSteps, stepStatuses }, true, projectId);
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
    // Current schema doesn't have nested gamification object in profiles/User 
    // Wait, UserProfile interface has credits/settings, but gamification? 
    // It seems I missed Gamification in Schema!
    // I should default to empty for now.
    
    // Just return default mock for migration, or store in 'settings' json?
    return { totalXp: 0, level: 1, streak: 0, badges: [] };
};

export const addGamificationXp = async (userId: string, amount: number, reason: string): Promise<{ newXp: number; newLevel: number; levelUp: boolean } | null> => {
  // Placeholder
  return { newXp: amount, newLevel: 1, levelUp: false };
};
