# AGENTS.md

## Cursor Cloud specific instructions

`karnex-web` is a Next.js 16 (App Router, Turbopack) app — a Persian/RTL business‑planning SaaS.
It uses Prisma 7 (PostgreSQL via the `pg` adapter) and NextAuth v5 (Credentials + Google).
Standard commands live in `package.json` scripts (`dev`, `build`, `lint`, `serwist:build`) and are not duplicated here.

### Services / how to run
- Only one service: the Next.js app. Run it with `npm run dev` (http://localhost:3000). There is no separate backend.
- PostgreSQL is required. It is installed locally (cluster `16 main`, port 5432) but is **not** auto‑started. Start it each session before running the app or Prisma:
  `sudo pg_ctlcluster 16 main start`
  Dev DB `karnex` and role `postgres`/`postgres` already exist.

### Environment
- Config lives in `.env` (gitignored, persisted in the VM snapshot). It is loaded both by Next.js and by `prisma.config.ts` (via `dotenv/config`). `prisma.config.ts` throws if `DATABASE_URL` is unset, so `prisma generate` (run in `postinstall`) needs it defined.
- Optional integrations degrade gracefully when their env vars are absent: `OPENROUTER_API_KEY` (AI generation), `BREVO_API_KEY` (email), `ZIBAL_MERCHANT` (payments — falls back to a mock gateway), `LIARA_*` (S3 uploads), `GOOGLE_CLIENT_ID/SECRET` (Google login). Only `DATABASE_URL` + `AUTH_SECRET` are needed for the core signup/login/dashboard flow.

### Database migrations
- Apply schema with `npx prisma migrate deploy` (migrations in `prisma/migrations`). `prisma db seed` runs `scripts/migrate-data.js`, which imports legacy data from `data_migration/` and requires SSL — not needed for local dev.

### Non-obvious gotchas
- `lib/prisma.ts` hard-codes `ssl: false` on the pg pool, matching the local Postgres (no SSL). A remote DB requiring SSL would need code changes.
- Lint: the committed `eslint.config.mjs` is a flat config for the Next 16 / ESLint 9 toolchain. `package.json` was updated to `eslint ^9` + `eslint-config-next ^16` so `npm run lint` runs. `npm run lint` currently reports many pre-existing errors/warnings in app code (not an environment problem).
- Tests: `npx vitest run` (config `vitest.config.ts`, jsdom env). `jsdom` was added to `devDependencies` (it was missing). One pre-existing test failure in `tests/rate-limiter.test.ts` is a test-isolation bug (module-level `rateLimitMap` state leaks across cases; `beforeEach` does not clear it) — unrelated to setup.
- After a brand-new signup, the client project context (`contexts/project-context.tsx`) may briefly show a "Failed to load projects" / "unexpected response from the server" overlay during the immediate post-signup transition; it recovers on the next dashboard load. Pre-existing app behavior, not an env issue.
