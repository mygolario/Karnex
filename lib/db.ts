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

// Roadmap Phase structure
export interface RoadmapPhase {
  phase: string;
  steps: string[];
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

// Main Business Plan interface
export interface BusinessPlan {
  id?: string;
  projectName: string;
  tagline: string;
  overview: string;
  leanCanvas: LeanCanvas;
  brandKit: BrandKit;
  roadmap: RoadmapPhase[];
  marketingStrategy: string[];
  competitors: Competitor[];
  legalAdvice?: LegalAdvice;
  budget: string;
  audience: string;
  ideaInput?: string;
  completedSteps?: string[];
  subTasks?: SubTask[];
  createdAt: string;
  updatedAt?: string;
}

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
    } catch (cacheError) {}

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
