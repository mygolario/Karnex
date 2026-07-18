export interface Product {
  id: string;
  projectId: string;
  name: string;
  sku: string | null;
  category: string | null;
  unit: string;
  cost: number;
  price: number;
  stock: number;
  lowStockAt: number;
  supplierId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type StockTxType = "in" | "out" | "adjust";

export interface StockTransaction {
  id: string;
  projectId: string;
  productId: string;
  type: StockTxType;
  qty: number;
  unitCost: number | null;
  note: string | null;
  createdAt: string;
}

export interface Supplier {
  id: string;
  projectId: string;
  name: string;
  contact: string | null;
  address: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  sku?: string | null;
  category?: string | null;
  unit?: string;
  cost?: number;
  price?: number;
  stock?: number;
  lowStockAt?: number;
  supplierId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface StockMovementInput {
  productId: string;
  type: StockTxType;
  qty: number;
  unitCost?: number | null;
  note?: string | null;
}

export interface InventorySummary {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: Product[];
}
