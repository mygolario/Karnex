# Changelog

All notable changes to the Karnex platform will be documented in this file.

## [v2.0.0-sprint2] - 2026-06-23

This release completes Sprint 2 (AI Engine v2) of the Karnex v2.0 upgrade program. It implements an external Prompt Registry with template variable injection, adds a Whisper-based Persian Voice Input fallback, stabilizes model routing with OpenRouter prompt caching (`cache_control`), and establishes a multi-step agentic loop for the Copilot chat.

### Added
- **AI Prompt Registry**: Created JSON-based prompt configurations under [lib/prompts/](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/prompts/) with template variable injection, structured few-shot examples for Persian tone/styling, and reasoning fields for Chain-of-Thought output.
- **Whisper Speech-to-Text Fallback API**: Created a server-side route [app/api/stt/route.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/app/api/stt/route.ts) using the OpenRouter Whisper model (`openai/whisper-large-v3`) to handle audio uploads when native Web Speech API is unsupported.
- **HTML5 MediaRecorder Fallback**: Rewrote [components/dashboard/assistant/voice-input.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/dashboard/assistant/voice-input.tsx) to record audio using HTML5 MediaRecorder and upload to `/api/stt` when browser SpeechRecognition is absent.
- **Multi-step Copilot Agentic Loop**: Redesigned [app/api/copilot/route.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/app/api/copilot/route.ts) as a multi-step loop supporting up to 5 execution turns using `google/gemini-2.5-pro` with sequential tools like `search_competitors` and `update_swot_analysis`.
- **Copilot Live Stream and UI Binding**: Modified [app/dashboard/copilot/page.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/app/dashboard/copilot/page.tsx) to parse an NDJSON progress stream and display real-time status messages (`statusMessage`) during execution.

### Changed
- **OpenRouter Model Caching & Routing**: Upgraded model configurations in [lib/openrouter.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/openrouter.ts) to use stable production models (`gemini-2.5-flash`, `gemini-2.5-pro`, `gpt-4o-mini`) and system prompts configured with `cache_control: { type: "ephemeral" }` to optimize latency and prompt cost.
- **Prompt Registry Integration**: Updated [lib/ai-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/ai-actions.ts), [lib/chat-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/chat-actions.ts), and [lib/project-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/project-actions.ts) to resolve prompt templates dynamically from the prompt registry and increased max token limit to handle LLM reasoning chains.

## [v2.0.0-sprint1] - 2026-06-23

This release completes Sprint 1 (Core Architecture & Security Hardening) along with Sprint 0 (Foundations & Quick Wins) of the Karnex v2.0 upgrade program. It integrates robust security (RLS, Admin route guards, payment signature verification), stable RTL Persian PDF exports, local typography, optimized database indexes, state management migration to Zustand, Redis rate limiting, two-phase AI credits commit, and structured JSON plan normalization.

### Added
- **RTL Persian PDF shaping & Fonts**: Integrated `arabic-persian-reshaper` and embedded base64 Vazirmatn fonts in [lib/export-utils.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/export-utils.ts) to resolve disconnected/reversed Persian characters.
- **Zustand State Migration**: Added centralized Zustand stores in [lib/store/project-store.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/store/project-store.ts) and [lib/store/chat-store.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/store/chat-store.ts) to eliminate unnecessary React Context re-renders.
- **Redis Rate Limiting**: Added Redis-backed sliding window rate limiter in [lib/rate-limiter.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/rate-limiter.ts) using `ioredis` with an in-memory Map fallback.
- **Two-Phase Credit Transactions**: Implemented a rollback/refund wrapper on AI consumption calls to return credits if an LLM generation fails.
- **JSON Plan Normalization**: Added structural sanitizers in [lib/project-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/project-actions.ts) to clean up raw AI outputs before database insertion.
- **Database Query Indexing**: Added query indexes in [prisma/schema.prisma](file:///c:/Ario%20Vibe%20Coding/Karnex/prisma/schema.prisma) for `User.email`, `Subscription.status`, `Subscription(userId, status)`, and `Transaction(status)` to optimize performance.
- **Persian Digits Localization**: Added `toPersianDigits` helper function in [lib/utils.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/utils.ts) and applied it across pricing modules.
- **Global Admin Route Guard Middleware**: Implemented NextAuth-integrated middleware in [proxy.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/proxy.ts) protecting all routes starting with `/api/admin/*`, ensuring that requests are blocked if the user is unauthenticated or does not hold the `admin` role.
- **Admin Users API Route**: Created dynamic API route `/api/admin/users` in [app/api/admin/users/route.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/app/api/admin/users/route.ts) that allows administrators to fetch the user lists securely.
- **Zibal Callback Cryptographic Protection**: Added SHA-256 HMAC signature verification and IP whitelisting capabilities in [app/api/payment/verify/route.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/app/api/payment/verify/route.ts). Signed callback parameters are generated in [app/api/payment/request/route.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/app/api/payment/request/route.ts) to prevent query string tampering.

### Fixed
- **Project Row-Level Security (RLS)**: Hardened the copilot API endpoint in [app/api/copilot/route.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/app/api/copilot/route.ts) and tool executors in [lib/ai/copilot-tools.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/ai/copilot-tools.ts) to enforce `userId` checks on all project queries, preventing unauthorized cross-tenant data leakage.
- **Fail-Closed Payment Verification**: Hardened `zibalVerify` in [lib/zibal.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/zibal.ts) to fail-closed if `ZIBAL_MERCHANT` credentials are not configured, removing insecure default fallbacks.

### Changed
- **Performance Optimization via Lazy Loading**: Configured dynamic imports for heavy third-party export libraries (`jspdf` and `html2canvas`) in UI features (e.g. `media-kit-builder.tsx`) to improve initial page load speed.
- **Local Font Loading**: Migrated Vazirmatn font loading to local package standard in [app/layout.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/app/layout.tsx) using the `vazirmatn-v33.003` package.
- **NextAuth Session Role Persistence**: Configured JWT and session callbacks in [auth.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/auth.ts) to copy and persist the user's role from the database to the NextAuth session.
- **Admin Server Actions Guard**: Enforced strict role check `session.user.role !== 'admin'` in [lib/admin-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/admin-actions.ts) for admin-level operations.

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
