import "server-only";
import prisma from "@/lib/prisma";
import type {
  Product,
  ProductInput,
  StockMovementInput,
  StockTransaction,
  StockTxType,
  Supplier,
  InventorySummary,
} from "./types";

function toProduct(p: any): Product {
  return {
    id: p.id,
    projectId: p.projectId,
    name: p.name,
    sku: p.sku ?? null,
    category: p.category ?? null,
    unit: p.unit,
    cost: p.cost ?? 0,
    price: p.price ?? 0,
    stock: p.stock ?? 0,
    lowStockAt: p.lowStockAt ?? 0,
    supplierId: p.supplierId ?? null,
    metadata: p.metadata ?? null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
  };
}

function toTx(t: any): StockTransaction {
  return {
    id: t.id,
    projectId: t.projectId,
    productId: t.productId,
    type: t.type as StockTxType,
    qty: t.qty ?? 0,
    unitCost: t.unitCost ?? null,
    note: t.note ?? null,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
  };
}

export async function listProducts(projectId: string): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { projectId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return rows.map(toProduct);
}

export async function listSuppliers(projectId: string): Promise<Supplier[]> {
  const rows = await prisma.supplier.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });
  return rows.map((s) => ({
    id: s.id,
    projectId: s.projectId,
    name: s.name,
    contact: s.contact ?? null,
    address: s.address ?? null,
    note: s.note ?? null,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
    updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : String(s.updatedAt),
  }));
}

export async function getInventorySummary(projectId: string): Promise<InventorySummary> {
  const products = await listProducts(projectId);
  const totalStockValue = products.reduce((acc, p) => acc + p.stock * p.cost, 0);
  const lowStockProducts = products.filter((p) => p.lowStockAt > 0 && p.stock <= p.lowStockAt && p.stock > 0);
  const outOfStock = products.filter((p) => p.stock <= 0);
  return {
    totalProducts: products.length,
    totalStockValue,
    lowStockCount: lowStockProducts.length,
    outOfStockCount: outOfStock.length,
    lowStockProducts,
  };
}

export async function createProduct(projectId: string, input: ProductInput): Promise<Product> {
  const product = await prisma.product.create({
    data: {
      projectId,
      name: input.name.trim(),
      sku: input.sku?.trim() || null,
      category: input.category?.trim() || null,
      unit: input.unit || "عدد",
      cost: Number(input.cost) || 0,
      price: Number(input.price) || 0,
      stock: Number(input.stock) || 0,
      lowStockAt: Number(input.lowStockAt) || 0,
      supplierId: input.supplierId || null,
      metadata: (input.metadata as any) ?? undefined,
    },
  });
  return toProduct(product);
}

export async function updateProduct(projectId: string, productId: string, input: Partial<ProductInput>): Promise<Product> {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.sku !== undefined) data.sku = input.sku?.trim() || null;
  if (input.category !== undefined) data.category = input.category?.trim() || null;
  if (input.unit !== undefined) data.unit = input.unit;
  if (input.cost !== undefined) data.cost = Number(input.cost) || 0;
  if (input.price !== undefined) data.price = Number(input.price) || 0;
  if (input.lowStockAt !== undefined) data.lowStockAt = Number(input.lowStockAt) || 0;
  if (input.supplierId !== undefined) data.supplierId = input.supplierId || null;
  if (input.metadata !== undefined) data.metadata = input.metadata as any;

  const existing = await prisma.product.findFirst({ where: { id: productId, projectId } });
  if (!existing) throw new Error("محصول یافت نشد");

  const product = await prisma.product.update({
    where: { id: productId },
    data,
  });
  return toProduct(product);
}

export async function deleteProduct(projectId: string, productId: string): Promise<void> {
  const existing = await prisma.product.findFirst({ where: { id: productId, projectId } });
  if (!existing) throw new Error("محصول یافت نشد");
  await prisma.product.delete({ where: { id: productId } });
}

/**
 * Records a stock movement and updates the product's running stock.
 *  - "in":  stock += qty (qty must be positive)
 *  - "out": stock -= qty (qty must be positive; clamps at 0)
 *  - "adjust": sets stock = qty (qty is the new absolute level)
 * Also records COGS-equivalent cost for "in" movements (unitCost or product.cost).
 */
export async function recordStockMovement(
  projectId: string,
  input: StockMovementInput
): Promise<{ product: Product; transaction: StockTransaction }> {
  const qty = Number(input.qty) || 0;
  if (input.type !== "adjust" && qty <= 0) {
    throw new Error("مقدار باید بزرگ‌تر از صفر باشد");
  }

  const product = await prisma.product.findFirst({
    where: { id: input.productId, projectId },
    select: { id: true, stock: true, cost: true },
  });
  if (!product) throw new Error("محصول یافت نشد");

  let newStock = product.stock;
  if (input.type === "in") newStock = product.stock + qty;
  else if (input.type === "out") newStock = Math.max(0, product.stock - qty);
  else if (input.type === "adjust") newStock = Math.max(0, qty);

  const signedDelta = input.type === "adjust" ? newStock - product.stock : input.type === "in" ? qty : -qty;
  const unitCost = input.type === "in" ? (input.unitCost ?? product.cost ?? 0) : null;

  const [updated, tx] = await prisma.$transaction([
    prisma.product.update({
      where: { id: product.id },
      data: { stock: newStock },
    }),
    prisma.stockTransaction.create({
      data: {
        projectId,
        productId: product.id,
        type: input.type,
        qty: signedDelta,
        unitCost,
        note: input.note ?? null,
      },
    }),
  ]);

  return { product: toProduct(updated), transaction: toTx(tx) };
}

export async function listStockTransactions(projectId: string, limit = 50): Promise<StockTransaction[]> {
  const rows = await prisma.stockTransaction.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toTx);
}
