import prisma from "@/lib/prisma";

/** Soft-delete an app user, cancel billing, and free their email for a fresh signup. */
export async function archiveAppUser(userId: string): Promise<void> {
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
