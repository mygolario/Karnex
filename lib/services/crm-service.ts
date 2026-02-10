import { createClient } from "@/lib/supabase";

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
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('crm_customers')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((c: any) => ({
        id: c.id,
        firstName: c.first_name,
        lastName: c.last_name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        tags: c.tags || [],
        status: c.status,
        lifecycleStage: c.lifecycle_stage,
        totalSpend: c.total_spend,
        lastContactedAt: c.last_contacted_at ? new Date(c.last_contacted_at) : undefined,
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
        linkedin: c.linkedin,
        instagram: c.instagram,
        website: c.website,
        notes: c.notes,
        source: c.source
      })) as CRMCustomer[];
    } catch (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
  },

  addCustomer: async (userId: string, projectId: string, customer: Omit<CRMCustomer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const supabase = createClient();
    try {
      const now = new Date().toISOString();
      const dbCustomer = {
        user_id: userId,
        project_id: projectId,
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        tags: customer.tags,
        status: customer.status || 'active',
        lifecycle_stage: customer.lifecycleStage || 'lead',
        total_spend: customer.totalSpend || 0,
        last_contacted_at: customer.lastContactedAt ? (customer.lastContactedAt instanceof Date ? customer.lastContactedAt.toISOString() : customer.lastContactedAt) : null,
        created_at: now,
        updated_at: now,
        linkedin: customer.linkedin,
        instagram: customer.instagram,
        website: customer.website,
        notes: customer.notes,
        source: customer.source
      };

      const { data, error } = await supabase
        .from('crm_customers')
        .insert(dbCustomer)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  },

  updateCustomer: async (userId: string, projectId: string, customerId: string, updates: Partial<CRMCustomer>) => {
    const supabase = createClient();
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.firstName) dbUpdates.first_name = updates.firstName;
      if (updates.lastName) dbUpdates.last_name = updates.lastName;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.company !== undefined) dbUpdates.company = updates.company;
      if (updates.tags) dbUpdates.tags = updates.tags;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.lifecycleStage) dbUpdates.lifecycle_stage = updates.lifecycleStage;
      if (updates.totalSpend !== undefined) dbUpdates.total_spend = updates.totalSpend;
      if (updates.lastContactedAt) dbUpdates.last_contacted_at = updates.lastContactedAt instanceof Date ? updates.lastContactedAt.toISOString() : updates.lastContactedAt;
      if (updates.linkedin !== undefined) dbUpdates.linkedin = updates.linkedin;
      if (updates.instagram !== undefined) dbUpdates.instagram = updates.instagram;
      if (updates.website !== undefined) dbUpdates.website = updates.website;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.source !== undefined) dbUpdates.source = updates.source;

      const { error } = await supabase
        .from('crm_customers')
        .update(dbUpdates)
        .eq('id', customerId)
        .eq('user_id', userId)
        .eq('project_id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  deleteCustomer: async (userId: string, projectId: string, customerId: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('crm_customers')
        .delete()
        .eq('id', customerId)
        .eq('user_id', userId)
        .eq('project_id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },

  // --- Deals (Pipeline) ---

  getDeals: async (userId: string, projectId: string) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('crm_deals')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        value: d.value,
        currency: d.currency,
        stageId: d.stage_id,
        customerId: d.customer_id,
        customerName: d.customer_name,
        expectedCloseDate: d.expected_close_date ? new Date(d.expected_close_date) : undefined,
        probability: d.probability,
        notes: d.notes,
        createdAt: new Date(d.created_at),
        updatedAt: new Date(d.updated_at),
        priority: d.priority
      })) as CRMDeal[];
    } catch (error) {
      console.error("Error fetching deals:", error);
      return [];
    }
  },

  addDeal: async (userId: string, projectId: string, deal: Omit<CRMDeal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const supabase = createClient();
    try {
      const now = new Date().toISOString();
      const dbDeal = {
        user_id: userId,
        project_id: projectId,
        title: deal.title,
        value: deal.value,
        currency: deal.currency,
        stage_id: deal.stageId,
        customer_id: deal.customerId,
        customer_name: deal.customerName,
        expected_close_date: deal.expectedCloseDate instanceof Date ? deal.expectedCloseDate.toISOString() : deal.expectedCloseDate,
        probability: deal.probability,
        notes: deal.notes,
        created_at: now,
        updated_at: now,
        priority: deal.priority
      };

      const { data, error } = await supabase
        .from('crm_deals')
        .insert(dbDeal)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error adding deal:", error);
      throw error;
    }
  },

  updateDealStage: async (userId: string, projectId: string, dealId: string, stageId: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('crm_deals')
        .update({
          stage_id: stageId,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealId)
        .eq('user_id', userId)
        .eq('project_id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating deal stage:", error);
      throw error;
    }
  },

  // --- Activities ---

  getRecentActivities: async (userId: string, projectId: string, limitCount = 10) => {
    const supabase = createClient();
    try {
       const { data, error } = await supabase
         .from('crm_activities')
         .select('*')
         .eq('user_id', userId)
         .eq('project_id', projectId)
         .order('created_at', { ascending: false })
         .limit(limitCount);

       if (error) throw error;

       return data.map((a: any) => ({
         id: a.id,
         customerId: a.customer_id,
         dealId: a.deal_id,
         type: a.type,
         title: a.title,
         description: a.description,
         completed: a.completed,
         dueDate: a.due_date ? new Date(a.due_date) : undefined,
         createdAt: new Date(a.created_at),
         createdBy: a.created_by
       })) as CRMActivity[];
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  },
  
  addActivity: async (userId: string, projectId: string, activity: Omit<CRMActivity, 'id' | 'createdAt'>) => {
      const supabase = createClient();
      try {
        const { error } = await supabase
          .from('crm_activities')
          .insert({
             user_id: userId,
             project_id: projectId,
             customer_id: activity.customerId,
             deal_id: activity.dealId,
             type: activity.type,
             title: activity.title,
             description: activity.description,
             completed: activity.completed,
             due_date: activity.dueDate instanceof Date ? activity.dueDate.toISOString() : activity.dueDate,
             created_at: new Date().toISOString(),
             created_by: activity.createdBy
          });

        if (error) throw error;
      } catch (error) {
         console.error("Error adding activity:", error);
         throw error;
      }
  }

};
