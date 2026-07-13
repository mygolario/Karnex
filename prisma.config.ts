import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env first
dotenv.config();
// Then overlay .env.local if it exists
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const FALLBACK_URL = 'postgresql://127.0.0.1:5432/karnex_build';

function firstNonEmpty(...candidates: Array<string | undefined>): string | undefined {
  for (const value of candidates) {
    if (value && value.trim() !== '') return value.trim();
  }
  return undefined;
}

function isLocalhostUrl(raw: string): boolean {
  try {
    const host = new URL(raw.replace(/^postgres(ql)?:/i, 'http:')).hostname;
    return host === '127.0.0.1' || host === 'localhost' || host === '::1';
  } catch {
    return false;
  }
}

// Prefer explicit app vars; fall back to Supabase/Vercel Postgres integration aliases.
const url = firstNonEmpty(
  process.env.DATABASE_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL
);
const directUrl = firstNonEmpty(
  process.env.DIRECT_URL,
  process.env.POSTGRES_URL_NON_POOLING
);

const argv = process.argv.slice(2);
const isMigrateCommand = argv.includes('migrate') || (argv[0] === 'db' && argv[1] !== 'pull');
const resolvedUrl = url ?? FALLBACK_URL;

// migrate deploy must never silently hit the local generate-only fallback (Vercel P1001).
if (isMigrateCommand && (!url || isLocalhostUrl(resolvedUrl))) {
  throw new Error(
    'DATABASE_URL is missing/empty or points to localhost. Set DATABASE_URL and DIRECT_URL in the Vercel project env (Production and Preview). generate-only fallback is not valid for migrate deploy.'
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: resolvedUrl,
    directUrl,
  } as any,
  migrations: {
    seed: 'node scripts/migrate-data.js',
  },
});
