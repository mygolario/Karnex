import "server-only";
import prisma from "@/lib/prisma";
import type { Promotion, PromotionInput, PromotionType } from "./types";

function toPromotion(p: {
  id: string;
  projectId: string;
  title: string;
  type: string;
  discountPct: number | null;
  code: string | null;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
  active: boolean;
  copy: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}): Promotion {
  return {
    id: p.id,
    projectId: p.projectId,
    title: p.title,
    type: p.type as PromotionType,
    discountPct: p.discountPct ?? null,
    code: p.code ?? null,
    startsAt: p.startsAt
      ? p.startsAt instanceof Date
        ? p.startsAt.toISOString()
        : String(p.startsAt)
      : null,
    endsAt: p.endsAt
      ? p.endsAt instanceof Date
        ? p.endsAt.toISOString()
        : String(p.endsAt)
      : null,
    active: p.active ?? true,
    copy: p.copy ?? null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
  };
}

const VALID_TYPES: PromotionType[] = ["discount", "bogo", "flash"];

export async function listPromotions(projectId: string): Promise<Promotion[]> {
  const rows = await prisma.promotion.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPromotion);
}

export async function createPromotion(projectId: string, input: PromotionInput): Promise<Promotion> {
  if (!input.title?.trim()) throw new Error("عنوان کمپین الزامی است");
  if (!VALID_TYPES.includes(input.type)) throw new Error("نوع تخفیف نامعتبر است");

  const row = await prisma.promotion.create({
    data: {
      projectId,
      title: input.title.trim(),
      type: input.type,
      discountPct: input.discountPct != null ? Number(input.discountPct) : null,
      code: input.code?.trim() || null,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      active: input.active !== false,
      copy: input.copy?.trim() || null,
    },
  });
  return toPromotion(row);
}

export async function updatePromotion(
  projectId: string,
  promoId: string,
  input: Partial<PromotionInput>
): Promise<Promotion> {
  const existing = await prisma.promotion.findFirst({ where: { id: promoId, projectId } });
  if (!existing) throw new Error("کمپین یافت نشد");

  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title.trim();
  if (input.type !== undefined) {
    if (!VALID_TYPES.includes(input.type)) throw new Error("نوع تخفیف نامعتبر است");
    data.type = input.type;
  }
  if (input.discountPct !== undefined) {
    data.discountPct = input.discountPct != null ? Number(input.discountPct) : null;
  }
  if (input.code !== undefined) data.code = input.code?.trim() || null;
  if (input.startsAt !== undefined) data.startsAt = input.startsAt ? new Date(input.startsAt) : null;
  if (input.endsAt !== undefined) data.endsAt = input.endsAt ? new Date(input.endsAt) : null;
  if (input.active !== undefined) data.active = input.active;
  if (input.copy !== undefined) data.copy = input.copy?.trim() || null;

  const row = await prisma.promotion.update({ where: { id: promoId }, data });
  return toPromotion(row);
}

export async function deletePromotion(projectId: string, promoId: string): Promise<void> {
  const existing = await prisma.promotion.findFirst({ where: { id: promoId, projectId } });
  if (!existing) throw new Error("کمپین یافت نشد");
  await prisma.promotion.delete({ where: { id: promoId } });
}
