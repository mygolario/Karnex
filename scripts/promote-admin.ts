/**
 * Promote a user to Prisma role=admin by email.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/promote-admin.ts kavehcareer@gmail.com
 *   npm run promote-admin -- kavehcareer@gmail.com
 */

import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, deletedAt: null },
  });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    console.error("Sign up / log in with that email first, then re-run.");
    process.exit(1);
  }

  if (user.role === "admin") {
    console.log(`Already admin: ${user.email} (${user.id})`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "admin" },
  });

  console.log(`Promoted to admin: ${user.email} (${user.id})`);
  console.log("Also add this email to ADMIN_EMAILS in .env / Vercel for bootstrap on future syncs.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
