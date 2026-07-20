import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import type { Prisma } from "../../prisma/client";

export type AiRequestMap = Record<string, number>;

export type UserCreditsSeed = {
  aiTokens: number;
  projectsUsed: number;
  aiRequests: AiRequestMap;
};

const DEFAULT_AI_TOKENS = 10;

/** Normalize email for stable hashing across signups. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** SHA-256 hex of normalized email (no plaintext stored in ledger). */
export function hashEmail(email: string): string {
  return createHash("sha256").update(normalizeEmail(email)).digest("hex");
}

/** Per-month max merge — avoids double-counting when ledger and user hold the same total. */
export function mergeAiRequestMaps(
  a: AiRequestMap | null | undefined,
  b: AiRequestMap | null | undefined,
): AiRequestMap {
  const out: AiRequestMap = { ...(a ?? {}) };
  for (const [month, raw] of Object.entries(b ?? {})) {
    const n = typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
    out[month] = Math.max(out[month] ?? 0, n);
  }
  // Normalize existing keys too
  for (const [month, raw] of Object.entries(out)) {
    out[month] =
      typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
  }
  return out;
}

export function extractAiRequests(credits: unknown): AiRequestMap {
  if (!credits || typeof credits !== "object" || Array.isArray(credits)) return {};
  const ai = (credits as Record<string, unknown>).aiRequests;
  if (!ai || typeof ai !== "object" || Array.isArray(ai)) return {};
  const out: AiRequestMap = {};
  for (const [month, raw] of Object.entries(ai as Record<string, unknown>)) {
    if (typeof raw === "number" && Number.isFinite(raw)) {
      out[month] = Math.max(0, Math.floor(raw));
    }
  }
  return out;
}

export async function getEmailAiQuota(
  emailHash: string,
): Promise<AiRequestMap> {
  const row = await prisma.emailAiQuota.findUnique({
    where: { emailHash },
    select: { aiRequests: true },
  });
  return extractAiRequests({ aiRequests: row?.aiRequests });
}

export async function upsertEmailAiQuota(
  emailHash: string,
  aiRequests: AiRequestMap,
): Promise<void> {
  await prisma.emailAiQuota.upsert({
    where: { emailHash },
    create: {
      emailHash,
      aiRequests: aiRequests as Prisma.InputJsonValue,
    },
    update: {
      aiRequests: aiRequests as Prisma.InputJsonValue,
    },
  });
}

/**
 * Merge a user's credits.aiRequests into the email ledger (per-month max).
 * No-op when email is missing/blank.
 */
export async function syncUserCreditsToEmailQuota(
  email: string | null | undefined,
  credits: unknown,
): Promise<void> {
  if (!email?.trim()) return;

  const emailHash = hashEmail(email);
  const fromUser = extractAiRequests(credits);
  const existing = await getEmailAiQuota(emailHash);
  const merged = mergeAiRequestMaps(existing, fromUser);
  await upsertEmailAiQuota(emailHash, merged);
}

/**
 * Credits JSON for a new User row, seeded from the email ledger when present.
 */
export async function creditsSeedFromEmailQuota(
  email: string,
): Promise<UserCreditsSeed> {
  const emailHash = hashEmail(email);
  const aiRequests = await getEmailAiQuota(emailHash);
  return {
    aiTokens: DEFAULT_AI_TOKENS,
    projectsUsed: 0,
    aiRequests,
  };
}
