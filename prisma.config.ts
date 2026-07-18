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
const MIGRATE_CONNECT_TIMEOUT_SEC = 30;

function firstNonEmpty(...candidates: Array<string | undefined>): string | undefined {
  for (const value of candidates) {
    if (value && value.trim() !== '') return value.trim();
  }
  return undefined;
}

function parsePgUrl(raw: string): URL | null {
  try {
    return new URL(raw.replace(/^postgres(ql)?:/i, 'http:'));
  } catch {
    return null;
  }
}

function isLocalhostUrl(raw: string): boolean {
  const parsed = parsePgUrl(raw);
  if (!parsed) return false;
  return parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost' || parsed.hostname === '::1';
}

/** Supabase/PgBouncer transaction pooler — hangs prisma migrate (advisory locks). */
function looksLikeTransactionPooler(raw: string): boolean {
  const parsed = parsePgUrl(raw);
  if (!parsed) return /:6543(?:\/|\?|$)/.test(raw);
  const port = parsed.port || '5432';
  return port === '6543';
}

/** Ensure migrate fails in seconds on unreachable hosts instead of Vercel's 45m timeout. */
function withConnectTimeout(raw: string, seconds: number): string {
  try {
    const u = new URL(raw);
    if (!u.searchParams.has('connect_timeout')) {
      u.searchParams.set('connect_timeout', String(seconds));
    }
    return u.toString();
  } catch {
    if (/[?&]connect_timeout=/.test(raw)) return raw;
    return raw.includes('?')
      ? `${raw}&connect_timeout=${seconds}`
      : `${raw}?connect_timeout=${seconds}`;
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

let datasourceUrl: string;
let datasourceDirectUrl: string | undefined = directUrl;

if (isMigrateCommand) {
  // Prisma 7 often ignores datasource.directUrl for migrate; use DIRECT_URL as primary url.
  // Allow localhost DATABASE_URL only for local migrate when DIRECT_URL is unset.
  const migrateUrl = firstNonEmpty(
    directUrl,
    url && isLocalhostUrl(url) ? url : undefined
  );

  if (!migrateUrl) {
    throw new Error(
      'DIRECT_URL is missing/empty. Set DIRECT_URL (or POSTGRES_URL_NON_POOLING) to Supabase Session mode (:5432) or Direct connection for migrate deploy. Transaction pooler (:6543) hangs forever on Vercel.'
    );
  }

  if (looksLikeTransactionPooler(migrateUrl)) {
    throw new Error(
      'DIRECT_URL points at the transaction pooler (:6543). Set DIRECT_URL to Session mode (...pooler.supabase.com:5432) or Direct (db.<ref>.supabase.co:5432). DATABASE_URL may stay on :6543 for the app.'
    );
  }

  // Reject mistaken local DIRECT_URL when the app DB is remote (e.g. Vercel misconfig).
  if (isLocalhostUrl(migrateUrl) && url && !isLocalhostUrl(url)) {
    throw new Error(
      'DIRECT_URL is localhost but DATABASE_URL is remote. Set DIRECT_URL to the remote Session/Direct URL for migrate deploy.'
    );
  }

  datasourceUrl = withConnectTimeout(migrateUrl, MIGRATE_CONNECT_TIMEOUT_SEC);
  datasourceDirectUrl = datasourceUrl;
} else {
  datasourceUrl = url ?? FALLBACK_URL;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: datasourceUrl,
    ...(datasourceDirectUrl ? { directUrl: datasourceDirectUrl } : {}),
  } as any,
  migrations: {
    seed: 'node scripts/migrate-data.js',
  },
});
