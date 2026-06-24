# Changelog

All notable changes to the Karnex platform will be documented in this file.

## [v2.0.0-sprint6] - 2026-06-24

This release completes Sprint 6 (Polish & Launch) of the Karnex v2.0 upgrade program, marking the final production-ready launch of Karnex v2.0.0. It integrates Optimistic UI updates on roadmaps and canvas boards, defers heavy third-party libraries via lazy loading, wraps OpenRouter model fallbacks with exponential backoff retries, configures PgBouncer connection pooling with Prisma globally cached instances, hardens NextAuth session lifetimes with active rotation, refactors route structures to React Server Components (RSC) to reduce client bundles, and implements User/Project soft deletes.

### Added
- **Optimistic UI Updates**: Configured React 19's `useOptimistic` hook in [hooks/use-roadmap.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/hooks/use-roadmap.ts) and [components/dashboard/canvas/canvas-context.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/dashboard/canvas/canvas-context.tsx) to provide instantaneous feedback on roadmap steps and canvas edits, rolling back automatically on failure and triggering Sonner error toasts in Persian.
- **OpenRouter backoff and retry helper**: Created `withRetry` helper and custom `TransientError` in [lib/openrouter.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/openrouter.ts) supporting 3 attempts (1s → 2s → 4s delays) for transient errors (429, 503, timeout) before model fallback.
- **ProjectsList Client Component**: Added a small, focused client component at [components/projects/projects-list.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/projects/projects-list.tsx) to handle interactive modals, switching, and project deletions.

### Changed
- **Server/Client Component Boundaries**: Refactored [app/projects/page.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/app/projects/page.tsx) and [app/dashboard/page.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/app/dashboard/page.tsx) into React Server Components (RSCs), fetching project lists directly on the server and executing server-side redirects.
- **Prisma Connection Pooling**: Cached the `PrismaClient` instance globally using `globalThis.__prisma` singleton in [lib/prisma.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/prisma.ts) and configured PgBouncer query parameters (`?pgbouncer=true&connection_limit=1`) documented in [.env.example](file:///c:/Ario%20Vibe%20Coding/Karnex/.env.example).
- **NextAuth Session Token Rotation**: Hardened auth token lifetimes in [auth.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/auth.ts) to 7 days (604800s) and enabled active rotation on every request using `updateAge: 0`.
- **Soft Deletes implementation**: Added `deletedAt DateTime?` to both `User` and `Project` models in [prisma/schema.prisma](file:///c:/Ario%20Vibe%20Coding/Karnex/prisma/schema.prisma). Updated query filters in [lib/db.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/db.ts), [lib/project-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/project-actions.ts), [lib/admin-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/admin-actions.ts), and [app/api/admin/users/route.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/app/api/admin/users/route.ts) to check `deletedAt: null`. Replaced hard deletes with soft delete updates setting `deletedAt` to `new Date()`.
- **Lazy Loaded heavy export libraries**: Deferred loading of `pptxgenjs` in [pitch-deck-builder.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/features/pitch-deck/pitch-deck-builder.tsx) using dynamic import and loaded `CanvasBoard` dynamically via `next/dynamic` in [app/dashboard/canvas/page.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/app/dashboard/canvas/page.tsx).

## [v2.0.0-sprint5] - 2026-06-24

This release completes Sprint 5 (Performance & Scale) of the Karnex v2.0 upgrade program. It optimizes Docker container builds for Liara Cloud standalone deployment, introduces service worker dynamic caching and reconnection queueing for offline PWA operations, and implements CLS layout optimizations for above-the-fold image components.

### Added
- **PWA Offline Sync Queue**: Created a local queue mechanism in [lib/offline-sync.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/offline-sync.ts) to store pending roadmap step completions and canvas/project mutations when offline.
- **Dynamic Projects GET API Route**: Added a REST API endpoint `/api/projects` in [app/api/projects/route.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/app/api/projects/route.ts) to retrieve user projects, facilitating service worker interception.
- **Network Reconnection Event Handler**: Registered a listener in [contexts/project-context.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/contexts/project-context.tsx) to replay queued mutations automatically once the network is restored.

### Changed
- **Optimized Multi-Stage Dockerfile**: Rewrote the [Dockerfile](file:///c:/Ario%20Vibe%20Coding/Karnex/Dockerfile) into a 2-stage build context (builder, runner) to compile standalone packages and remove all devDependencies, minimizing the final production image size.
- **Liara Docker Platform Configuration**: Configured [liara.json](file:///c:/Ario%20Vibe%20Coding/Karnex/liara.json) to deploy using the Docker platform.
- **REST Project Fetch Integration**: Updated [lib/store/project-store.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/store/project-store.ts) to fetch user projects via the `/api/projects` endpoint, integrating it with PWA service worker interception.
- **Dynamic Service Worker Cache Rules**: Extended [app/sw.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/app/sw.ts) to cache `/api/projects` and `/api/user-data` responses using the Serwist `NetworkFirst` runtime caching strategy.
- **Persian Offline UI Indicator**: Updated the status banner in [components/shared/network-status.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/shared/network-status.tsx) to exactly display: `حالت آفلاین — تغییرات ذخیره می‌شوند`.
- **Next/Image LCP Tuning**: Applied the `priority` prop to the above-the-fold logo inside the starter wizard [app/new-project/page.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/app/new-project/page.tsx).

## [v2.0.0-sprint4] - 2026-06-23

This release completes Sprint 4 (Feature Expansion) of the Karnex v2.0 upgrade program. It implements RTL logical layout migration, Zod validation for LLM responses, auto-drafting for the project wizard, onboarding entity extraction, sidebar credit usage metering, local compliance roadmaps, and multi-user project sharing/invitation controls.

### Added
- **Multi-User Collaboration Card & Invitation Form**: Added a premium collaborators card inside the project settings page [app/dashboard/settings/page.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/app/dashboard/settings/page.tsx) with a role select option and invitation dispatching.
- **Project Collaboration DB Schema**: Introduced the `ProjectMember` model in [prisma/schema.prisma](file:///c:/Ario%20Vibe%20Coding/Karnex/prisma/schema.prisma) supporting `userId`, `projectId`, and `role` specifications.
- **Invitation Server Actions**: Implemented `inviteMemberAction` and `getProjectMembersAction` in [lib/project-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/project-actions.ts) with Brevo notification email support.
- **Usage Meter Sidebar Component**: Added a visual usage progress meter at the bottom of the dashboard sidebar [components/dashboard/sidebar.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/dashboard/sidebar.tsx) with warn/depleted overlays linked to `getMyUsageSummaryAction` in [lib/usage-tracker.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/usage-tracker.ts).
- **Zod AI Schemas & Validation**: Added structured data validations in [lib/ai-validation.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/ai-validation.ts) and integrated validation checks in [lib/ai-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/ai-actions.ts) using the self-healing retry helper `callAIWithValidation`.

### Changed
- **Tailwind Logical Properties Migration**: Converted physical Tailwind classes (such as `ml-*`, `pr-*`, `left-*`, `text-right`) to logical classes (`ms-*`, `pe-*`, `start-*`, `text-end`) across components and styles.
- **RTL Logical Rules Enforcement**: Configured a custom ESLint plugin rule in [eslint.config.mjs](file:///c:/Ario%20Vibe%20Coding/Karnex/eslint.config.mjs) to prevent physical Tailwind property regressions.
- **Onboarding Entity Extraction**: Upgraded the wizard chat route [app/api/wizard-chat/route.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/app/api/wizard-chat/route.ts) to instruct `google/gemini-2.5-flash` for JSON entity extraction and validate outputs with Zod.
- **Genesis Wizard UI & Auto-Drafting**: Refactored the project creation details form in [components/features/new-project/project-details-form.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/features/new-project/project-details-form.tsx) into slide steps with progress indicators and local storage auto-save.
- **Iranian Local Compliance Roadmaps**: Prepended Trade license, Tax, Social security, and Municipality steps on Traditional Business project roadmaps, integrated within [hooks/use-roadmap.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/hooks/use-roadmap.ts) and [components/dashboard/step-detail-modal.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/dashboard/step-detail-modal.tsx).

### Fixed
- **Multi-Tenant Collaboration Security**: Restructured project search, update, and delete queries in [lib/db.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/db.ts) and Copilot reasoning checks in [app/api/copilot/route.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/app/api/copilot/route.ts) and [lib/ai/copilot-tools.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/ai/copilot-tools.ts) to verify editor/admin member project permissions, preventing cross-tenant leakage.

## [v2.0.0-sprint3] - 2026-06-23

This release completes Sprint 3 (Design System Overhaul) of the Karnex v2.0 upgrade program. It implements a fully custom Jalali date picker, resolves offline Vazirmatn typography issues for PWAs, localizes Latin digits to Farsi digits across all overview dashboards/roadmaps, and defines a centralized premium design token system.

### Added
- **Jalali Native Date Picker Component**: Built a reusable `JalaliDatePicker` component in [components/ui/date-picker.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/ui/date-picker.tsx) using Radix UI Popover (`@radix-ui/react-popover`) and `date-fns-jalali` with month/year dropdowns and Saturday-start weekday alignment.
- **Unified Design Token System**: Defined CSS custom properties for primary/secondary/accent colors, border radii (`--radius-card`, `--radius-btn`, `--radius-input`), and glassmorphism elements in [app/globals.css](file:///c:/Ario%20Vibe%20Coding/Karnex/app/globals.css) and registered them in [tailwind.config.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/tailwind.config.ts).

### Fixed
- **Profile Field Persistence**: Restored missing backend database sync mapping for `phoneNumber`, `birthDate`, and `bio` fields inside `updateUserProfile` and `mapPrismaUserToProfile` in [lib/db.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/db.ts) so that profile values are correctly loaded and saved to PostgreSQL.

### Changed
- **PWA Offline Font Loading**: Configured `next/font/local` in [app/layout.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/app/layout.tsx) with custom variable `--font-vazirmatn` pointing to local Vazirmatn font assets inside `vazirmatn-v33.003/` directory.
- **Farsi Digits Localization**: Extended `toPersianDigits` helper to render Farsi digits on dashboard progress percentages, completed task ratios, activity streaks, phase steps, and estimated hours in [stats-strip.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/dashboard/overview/stats-strip.tsx), [app/dashboard/roadmap/page.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/app/dashboard/roadmap/page.tsx), [roadmap-journey.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/dashboard/roadmap/roadmap-journey.tsx), and [step-detail-modal.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/dashboard/step-detail-modal.tsx).
- **UI Primitives Refactoring**: Overhauled [button.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/ui/button.tsx), [input.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/ui/input.tsx), [card.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/ui/card.tsx), and [dialog.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/components/ui/dialog.tsx) to consume the unified brand design tokens and glass-premium classes instead of arbitrary Tailwind classes.
- **Profile Date Picker Standardization**: Replaced `react-multi-date-picker` in [app/dashboard/profile/page.tsx](file:///c:/Ario%20Vibe%20Coding/Karnex/app/dashboard/profile/page.tsx) with the new standardized `<JalaliDatePicker>` component.

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
