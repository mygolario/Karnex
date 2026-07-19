# AGENTS.md

## Cursor Cloud specific instructions

`karnex-web` is a Next.js 16 (App Router, Turbopack) app — a Persian/RTL business‑planning SaaS.
It uses Prisma 7 (PostgreSQL via the `pg` adapter) and **Supabase Auth** (email/password + Google) with Prisma user sync.
Standard commands live in `package.json` scripts (`dev`, `build`, `lint`, `serwist:build`) and are not duplicated here.

### Launch focus (Sep 2026)
- Scope config: `lib/launch/config.ts` — Startup-first; Traditional/Creator pillars marked coming soon in Genesis; nav trimmed.
- Pricing: `lib/payment/pricing.ts` — Free / پرو (`plus` id, 299k) / تیم (`pro` id, 699k). Weighted AI credits in `lib/ai/credit-weights.ts`.
- AI model policy: `docs/ai-model-policy.md` — tiers in `lib/openrouter.ts` (Gemini volume backbone, Claude for high-stakes, Perplexity for grounded web).
- Env template: `.env.example`.

### Services / how to run
- Only one service: the Next.js app. Run it with `npm run dev` (http://localhost:3000). There is no separate backend.
- PostgreSQL is required. It is installed locally (cluster `16 main`, port 5432) but is **not** auto‑started. Start it each session before running the app or Prisma:
  `sudo pg_ctlcluster 16 main start`
  Dev DB `karnex` and role `postgres`/`postgres` already exist.

### Environment
- Config lives in `.env` (gitignored). It is loaded both by Next.js and by `prisma.config.ts` (via `dotenv/config`). `prisma generate` can use a localhost fallback; migrate requires real URLs. See `.env.example`.
- **Supabase URLs on Vercel (Preview + Production):**
  - `DATABASE_URL` — Transaction pooler `:6543` (+ `?pgbouncer=true`) for the app.
  - `DIRECT_URL` — Session pooler or Direct `:5432` for `prisma migrate deploy`. Never `:6543` (hangs the build).
- Optional integrations degrade gracefully when absent: `OPENROUTER_API_KEY` (AI), `RESEND_API_KEY` (email), `LIARA_*` / `STORAGE_*` (S3), Google OAuth via Supabase. Core needs: `DATABASE_URL`, `DIRECT_URL`, Supabase public + service keys.
- Payments (Zibal): `ZIBAL_MERCHANT` (`zibal` = public sandbox; real merchant for production). `FIXIE_URL` proxies Zibal only when set. Fixie EU West outbound IPs to whitelist in Zibal: `54.195.3.54`, `54.217.142.99`. Push local `FIXIE_URL` to Vercel with `./scripts/setup-fixie-vercel-env.sh` after `vercel login` + `vercel link`.

### Database migrations
- Apply schema with `npx prisma migrate deploy` (migrations in `prisma/migrations`). **Not part of the Vercel build** (`vercel.json` runs `prisma generate && next build && serwist` only) — run migrate manually/CI against `DIRECT_URL` so Preview/Production builds cannot hang on the pooler.
- `prisma.config.ts` forces migrate onto `DIRECT_URL` (Prisma 7 ignores `directUrl` for CLI migrate) and rejects transaction pooler `:6543`.
- `prisma db seed` runs `scripts/migrate-data.js` — not needed for local dev.

### Non-obvious gotchas
- `lib/prisma.ts` uses `ssl: { rejectUnauthorized: false }` for non-localhost remote DBs.
- Lint: many pre-existing ESLint warnings in app code.
- Tests: `npx vitest run`. Known isolation bug in `tests/rate-limiter.test.ts`.
- After brand-new signup, project context may briefly show a load error; recovers on next dashboard load.
- Admin UI vs API: prefer Prisma `user.role === 'admin'`; keep `ADMIN_EMAILS` in sync if used.
