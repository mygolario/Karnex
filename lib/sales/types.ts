export type PaymentMethod = "cash" | "card" | "transfer";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  projectId: string;
  customerId: string | null;
  customerName: string | null;
  paymentMethod: PaymentMethod | null;
  total: number;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItemInput {
  productId?: string | null;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface OrderInput {
  customerName?: string | null;
  paymentMethod?: PaymentMethod | null;
  note?: string | null;
  items: OrderItemInput[];
  deductInventory?: boolean;
}

export interface DailyReport {
  date: string;
  orderCount: number;
  totalRevenue: number;
  byPayment: { method: string; count: number; total: number }[];
  topItems: { name: string; qty: number; revenue: number }[];
  averageTicket: number;
}
