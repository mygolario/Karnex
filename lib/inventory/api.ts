"use client";

import type { Product, ProductInput, StockMovementInput, StockTxType, Supplier, InventorySummary } from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

function projectIdOrThrow(): string {
  const id = typeof window !== "undefined" ? localStorage.getItem("karnex_active_project_id") : null;
  if (!id) throw new Error("پروژه فعالی انتخاب نشده است");
  return id;
}

export const inventoryApi = {
  async list(projectId: string): Promise<{ products: Product[]; suppliers: Supplier[]; summary: InventorySummary }> {
    return json(fetch(`/api/projects/${projectId}/inventory`));
  },
  async create(projectId: string, input: ProductInput): Promise<{ product: Product }> {
    return json(fetch(`/api/projects/${projectId}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }));
  },
  async update(projectId: string, productId: string, input: Partial<ProductInput>): Promise<{ product: Product }> {
    return json(fetch(`/api/projects/${projectId}/inventory/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }));
  },
  async remove(projectId: string, productId: string): Promise<{ success: boolean }> {
    return json(fetch(`/api/projects/${projectId}/inventory/${productId}`, { method: "DELETE" }));
  },
  async move(projectId: string, input: StockMovementInput): Promise<{ product: Product }> {
    return json(fetch(`/api/projects/${projectId}/inventory/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }));
  },
};

// Convenience for components that only have the project id from context.
export { projectIdOrThrow };
export type { Product, ProductInput, StockMovementInput, StockTxType, Supplier, InventorySummary };
