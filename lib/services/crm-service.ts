import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp,
  getDoc,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  limit
} from "firebase/firestore";
import { db, appId } from "@/lib/firebase";

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
  lastContactedAt?: Date | Timestamp;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
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
  expectedCloseDate?: Date | Timestamp;
  probability: number; // 0-100
  notes?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
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
  dueDate?: Date | Timestamp;
  createdAt: Date | Timestamp;
  createdBy: string;
}

// Converter to handle Timestamp <-> Date conversion uniformly
const converter = <T>() => ({
  toFirestore: (data: T) => data as DocumentData,
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
      // Convert Timestamps to Dates if needed (optional, keeping as is for now or use helper)
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
    } as T;
  }
});

// --- Service Class ---

export const CRMService = {
  
  // --- Customers ---

  getCustomers: async (userId: string, projectId: string) => {
    try {
      // Path: artifacts/{appId}/users/{userId}/plans/{projectId}/customers
      const customersRef = collection(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'customers').withConverter(converter<CRMCustomer>());
      const q = query(customersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  addCustomer: async (userId: string, projectId: string, customer: Omit<CRMCustomer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const customersRef = collection(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'customers');
      const docRef = await addDoc(customersRef, {
        ...customer,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        totalSpend: customer.totalSpend || 0,
        status: customer.status || 'active',
        lifecycleStage: customer.lifecycleStage || 'lead'
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  },

  updateCustomer: async (userId: string, projectId: string, customerId: string, updates: Partial<CRMCustomer>) => {
    try {
      const customerRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'customers', customerId);
      await updateDoc(customerRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  deleteCustomer: async (userId: string, projectId: string, customerId: string) => {
    try {
      const customerRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'customers', customerId);
      await deleteDoc(customerRef);
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },

  // --- Deals (Pipeline) ---

  getDeals: async (userId: string, projectId: string) => {
    try {
      const dealsRef = collection(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'deals').withConverter(converter<CRMDeal>());
      const q = query(dealsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error fetching deals:", error);
      throw error;
    }
  },

  addDeal: async (userId: string, projectId: string, deal: Omit<CRMDeal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dealsRef = collection(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'deals');
      const docRef = await addDoc(dealsRef, {
        ...deal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding deal:", error);
      throw error;
    }
  },

  updateDealStage: async (userId: string, projectId: string, dealId: string, stageId: string) => {
    try {
      const dealRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'deals', dealId);
      await updateDoc(dealRef, {
        stageId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating deal stage:", error);
      throw error;
    }
  },

  // --- Activities ---

  getRecentActivities: async (userId: string, projectId: string, limitCount = 10) => {
    try {
       // Note: To query across all customers, we might use a collectionGroup query OR keep a top-level 'activities' collection under the project.
       // For better organization, let's put 'activities' under the project, but link them to customers.
       const activitiesRef = collection(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'activities').withConverter(converter<CRMActivity>());
       const q = query(activitiesRef, orderBy('createdAt', 'desc'), limit(limitCount));
       const snapshot = await getDocs(q);
       return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  },
  
  addActivity: async (userId: string, projectId: string, activity: Omit<CRMActivity, 'id' | 'createdAt'>) => {
      try {
        const activitiesRef = collection(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'activities');
        await addDoc(activitiesRef, {
           ...activity,
           createdAt: serverTimestamp()
        });
      } catch (error) {
         console.error("Error adding activity:", error);
         throw error;
      }
  }

};
