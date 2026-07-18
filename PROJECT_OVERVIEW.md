# Karnex - Comprehensive Project Overview

Karnex is an AI-powered smart co-founder (**هم‌بنیان‌گذار هوشمند**) and business execution planner tailored specifically for the Iranian market. It assists entrepreneurs, traditional businesses, and content creators in structuring their ideas, generating actionable roadmaps, designing brand kits, analyzing competitors, and validating their business ideas from concept to monetization.

---

## 🎯 Target Audience (The Three Pillars)

Karnex is built with specialized paths for three primary user segments:
1. **Startups (استارتاپ‌ها)**: Focuses on validation, building MVPs (Minimum Viable Products), Lean Canvas modeling, and growth hacking.
2. **Traditional Businesses (کسب‌وکارهای سنتی)**: Focuses on local compliance, permits, physical setup, SWOT analysis, and transitioning/marketing locally.
3. **Content Creators (تولیدکنندگان محتوا)**: Focuses on niche definitions, branding, target audiences, content calendars, rate cards, and monetization channels.

---

## ⚙️ Core System Architecture & Features

The platform consists of twelve primary systems, designed as React components and backed by Next.js Server Actions, APIs, and AI utilities.

### 1. The Genesis Wizard
* **Route**: `/new-project`
* **Components**: Located in [components/wizard/](file:///c:/Ario%20Vibe%20Coding/Karnex/components/wizard/)
* **Behavior**: An interactive multi-step wizard form that gathers initial info about the user's business idea, target audience, budget, and business type. It guides the user dynamically to form the core data needed to feed the AI generator.

### 2. AI Strategy Engine & Multi-Pass Generation
* **Files**: [lib/project-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/project-actions.ts), [lib/openrouter.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/openrouter.ts), and [lib/ai/multi-pass.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/ai/multi-pass.ts)
* **Technology**: Uses the **OpenRouter** API. It prioritizes Google's Gemini models (such as `gemini-2.5-flash` or `gemini-2.5-flash-lite`) to produce fast, cost-effective, structured JSON outputs.
* **Refinement Flow**: Utilizes a draft-critique-refine pattern via the `multiPassGenerate` function. It sends the initial draft to the AI for self-critique and quality enhancement before parsing, ensuring high-quality, practical strategies.

### 3. Business Canvas Suite
* **Route**: `/dashboard/canvas`
* **Files**: [lib/canvas/](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/canvas/) and [components/dashboard/canvas/](file:///c:/Ario%20Vibe%20Coding/Karnex/components/dashboard/canvas/)
* **Database Tables**: Mapped to [Canvas](file:///c:/Ario%20Vibe%20Coding/Karnex/prisma/schema.prisma#L244) and [Card](file:///c:/Ario%20Vibe%20Coding/Karnex/prisma/schema.prisma#L262) models.
* **Features**:
  - Supports multiple board templates: Business Model Canvas (BMC), Lean Canvas (LEAN), Brand Canvas (BRAND), SWOT Analysis (SWOT), Empathy Map (EMPATHY), Value Proposition Canvas (VPC), and OKRs (OKR).
  - Toggles between **Grid Mode** (structured layout) and **Freeform Mode** (absolute drag-and-drop positioning, custom dimensions, and SVG connection lines using `@dnd-kit`).
  - Supports board version snapshot saving via the `CanvasVersion` model and team comments via the `Comment` model.
  - Bidirectional sync: promotes card checklists into execution roadmap tasks.
  - Interactive AI features: **One-click Canvas Generator**, **Section Brainstormer**, and **Canvas Critique**.

### 4. AI Pitch Deck Builder
* **Route**: `/dashboard/pitch-deck`
* **Components**: Located in `components/features/pitch-deck/`
* **Features**:
  - A split-workspace builder where users can construct slide decks from their canvas, competitor matrix, and roadmap context.
  - Multiple selectable design themes using HSL palettes, glassmorphism, and Vazirmatn typography.
  - Specialized slide templates including TAM/SAM/SOM concentric circles visualization, roadmap timelines, team layout grids, competitor comparisons, and revenue models.
  - Integrated AI sidebar with utility functions: **Rewrite**, **Shorten**, **Expand**, **Translate** (English/Persian), **Video Script Generator**, and **Investor Readiness Scorecard**.
  - Presenter Cockpit, shareable presentation URLs, and client-side PPTX generation (`pptxgenjs`) or landscape PDF printing.

### 5. Interactive Execution Roadmap & Knowledge Base
* **Route**: `/dashboard/roadmap`
* **Files**: [lib/knowledge-base.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/knowledge-base.ts) and `hooks/use-roadmap.ts`
* **Features**: Renders a phase-based execution checklist.
  - Localized **Persian Business Knowledge Base**: Provides legal details, time estimates, difficulty levels, and step-by-step guides for Iranian compliance (e.g. domain registration on `nic.ir`, trust symbol application on `enamad.ir`, payment gateway registration, taxation, and social security).

### 6. Creator Hub
* **Routes**: `/dashboard/scripts`, `/dashboard/ideas`, `/dashboard/content-calendar`, `/dashboard/repurpose`, `/dashboard/sponsor-rates`
* **Components**: Located in [components/dashboard/creator/](file:///c:/Ario%20Vibe%20Coding/Karnex/components/dashboard/creator/)
* **Features**:
  - **Video Script Writer**: Drafts custom video scripts with viral hook templates, duration presets, and platform layouts.
  - **Repurpose Content**: Generates social media posts from input URLs or draft topics in multiple tones.
  - **Content Calendar**: Visually schedule, plan, and manage creator publication pipelines.
  - **Sponsorship & Rate Card Calculator**: Estimates platform sponsorship rates and designs custom creator media kits.

### 7. Geo-Location & Catchment Analyzer
* **Route**: `/dashboard/location`
* **Files**: Inside [lib/location/](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/location/) and [components/dashboard/location/](file:///c:/Ario%20Vibe%20Coding/Karnex/components/dashboard/location/)
* **Features**: Focuses on physical traditional businesses.
  - **OpenStreetMap (OSM) Integration**: Fetches real-world points of interest (POIs) and coordinates around a user's location.
  - **Catchment Analytics**: Computes fit scores using footfall dependencies, monthly rent budgets, search radius, and local competitor density.
  - **Financial Lab**: Simulates a 12-month rolling P&L (revenue, rent, fixed/variable costs) and estimates break-even details, which sync back to the project canvas financials.
  - **Readiness Sync**: Coordinates zoning requirements and municipal permit steps, syncing them into the project roadmap.
  - **SWOT Sync**: Automatically updates the business canvas SWOT board with catchment area opportunities and threats.

### 8. AI Copilot & Personalization Engine
* **Routes**: `/dashboard/copilot`, `/dashboard/assistant`, `/dashboard/customer-bot`
* **Files**: [lib/chat-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/chat-actions.ts) and [components/copilot/](file:///c:/Ario%20Vibe%20Coding/Karnex/components/copilot/)
* **Features**:
  - **Persistent Chat History**: Saves conversations utilizing the `ChatConversation` and `ChatMessage` models.
  - **User & Project Memory**: Extracts and stores user preferences (role, stage, tone, expertise level) in `UserProfile` and key project facts (decisions, open questions, risks) in `ProjectMemory` to provide context-aware responses.
  - **Customer Persona Simulator (`customer-bot`)**: Creates simulated target customer personalities for role-playing, and manages automated replies/integrations (WhatsApp, Telegram, Instagram).

### 9. Account Center
* **Route**: `/dashboard/account`
* **Features**:
  - Consolidated panel featuring **Overview**, **Profile Editor**, **AI Settings**, **Billing**, **Usage & Tokens Quotas**, **Notifications Manager**, and **Security**.
  - **API Key Developer Portal**: Generates custom integration API keys (prefix + SHA-256 hash) with specific scopes.
  - **Integrations Hub**: Link third-party channels (YouTube, Instagram, Telegram).
  - **Data Export Suite**: Request full data download in JSON/ZIP format.

### 10. Project Scoring & Feedback System
* **File**: [lib/scoring.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/scoring.ts)
* **Behavior**: Evaluates project data completeness and generates an overall score (0-100) and letter grade (`S`, `A`, `B`, `C`, `D`), alongside list of strategic recommendations.

### 11. Iranian Payment & Billing Gateway
* **Files**: [lib/zibal.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/zibal.ts) and [lib/payment-actions.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/payment-actions.ts)
* **Behavior**: Manages transaction logic and subscriptions in Iranian Rials (IRR) via the **Zibal** gateway client, supporting automatic tracking, payment verification, and membership tiering (Free, Plus, Pro).

### 12. Multi-Format Export Engine
* **File**: [lib/export-utils.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/export-utils.ts)
* **Behavior**: Exports business models, canvas layouts, and pitch slides into high-fidelity PDF, PPTX, or image formats using `pptxgenjs`, `html-to-image`, and `jspdf`.

---

## 💾 Database Schema & Data Models (Prisma ORM)

Karnex uses PostgreSQL, managed via [prisma/schema.prisma](file:///c:/Ario%20Vibe%20Coding/Karnex/prisma/schema.prisma). Below is a summary of the core models and their structural roles:

### User & Authorization
* **`User`**: Root user account. Stores credentials, `supabaseUserId` (linked identity), settings, two-factor auth secrets, and credits/AI tokens JSON.
* **`UserSession`**: Tracks active web or mobile sessions, device types, IP addresses, and allows revoking active tokens.
* **`LoginEvent`**: Audit trail of login dates, locations, status (success/failed), and methods (password, Google, 2FA).
* **`UserProfile`**: Long-term memory storage for user role, industry, business stage, goals, expertise level, preferred AI tone, and learned preferences.
* **`UserApiKey`**: Developer API keys. Saves the SHA-256 hash of raw keys, prefixes, and list of scopes for API integrations.
* **`UserIntegration`**: Credentials and metadata for connected channels (YouTube, Instagram, Telegram).
* **`DataExportRequest`**: Handles user request queues for account data packaging.

### Projects & Memories
* **`Project`**: The parent business entity containing project details, soft-delete dates, and a `data` JSONB field holding the main unstructured business plan structure.
* **`ProjectMemory`**: Fact extraction engine that parses conversations to maintain list of `decisions`, `openQuestions`, `risks`, and `keyFacts` related to the project.
* **`ProjectMember`**: Maps co-founders and contributors with access roles (`admin`, `editor`, `viewer`).

### Canvas Boards
* **`Canvas`**: Instance of a business board (BMC, LEAN, SWOT, VPC, etc.), tracking template properties, layout configurations, viewport state, and related boards.
* **`Card`**: Individual notes on a Canvas board. Holds structural fields like color, coordinates (`x`, `y`), dimensions (`width`, `height`), order, type (`NOTE`, `CHECKLIST`, `LINK`, etc.), content, and checklist metadata.
* **`CanvasVersion`**: Snapshots of Canvas configurations to support version history restoration.
* **`Comment`**: Board comments for co-founder collaboration.

### Chat & Copilot
* **`ChatConversation`**: Persistent chat thread metadata. Supports "cofounder" workspace chat or "customer_bot" personas.
* **`ChatMessage`**: Logs messages with role (`user`, `assistant`), content text, toolCalls JSON, generated artifacts JSON, and `parentMessageId` to support conversation branching.
* **`AiFeedback`**: Stores user ratings (thumbs up/down) and qualitative feedback for message improvements.
* **`Artifact`**: Tracks AI-generated artifacts (such as slides, brand books, canvases, matrices, roadmaps) with incremental versions.
* **`AiUsage`**: Token audit log tracking model names, provider, prompt tokens, completion tokens, costs, and success logs.

### Billing & Monetization
* **`Subscription`**: Stores details of active plans (`free`, `plus`, `pro`), billing cycles, renewal dates, and status.
* **`Transaction`**: Records Rial amounts, trackIds, gateway tracking data, success reference ids, and card payment summaries.

---

## 🔒 Authentication & Session Syncing

Karnex utilizes **Supabase Auth** for identity management while maintaining user records locally in PostgreSQL.
1. **Request Interception**: Root [middleware.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/middleware.ts) invokes `updateSession` from Supabase to refresh credentials and guard `/dashboard` paths.
2. **Session Helper**: [lib/auth/session.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/auth/session.ts) provides a drop-in replacement for `auth()` that verifies token validity via `supabase.auth.getUser()`.
3. **Database Syncing**: [lib/auth/sync-user.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/auth/sync-user.ts) is triggered during login. It maps the Supabase identity to a PostgreSQL `User` record via `supabaseUserId`. If a user with the same email exists from a previous authentication legacy, it updates or archives old records safely.

---

## ⚡ Rate Limiting & Security

To prevent API abuse on Serverless functions:
* **Middleware Rate Limiting**: AI routes (`/api/chat`, `/api/copilot`, `/api/ai-generate`, etc.) are wrapped with a sliding window rate limiter.
* **Engine**: [lib/rate-limiter.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/rate-limiter.ts) utilizes a **Redis** instance (`ioredis`) for shared rate-limits across serverless functions.
* **Memory Fallback**: If Redis connectivity fails, the rate limiter falls back to an in-memory sliding window map ([lib/rate-limiter-memory.ts](file:///c:/Ario%20Vibe%20Coding/Karnex/lib/rate-limiter-memory.ts)).

---

## 📦 PWA & Service Worker Configuration

Karnex is optimized as a Progressive Web Application (PWA).
* **Builder**: Configured in [serwist.config.js](file:///c:/Ario%20Vibe%20Coding/Karnex/serwist.config.js) and `@serwist/next`.
* **Service Worker**: Structured in `app/sw.ts`.
* **Cache Strategy**: Executes build-time assets caching on `npm run build` and handles precaching and network-first strategies to enable offline support.

---

## 🛠️ Technology Stack

| Technology Layer | Solution Used |
| :--- | :--- |
| **Framework** | Next.js (App Router, v16.0.10) |
| **Language** | TypeScript |
| **Runtime & Rendering** | React 19.2 (Server & Client Components) |
| **Database** | PostgreSQL |
| **Database ORM** | Prisma ORM (v7.4.0) |
| **Authentication** | Supabase Auth (via `@supabase/ssr` & `@supabase/supabase-js`) |
| **Object Storage** | AWS S3 SDK (configured for Liara S3 object storage) |
| **Styling** | Tailwind CSS v3, Framer Motion, Tailwind Animate |
| **UI Components** | Radix UI, Lucide Icons, Sonner (Toasts) |
| **PWA Integrations** | Serwist (`@serwist/next`, `@serwist/sw`) |
| **Localization & Calendar** | `date-fns-jalali` (Solar Hijri/Jalali calendar parsing) |
| **Testing** | Vitest |

---

## 📁 Directory Structure

```bash
Karnex/
├── app/                       # Next.js App Router root
│   ├── (marketing)/           # Landing page and marketing layouts
│   ├── (main)/                # General app layouts
│   ├── api/                   # Serverless API routes (AI generation, payment, docs)
│   ├── auth/                  # Authentication pages (login, signup, password resets)
│   ├── dashboard/             # Main user workspace (roadmaps, analytics, assistant, canvas)
│   ├── new-project/           # Interactive genesis wizard
│   ├── projects/              # List and select user projects
│   └── globals.css            # Tailwind global stylesheet
│
├── components/                # React components
│   ├── ui/                    # Base UI elements (buttons, inputs, dialogs)
│   ├── auth/                  # Auth-related UI
│   ├── canvas/                # Canvas views and editors
│   ├── dashboard/             # Workspace specific layouts
│   ├── wizard/                # Genesis multi-step forms
│   └── shared/                # Layout parts (Navbar, Footer, Error Boundaries)
│
├── contexts/                  # React Contexts (auth, projects, notifications, chat history)
├── hooks/                     # Custom React Hooks (subscription, limits, offline storage, roadmap)
├── lib/                       # Backend Actions & Utility scripts
│   ├── ai/                    # Deep integration wrappers around AI APIs (multi-pass, tool configs)
│   ├── location/              # Location analysis, OSM adapters, Financial Lab logic
│   ├── payment/               # Payment gateway actions
│   ├── openrouter.ts          # OpenRouter client configuration
│   ├── scoring.ts             # Business plan evaluator & grader
│   ├── usage-tracker.ts       # Track user credits and AI query rates
│   ├── zibal.ts               # Local Zibal gateway interface
│   └── project-actions.ts     # Project Server Actions
│
├── prisma/                    # Prisma DB Schema and Migrations
├── public/                    # Static assets & PWA icons
├── scripts/                   # DB management, migration, and testing utilities
├── tests/                     # Unit & Integration tests (Vitest configuration)
└── Dockerfile                 # Docker configuration for production builds (Liara Cloud)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- A running PostgreSQL Database instance
- OpenRouter API Key (placed in `.env`)
- Zibal Merchant ID (optional, for payments)
- Supabase Project URL & Keys (placed in `.env`)

### Local Setup
1. Clone the project and copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the Prisma Client and sync DB schemas:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Run the local development server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   ```

---

## ☁️ Deployment

Karnex is configured to deploy directly to **Liara Cloud** (using `liara.json` and the multi-stage `Dockerfile`).
Run deployment with:
```bash
npm run deploy
```
or trigger:
```bash
liara deploy
```
