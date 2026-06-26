/**
 * Sync data from Liara PostgreSQL to Supabase PostgreSQL.
 *
 * Prerequisites:
 *   SOURCE_DATABASE_URL = Liara Postgres connection string
 *   DATABASE_URL          = Supabase pooler connection string (target)
 *
 * Usage:
 *   npx tsx scripts/migrate-liara-to-supabase.ts
 */

import { PrismaClient } from "../prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.DATABASE_URL;

if (!sourceUrl || !targetUrl) {
  console.error("Set SOURCE_DATABASE_URL (Liara) and DATABASE_URL (Supabase) before running.");
  process.exit(1);
}

function makeClient(url: string) {
  const isLocalhost = url.includes("localhost") || url.includes("127.0.0.1");
  const pool = new Pool({
    connectionString: url,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const source = makeClient(sourceUrl);
const target = makeClient(targetUrl);

const TABLES = [
  "user",
  "account",
  "session",
  "verificationToken",
  "project",
  "subscription",
  "transaction",
  "mediaItem",
  "feedback",
  "projectMember",
] as const;

async function syncTable(model: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const src = (source as any)[model];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tgt = (target as any)[model];
  if (!src || !tgt) {
    console.warn(`  Skipping unknown model: ${model}`);
    return;
  }

  const rows = await src.findMany();
  let upserted = 0;

  for (const row of rows) {
    await tgt.upsert({
      where: { id: row.id },
      update: row,
      create: row,
    });
    upserted++;
  }

  console.log(`  ${model}: ${upserted} rows synced`);
}

async function main() {
  console.log("🔄 Syncing Liara → Supabase...\n");

  for (const table of TABLES) {
    await syncTable(table);
  }

  const userCount = await target.user.count();
  console.log(`\n✅ Done. Supabase now has ${userCount} users in the User table.`);
  console.log("   View them in Supabase Studio → Table Editor → User");
  console.log("   (Authentication → Users stays empty — Karnex uses NextAuth, not Supabase Auth)");
}

main()
  .catch(console.error)
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  });
