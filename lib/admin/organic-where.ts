import type { Prisma } from "../../prisma/client";

/**
 * Real customers only: not soft-deleted, not marked test, not admin accounts.
 * Use for founder scoreboards — never for ops lists that need to see everyone.
 */
export const ORGANIC_USER_WHERE: Prisma.UserWhereInput = {
  deletedAt: null,
  isTestUser: false,
  role: { not: "admin" },
};

export function isInternalForAnalytics(input: {
  role?: string | null;
  isTestUser?: boolean | null;
}): boolean {
  return input.role === "admin" || Boolean(input.isTestUser);
}
