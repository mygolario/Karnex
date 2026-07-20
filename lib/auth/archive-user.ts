import prisma from "@/lib/prisma";
import { syncUserCreditsToEmailQuota } from "@/lib/auth/email-ai-quota";

/**
 * Soft-delete an app user, cancel billing, and free their email for a fresh signup.
 * Monthly AI usage is flushed to EmailAiQuota (hashed email) before scrubbing so
 * re-signup cannot reset the free credit budget.
 */
export async function archiveAppUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, credits: true },
  });

  if (user?.email) {
    try {
      await syncUserCreditsToEmailQuota(user.email, user.credits);
    } catch (err) {
      console.error("[archiveAppUser] Failed to sync email AI quota:", err);
    }
  }

  const scrubbedEmail = `deleted+${userId}@karnex.local`;

  await prisma.$transaction([
    prisma.subscription.updateMany({
      where: { userId },
      data: {
        status: "cancelled",
        cancelAtPeriodEnd: false,
        autoRenew: false,
        updatedAt: new Date(),
      },
    }),
    prisma.project.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: scrubbedEmail,
        supabaseUserId: null,
        name: null,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        bio: null,
        image: null,
      },
    }),
  ]);
}
