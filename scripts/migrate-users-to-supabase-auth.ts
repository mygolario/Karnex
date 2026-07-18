/**
 * Migrate existing Prisma users into Supabase Auth and link supabaseUserId.
 *
 * Usage:
 *   npx tsx scripts/migrate-users-to-supabase-auth.ts
 *
 * Requires:
 *   DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import "dotenv/config";
import prisma from "../lib/prisma";
import { getAdminSupabase } from "../lib/supabase/admin";

async function main() {
  const admin = await getAdminSupabase();
  const users = await prisma.user.findMany({
    where: { deletedAt: null, email: { not: null } },
  });

  console.log(`Found ${users.length} Prisma users to migrate.\n`);

  for (const user of users) {
    if (!user.email) continue;

    if (user.supabaseUserId) {
      console.log(`  skip ${user.email} (already linked)`);
      continue;
    }

    const tempPassword = `Kx!${crypto.randomUUID().slice(0, 12)}`;

    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: user.name,
        name: user.name,
      },
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        const { data: listData } = await admin.auth.admin.listUsers();
        const existing = listData.users.find(
          (u) => u.email?.toLowerCase() === user.email!.toLowerCase()
        );
        if (existing) {
          await prisma.user.update({
            where: { id: user.id },
            data: { supabaseUserId: existing.id },
          });
          console.log(`  linked ${user.email} → existing auth user`);
          continue;
        }
      }
      console.error(`  failed ${user.email}:`, error.message);
      continue;
    }

    if (data.user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { supabaseUserId: data.user.id },
      });
      console.log(`  created ${user.email} → ${data.user.id}`);
      console.log(`    (user must reset password via forgot-password flow)`);
    }
  }

  console.log("\nDone. Users should use 'Forgot password' to set a new password.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
