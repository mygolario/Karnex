// import { createClient } from "@/lib/supabase"; // Supabase removed

// --- Types ---

export interface CRMCustomer {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  company?: string;
  tags: string[]; // e.g., "VIP", "Lead", "Lost"
  status: 'active' | 'inactive' | 'archived';
  lifecycleStage: 'subscriber' | 'lead' | 'marketingqualifiedlead' | 'salesqualifiedlead' | 'opportunity' | 'customer' | 'evangelist';
  totalSpend: number;
  lastContactedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Social handles
  linkedin?: string;
  instagram?: string;
  website?: string;
  notes?: string;
  source?: string; // e.g., "Website", "Referral"
}

export interface CRMDeal {
  id?: string;
  title: string;
  value: number;
  currency: string;
  stageId: string; // "new", "qualification", "proposal", "negotiation", "closed-won", "closed-lost"
  customerId: string; // Link to CRMCustomer
  customerName?: string; // Denormalized for easy display
  expectedCloseDate?: Date;
  probability: number; // 0-100
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface CRMActivity {
  id?: string;
  customerId: string; // The entity this activity relates to
  dealId?: string;    // Optional
  type: 'note' | 'call' | 'email' | 'meeting' | 'task' | 'system';
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
  createdBy: string;
}

// --- Service Class ---

export const CRMService = {
  
  // --- Customers ---

  getCustomers: async (userId: string, projectId: string) => {
    // Stub
    console.warn("CRM getCustomers not implemented (Supabase removed)");
    return [] as CRMCustomer[];
  },

  addCustomer: async (userId: string, projectId: string, customer: Omit<CRMCustomer, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.warn("CRM addCustomer not implemented (Supabase removed)");
    return "mock-customer-id";
  },

  updateCustomer: async (userId: string, projectId: string, customerId: string, updates: Partial<CRMCustomer>) => {
    console.warn("CRM updateCustomer not implemented (Supabase removed)");
  },

  deleteCustomer: async (userId: string, projectId: string, customerId: string) => {
    console.warn("CRM deleteCustomer not implemented (Supabase removed)");
  },

  // --- Deals (Pipeline) ---

  getDeals: async (userId: string, projectId: string) => {
    console.warn("CRM getDeals not implemented (Supabase removed)");
    return [] as CRMDeal[];
  },

  addDeal: async (userId: string, projectId: string, deal: Omit<CRMDeal, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.warn("CRM addDeal not implemented (Supabase removed)");
    return "mock-deal-id";
  },

  updateDealStage: async (userId: string, projectId: string, dealId: string, stageId: string) => {
    console.warn("CRM updateDealStage not implemented (Supabase removed)");
  },

  // --- Activities ---

  getRecentActivities: async (userId: string, projectId: string, limitCount = 10) => {
    console.warn("CRM getRecentActivities not implemented (Supabase removed)");
    return [] as CRMActivity[];
  },
  
  addActivity: async (userId: string, projectId: string, activity: Omit<CRMActivity, 'id' | 'createdAt'>) => {
      console.warn("CRM addActivity not implemented (Supabase removed)");
  }

};

