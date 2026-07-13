import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// #region agent log
function agentLog(hypothesisId: string, location: string, message: string, data: Record<string, unknown>) {
  const payload = {
    sessionId: 'cdd67f',
    runId: process.env.DEBUG_RUN_ID || 'pre-fix',
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  try {
    fs.appendFileSync(path.resolve(process.cwd(), 'debug-cdd67f.log'), `${JSON.stringify(payload)}\n`);
  } catch {
    /* ignore */
  }
  fetch('http://127.0.0.1:7733/ingest/99e51ab0-4056-4115-9d2f-175c6cc77fc4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cdd67f' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
function redactDbUrl(raw: string | undefined): {
  present: boolean;
  empty: boolean;
  length: number;
  host: string | null;
  database: string | null;
  isLocalFallbackCandidate: boolean;
} {
  const present = raw !== undefined;
  const empty = !raw || raw.trim() === '';
  if (empty) {
    return { present, empty: true, length: raw?.length ?? 0, host: null, database: null, isLocalFallbackCandidate: true };
  }
  try {
    const u = new URL(raw.replace(/^postgres(ql)?:/i, 'http:'));
    const host = u.hostname;
    const database = u.pathname.replace(/^\//, '') || null;
    return {
      present,
      empty: false,
      length: raw.length,
      host,
      database,
      isLocalFallbackCandidate: host === '127.0.0.1' || host === 'localhost',
    };
  } catch {
    return { present, empty: false, length: raw.length, host: 'parse-fail', database: null, isLocalFallbackCandidate: false };
  }
}
// #endregion

// #region agent log
agentLog('A,D', 'prisma.config.ts:pre-dotenv', 'env before dotenv', {
  databaseUrl: redactDbUrl(process.env.DATABASE_URL),
  directUrl: redactDbUrl(process.env.DIRECT_URL),
  postgresPrismaUrl: redactDbUrl(process.env.POSTGRES_PRISMA_URL),
  postgresUrl: redactDbUrl(process.env.POSTGRES_URL),
  vercel: process.env.VERCEL ?? null,
  vercelEnv: process.env.VERCEL_ENV ?? null,
});
// #endregion

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

// #region agent log
agentLog('D', 'prisma.config.ts:post-dotenv', 'env after dotenv/.env.local overlay', {
  databaseUrl: redactDbUrl(process.env.DATABASE_URL),
  directUrl: redactDbUrl(process.env.DIRECT_URL),
  envLocalExists: fs.existsSync(envLocalPath),
  envLocalOverwroteDatabaseUrl: Object.prototype.hasOwnProperty.call(
    fs.existsSync(envLocalPath) ? dotenv.parse(fs.readFileSync(envLocalPath)) : {},
    'DATABASE_URL'
  ),
});
// #endregion

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
const usedFallback = !url;
const resolvedUrl = url ?? FALLBACK_URL;

// #region agent log
agentLog('A,B,E', 'prisma.config.ts:resolve', 'resolved datasource url (redacted)', {
  usedFallback,
  rawDatabaseUrl: redactDbUrl(url),
  resolved: redactDbUrl(resolvedUrl),
  directUrl: redactDbUrl(directUrl),
  postgresPrismaUrl: redactDbUrl(process.env.POSTGRES_PRISMA_URL),
  argv,
  isMigrateCommand,
  willRejectLocalMigrate: isMigrateCommand && (!url || isLocalhostUrl(resolvedUrl)),
});
// #endregion

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
