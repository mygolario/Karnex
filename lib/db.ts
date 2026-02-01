import {
  doc,
  setDoc,
  getDoc,
  getDocFromCache,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  addDoc
} from "firebase/firestore";
import { db, appId } from "@/lib/firebase";

// Define the Data Structure (TypeScript Interface)

// User Profile Structure (Enhanced)
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isPhoneVerified?: boolean;
  dateOfBirth?: string; // ISO date
  bio?: string;
  photoURL?: string;
  role: 'user' | 'admin';
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
  createdAt: string;
  updatedAt: string;
}

// ... existing interfaces


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
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'cyan';
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
  // New 5 blocks for full BMC
  customerSegments?: CanvasSectionContent;
  keyActivities?: CanvasSectionContent;
  keyResources?: CanvasSectionContent;
  keyPartners?: CanvasSectionContent;
  costStructure?: CanvasSectionContent;
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
  type: 'title' | 'problem' | 'solution' | 'market' | 'business_model' | 'traction' | 'team' | 'ask';
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

// Traditional: Inventory Tracker
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number; // Low stock alert level
  unitPrice: number;
  status: 'ok' | 'low' | 'out';
}

// Creator: Content Calendar
export interface ContentPost {
  id: string;
  title: string;
  platform: 'instagram' | 'youtube' | 'linkedin' | 'twitter' | 'blog';
  status: 'idea' | 'scripting' | 'filming' | 'editing' | 'scheduled' | 'published';
  date: string; // ISO date string
  notes?: string;
}

// Main Business Plan interface
export interface BusinessPlan {
  id?: string;
  projectName: string;
  tagline: string;
  overview: string;
  leanCanvas: LeanCanvas;
  swotAnalysis?: SWOTAnalysis; // Traditional
  brandCanvas?: BrandCanvas; // Creator
  financials?: {
    runway?: RunwayCalculation;
    breakEven?: BreakEvenAnalysis;
    rateCard?: RateCard;
  };
  operations?: {
    capTable?: CapTable;
    inventory?: InventoryItem[];
    contentCalendar?: ContentPost[];
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
  completedSteps?: string[];
  subTasks?: SubTask[];
  createdAt: string;
  updatedAt?: string;
}

// ... (Existing functions)

// Save Operations
export const saveOperations = async (userId: string, type: 'capTable' | 'inventory' | 'contentCalendar', data: any, projectId: string = 'current') => {
  try {
     const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
     await updateDoc(planRef, { [`operations.${type}`]: data });
     return true;
  } catch (error) {
    console.error(`Error saving operations (${type}):`, error);
    throw error;
  }
};

// ... (Existing functions)

// Save Financials
export const saveFinancials = async (userId: string, type: 'runway' | 'breakEven' | 'rateCard', data: any, projectId: string = 'current') => {
  try {
     const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
     await updateDoc(planRef, { [`financials.${type}`]: data });
     return true;
  } catch (error) {
    console.error(`Error saving financials (${type}):`, error);
    throw error;
  }
};

// Get All User Projects
export const getUserProjects = async (userId: string): Promise<BusinessPlan[]> => {
  try {
    const colRef = collection(db, 'artifacts', appId, 'users', userId, 'plans');
    const snap = await getDocs(colRef); // Fetch all

    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as any)
    })) as BusinessPlan[];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

// Create New Project (Auto ID)
export const createProject = async (userId: string, planData: any) => {
  try {
    const colRef = collection(db, 'artifacts', appId, 'users', userId, 'plans');
    // We use addDoc for auto-generated UUIDs
    const docRef = await addDoc(colRef, {
      ...planData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

// Save Legal Advice 
export const saveLegalAdvice = async (userId: string, legalData: any, projectId: string = 'current') => {
  try {
    const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
    await updateDoc(planRef, { legalAdvice: legalData });
    return true;
  } catch (error) {
    console.error("Error saving legal advice:", error);
    throw error;
  }
};

// Save Media Kit
export const saveMediaKit = async (userId: string, mediaKitData: any, projectId: string = 'current') => {
  try {
     const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
     await updateDoc(planRef, { mediaKit: mediaKitData });
     return true;
  } catch (error) {
    console.error("Error saving media kit:", error);
    throw error;
  }
};

// Save Permits
export const savePermits = async (userId: string, permits: any[], projectId: string = 'current') => {
  try {
     const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
     await updateDoc(planRef, { permits: permits });
     return true;
  } catch (error) {
    console.error("Error saving permits:", error);
    throw error;
  }
};

// Save Pitch Deck
export const savePitchDeck = async (userId: string, deck: any[], projectId: string = 'current') => {
  try {
     const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
     await updateDoc(planRef, { pitchDeck: deck });
     return true;
  } catch (error) {
    console.error("Error saving pitch deck:", error);
    throw error;
  }
};

// Save SWOT Analysis
export const saveSWOT = async (userId: string, swot: SWOTAnalysis, projectId: string = 'current') => {
  try {
     const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
     await updateDoc(planRef, { swotAnalysis: swot });
     return true;
  } catch (error) {
    console.error("Error saving SWOT:", error);
    throw error;
  }
};

// Save Brand Canvas
export const saveBrandCanvas = async (userId: string, canvas: BrandCanvas, projectId: string = 'current') => {
  try {
     const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
     await updateDoc(planRef, { brandCanvas: canvas });
     return true;
  } catch (error) {
    console.error("Error saving Brand Canvas:", error);
    throw error;
  }
};

// Save Plan (Update existing) 
export const savePlanToCloud = async (userId: string, planData: any, merge: boolean = true, projectId: string = 'current') => {
  try {
    const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);

    // Ensure we don't accidentally overwrite 'current' if we meant a specific ID, but here projectId handles that.
    await setDoc(planRef, {
      ...planData,
      updatedAt: new Date().toISOString()
    }, { merge });

    return true;
  } catch (error) {
    console.error("Error saving plan:", error);
    throw error;
  }
};

// Get Single Plan
export const getPlanFromCloud = async (userId: string, projectId: string = 'current') => {
  const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);

  try {
    const timeoutMs = 15000;
    const fetchPromise = getDoc(planRef);

    const timerPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore Read Timeout")), timeoutMs)
    );

    const docSnap = await Promise.race([fetchPromise, timerPromise]);

    if (docSnap && docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BusinessPlan;
    }
    return null;

  } catch (error: any) {
    if (!error.message.includes("Firestore Read Timeout")) {
      console.warn("Network read failed. Attempting logic cache check...", error.message);
    }

    try {
      const cachedSnap = await getDocFromCache(planRef);
      if (cachedSnap && cachedSnap.exists()) {
        console.log("✓ Retrieved plan from cache.");
        return { id: cachedSnap.id, ...cachedSnap.data() } as BusinessPlan;
      }
    } catch (cacheError) { }

    if (error.message.includes("offline") || error.code === 'unavailable' || error.message.includes("Timeout")) {
      return null;
    }

    console.error("Critical Error fetching plan:", error);
    throw error;
  }
};

// Toggle Step
export const toggleStepCompletion = async (userId: string, stepName: string, isCompleted: boolean, projectId: string = 'current') => {
  try {
    const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);

    await updateDoc(planRef, {
      completedSteps: isCompleted ? arrayUnion(stepName) : arrayRemove(stepName)
    });

    return true;
  } catch (error) {
    console.error("Error toggling step:", error);
    throw error;
  }
};

// Delete Project
export const deleteProject = async (userId: string, projectId: string = 'current') => {
  try {
    const planRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId);
    await deleteDoc(planRef);
    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

// ========================================
// MEDIA LIBRARY (AI-Generated Content)
// ========================================

export type MediaCategory = 'logo' | 'pattern' | 'mockup' | 'hero' | 'color_mood' | 'social' | 'cover';

export interface MediaLibraryItem {
  id?: string;
  imageUrl: string;
  prompt: string;
  category: MediaCategory;
  subcategory?: string; // e.g., 'tshirt', 'instagram', 'geometric'
  model: string;
  projectId?: string;
  projectName?: string;
  createdAt: string;
}

// Save to Media Library
export const saveToMediaLibrary = async (userId: string, item: Omit<MediaLibraryItem, 'id'>): Promise<string> => {
  try {
    const colRef = collection(db, 'artifacts', appId, 'users', userId, 'media-library');
    const docRef = await addDoc(colRef, {
      ...item,
      createdAt: item.createdAt || new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving to media library:", error);
    throw error;
  }
};

// Get Media Library with optional filters
export const getMediaLibrary = async (
  userId: string,
  filters?: { category?: MediaCategory; projectId?: string; limit?: number }
): Promise<MediaLibraryItem[]> => {
  try {
    const colRef = collection(db, 'artifacts', appId, 'users', userId, 'media-library');
    const snap = await getDocs(colRef);

    let items = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<MediaLibraryItem, 'id'>)
    })) as MediaLibraryItem[];

    // Apply filters
    if (filters?.category) {
      items = items.filter(item => item.category === filters.category);
    }
    if (filters?.projectId) {
      items = items.filter(item => item.projectId === filters.projectId);
    }

    // Sort by date (newest first)
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply limit
    if (filters?.limit) {
      items = items.slice(0, filters.limit);
    }

    return items;
  } catch (error) {
    console.error("Error fetching media library:", error);
    return [];
  }
};

// Delete from Media Library
export const deleteFromMediaLibrary = async (userId: string, itemId: string): Promise<boolean> => {
  try {
    const itemRef = doc(db, 'artifacts', appId, 'users', userId, 'media-library', itemId);
    await deleteDoc(itemRef);
    return true;
  } catch (error) {
    console.error("Error deleting from media library:", error);
    throw error;
  }
};

// ========================================
// GAMIFICATION SYSTEM
// ========================================

export interface GamificationProfile {
  userId: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  lastLoginDate: string; // ISO Date YYYY-MM-DD
  achievements: string[]; // IDs of unlocked achievements
  history: {
    action: string;
    xp: number;
    date: string;
  }[];
}

export const getGamificationProfile = async (userId: string): Promise<GamificationProfile> => {
  try {
    const docRef = doc(db, 'artifacts', appId, 'users', userId, 'gamification', 'profile');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data() as GamificationProfile;
    }

    // Create default profile if not exists
    const defaultProfile: GamificationProfile = {
      userId,
      totalXp: 0,
      level: 1,
      currentStreak: 0,
      lastLoginDate: new Date().toISOString().split('T')[0],
      achievements: [],
      history: []
    };

    await setDoc(docRef, defaultProfile);
    return defaultProfile;

  } catch (error) {
    console.error("Error fetching gamification profile:", error);
    throw error;
  }
};

export const updateGamificationProfile = async (userId: string, updates: Partial<GamificationProfile>) => {
  try {
    const docRef = doc(db, 'artifacts', appId, 'users', userId, 'gamification', 'profile');
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating gamification profile:", error);
  }
};

export const addGamificationXp = async (userId: string, amount: number, actionName: string) => {
  try {
    const docRef = doc(db, 'artifacts', appId, 'users', userId, 'gamification', 'profile');
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;

    const profile = snap.data() as GamificationProfile;
    const newXp = profile.totalXp + amount;

    // Simple level formula: Level = 1 + floor(sqrt(XP / 100))
    // Or constant scaling: Level * 1000 XP ? 
    // Let's use: Level N requires N * 500 XP total?
    // Let's stick to a simple formula: Level = Math.floor(Xp / 500) + 1
    const newLevel = Math.floor(newXp / 500) + 1;
    const levelUp = newLevel > profile.level;

    const update: any = {
      totalXp: newXp,
      level: newLevel,
      history: arrayUnion({
        action: actionName,
        xp: amount,
        date: new Date().toISOString()
      })
    };

    await updateDoc(docRef, update);

    return { newLevel, levelUp, newXp };

  } catch (error) {
    console.error("Error adding XP:", error);
    return null;
  }
};

// --- User Profile Operations ---

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId); // Root-level users collection
    const snap = await getDoc(userRef);
    
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const createUserProfile = async (user: any) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: 'user',
        subscription: {
          planId: 'free',
          status: 'active',
        },
        credits: {
          aiTokens: 5000,
          projectsUsed: 0,
        },
        settings: {
          emailNotifications: true,
          smsNotifications: false,
          theme: 'system',
          language: 'fa',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
    return snap.data() as UserProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
