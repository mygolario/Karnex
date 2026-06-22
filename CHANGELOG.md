# Changelog

All notable changes to the Karnex platform will be documented in this file.

## [v2.0.0-sprint0] - 2026-06-22

This release completes Sprint 0 (Foundations & Quick Wins) of the Karnex v2.0 upgrade program, stabilizing dynamic page routing, self-hosting Persian fonts for offline/print availability, hardening third-party gateways, enforcing AI payload structures, and optimizing database queries.

### Added
- **Self-Hosted Vazirmatn Typography**: Configured Next.js `next/font/local` in [app/layout.tsx](file:///C:/Ario%20Vibe%20Coding/Karnex/app/layout.tsx) to host Vazirmatn font locally from `public/fonts/`. This resolves Persian letters backwards/disconnect issues when printing PDFs offline via `window.print()` and avoids CDN throttling by firewalls.
- **Database Query Indexing**: Added query indexes in [prisma/schema.prisma](file:///C:/Ario%20Vibe%20Coding/Karnex/prisma/schema.prisma) for `Project.createdAt` and `Subscription.status` to optimize project list sorting and subscription gating scans.

### Fixed
- **Stable AI Model Fallback**: Migrated OpenRouter configuration in [lib/openrouter.ts](file:///C:/Ario%20Vibe%20Coding/Karnex/lib/openrouter.ts) from experimental deprecated `gemini-2.0-flash-exp` model to stable production models (`gemini-2.5-flash` and `gemini-2.5-pro`).
- **Fail-Closed Payment Verification**: Hardened `zibalVerify` in [lib/zibal.ts](file:///C:/Ario%20Vibe%20Coding/Karnex/lib/zibal.ts) to fail-closed if `ZIBAL_MERCHANT` credentials are not configured, removing insecure default fallbacks.
- **Next.js 16/React 19 Server Params**: Verified and validated async parameter destructurings on all server-rendered dynamic routes.

### Changed
- **Enforced AI JSON Outputs**: Enabled `response_format` configuration options in [lib/openrouter.ts](file:///C:/Ario%20Vibe%20Coding/Karnex/lib/openrouter.ts) and integrated `responseFormat: { type: "json_object" }` on all 5 generator server actions in [lib/ai-actions.ts](file:///C:/Ario%20Vibe%20Coding/Karnex/lib/ai-actions.ts) to natively guarantee structural integrity.
