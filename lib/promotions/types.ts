export type PromotionType = "discount" | "bogo" | "flash";

export interface Promotion {
  id: string;
  projectId: string;
  title: string;
  type: PromotionType;
  discountPct: number | null;
  code: string | null;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  copy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionInput {
  title: string;
  type: PromotionType;
  discountPct?: number | null;
  code?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  active?: boolean;
  copy?: string | null;
}

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  discount: "تخفیف درصدی",
  bogo: "یکی بخر یکی ببر",
  flash: "فروش ویژه",
};
