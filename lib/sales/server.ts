import "server-only";
import prisma from "@/lib/prisma";
import { recordStockMovement } from "@/lib/inventory/server";
import type {
  DailyReport,
  Order,
  OrderInput,
  OrderItem,
  PaymentMethod,
} from "./types";

function toItem(i: {
  id: string;
  orderId: string;
  productId: string | null;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}): OrderItem {
  return {
    id: i.id,
    orderId: i.orderId,
    productId: i.productId ?? null,
    name: i.name,
    qty: i.qty ?? 0,
    unitPrice: i.unitPrice ?? 0,
    lineTotal: i.lineTotal ?? 0,
  };
}

function toOrder(o: {
  id: string;
  projectId: string;
  customerId: string | null;
  customerName: string | null;
  paymentMethod: string | null;
  total: number;
  note: string | null;
  createdAt: Date | string;
  items?: Array<{
    id: string;
    orderId: string;
    productId: string | null;
    name: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}): Order {
  return {
    id: o.id,
    projectId: o.projectId,
    customerId: o.customerId ?? null,
    customerName: o.customerName ?? null,
    paymentMethod: (o.paymentMethod as PaymentMethod | null) ?? null,
    total: o.total ?? 0,
    note: o.note ?? null,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    items: (o.items ?? []).map(toItem),
  };
}

export async function listOrders(projectId: string, limit = 50): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    where: { projectId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toOrder);
}

export async function createOrder(projectId: string, input: OrderInput): Promise<Order> {
  if (!input.items?.length) {
    throw new Error("حداقل یک آیتم برای فروش لازم است");
  }

  const items = input.items.map((item) => {
    const qty = Number(item.qty) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    if (!item.name?.trim()) throw new Error("نام آیتم الزامی است");
    if (qty <= 0) throw new Error("تعداد باید بزرگ‌تر از صفر باشد");
    return {
      productId: item.productId || null,
      name: item.name.trim(),
      qty,
      unitPrice,
      lineTotal: qty * unitPrice,
    };
  });

  const total = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const deduct = input.deductInventory !== false;

  const order = await prisma.order.create({
    data: {
      projectId,
      customerName: input.customerName?.trim() || null,
      paymentMethod: input.paymentMethod || null,
      note: input.note?.trim() || null,
      total,
      items: { create: items },
    },
    include: { items: true },
  });

  if (deduct) {
    for (const item of items) {
      if (!item.productId) continue;
      try {
        await recordStockMovement(projectId, {
          productId: item.productId,
          type: "out",
          qty: item.qty,
          note: `فروش سفارش ${order.id}`,
        });
      } catch (err) {
        console.error("Stock deduction failed for order item:", err);
      }
    }
  }

  return toOrder(order);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export async function dailyReport(projectId: string, date?: Date): Promise<DailyReport> {
  const day = date ?? new Date();
  const from = startOfDay(day);
  const to = endOfDay(day);

  const orders = await prisma.order.findMany({
    where: { projectId, createdAt: { gte: from, lte: to } },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const byPaymentMap = new Map<string, { count: number; total: number }>();
  const itemMap = new Map<string, { qty: number; revenue: number }>();

  for (const order of orders) {
    const method = order.paymentMethod || "نامشخص";
    const prev = byPaymentMap.get(method) ?? { count: 0, total: 0 };
    byPaymentMap.set(method, {
      count: prev.count + 1,
      total: prev.total + (order.total ?? 0),
    });

    for (const item of order.items) {
      const cur = itemMap.get(item.name) ?? { qty: 0, revenue: 0 };
      itemMap.set(item.name, {
        qty: cur.qty + item.qty,
        revenue: cur.revenue + item.lineTotal,
      });
    }
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const orderCount = orders.length;

  return {
    date: from.toISOString().slice(0, 10),
    orderCount,
    totalRevenue,
    byPayment: Array.from(byPaymentMap.entries()).map(([method, v]) => ({
      method,
      count: v.count,
      total: v.total,
    })),
    topItems: Array.from(itemMap.entries())
      .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
    averageTicket: orderCount > 0 ? totalRevenue / orderCount : 0,
  };
}
