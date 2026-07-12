# AGENTS.md

## Cursor Cloud specific instructions

Karnex (`karnex-web`) is a single Next.js 16 (App Router, Turbopack) app — a Persian/RTL
business-plan builder. Auth is NextAuth v5 (JWT sessions, credentials + Google providers),
data is PostgreSQL via Prisma 7 (`@prisma/adapter-pg`). Standard commands live in
`package.json` `scripts`; run/lint/test details below are only the non-obvious parts.

### Services / dependencies to run

- **PostgreSQL** (local, installed in the VM as cluster `16 main`). It does not auto-start.
  Start it each session before running the app or migrations:
  `sudo pg_ctlcluster 16 main start`
  The dev database/user already exist (db `karnex`, user `karnex`, password `karnex`).
- **`.env`** (gitignored, kept in the workspace) provides the runtime config. It must contain
  at least `DATABASE_URL` and `AUTH_SECRET`. Note: `npm install` runs `prisma generate` in
  `postinstall`, and `prisma.config.ts` throws if `DATABASE_URL` is unset — so `.env` must
  exist for `npm install` to succeed. If it is ever missing, recreate it with:
  `DATABASE_URL="postgresql://karnex:karnex@localhost:5432/karnex"` and a dev `AUTH_SECRET`.

### Run / build / test

- Dev server: `npm run dev` (http://localhost:3000). This is the way to run the app in
  development. Do not use `npm run build` / `npm start` for dev iteration.
- Apply DB schema: `npx prisma migrate deploy` (migrations in `prisma/migrations`).
- Tests: `npx vitest run`. Note one pre-existing failure in `tests/rate-limiter.test.ts`
  ("should track requests per IP") — it is a test-isolation bug (the shared module-level
  rate-limit map is not reset between tests, so the reused IP `192.168.1.1` has a different
  count). The other 6 tests pass. Not an environment problem.
- Lint (`npm run lint` / `eslint`) is currently broken due to a pre-existing version
  mismatch: `eslint.config.mjs` uses the ESLint 9 flat-config API (`eslint/config`) while
  `package.json` pins `eslint@^8` and `eslint-config-next@15.0.3` (repo runs Next 16).
  Fixing it requires coordinated dependency bumps and is out of scope for env setup.

### Notes

- Optional integrations are keyed off env vars and degrade gracefully when unset: AI
  features (`OPENROUTER_API_KEY`), payments (`ZIBAL_MERCHANT`, falls back to a mock gateway),
  email (`BREVO_API_KEY`), object storage (`LIARA_*`), Google OAuth
  (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`). The core signup/login + project persistence
  flows work without them. The `/new-project` wizard's plan generation, however, calls
  OpenRouter and needs `OPENROUTER_API_KEY` to complete.
- Signup uses the credentials provider (email/password) and writes a `User` row via Prisma;
  it is the simplest end-to-end smoke check (signup -> auto sign-in -> `/dashboard/overview`).
