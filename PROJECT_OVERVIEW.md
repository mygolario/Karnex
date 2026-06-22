# Karnex - Project Overview

Karnex is an AI-powered smart co-founder (**هم‌بنیان‌گذار هوشمند**) and business execution planner tailored specifically for the Iranian market. It assists entrepreneurs, traditional businesses, and content creators in structuring their ideas, generating actionable roadmaps, designing brand kits, analyzing competitors, and validating their business ideas from concept to monetization.

---

## 🎯 Target Audience (The Three Pillars)

Karnex is built with specialized paths for three primary user segments:
1. **Startups (استارتاپ‌ها)**: Focuses on validation, building MVPs (Minimum Viable Products), Lean Canvas modeling, and growth hacking.
2. **Traditional Businesses (کسب‌وکارهای سنتی)**: Focuses on local compliance, permits, physical setup, SWOT analysis, and transitioning/marketing locally.
3. **Content Creators (تولیدکنندگان محتوا)**: Focuses on niche definitions, branding, target audiences, content calendars, rate cards, and monetization channels.

---

## ⚙️ Core System Architecture & Features

### 1. The Genesis Wizard
* **Route**: `/new-project`
* **Components**: Located in `components/wizard/`
* **Behavior**: An interactive multi-step form that gathers information about the user's idea, target audience, budget, and business type. It guides the user dynamically to form the core data needed to feed the AI generator.

### 2. AI Strategy Engine
* **File**: `lib/project-actions.ts` & `lib/openrouter.ts`
* **Technology**: Built on top of **OpenRouter** API. It prioritizes Google's Gemini models (`gemini-2.0-flash-exp`, `gemini-2.5-flash`, `gemini-1.5-flash`) for fast, cost-effective, and highly structured JSON generations.
* **Output Structure**: Generates a comprehensive Persian-localized JSON schema containing:
  - Project name, tagline, and executive summary.
  - Complete **Business Model/Lean Canvas** tailored to the business type.
  - A step-by-step **Execution Roadmap** broken down into phases.
  - A tailored **Marketing Strategy** and channels.
  - **Competitor Matrix** with strengths and weaknesses.

### 3. Interactive Business Canvas Editor
* **Route**: `/dashboard/canvas`
* **Behavior**: Allows users to view and interactively edit the generated Lean Canvas blocks (e.g. Problem, Solution, Key Metrics, Cost Structure).

### 4. Interactive Execution Roadmap & Knowledge Base
* **Route**: `/dashboard/roadmap`
* **Files**: `lib/knowledge-base.ts`, `hooks/use-roadmap.ts`
* **Behavior**: Renders the AI-generated phase-based checklist. It has:
  - Interactive checklists to mark tasks as completed.
  - An integrated **Persian Business Knowledge Base** supplying context, step-by-step guides, difficulty metrics, time estimates, and local service recommendations (e.g., registration on `nic.ir` for domains, `enamad.ir` for trust emblems, and Iranian payment gateways).

### 5. Copilot & AI Assistants
* **Routes**: `/dashboard/assistant`, `/dashboard/copilot`, `/dashboard/customer-bot`
* **File**: `lib/chat-actions.ts`
* **Behavior**: Inline AI chat interfaces assisting the user with copywriting, strategic brainstorming, marketing ideas, and real-time guidance.

### 6. Project Scoring & Feedback System
* **File**: `lib/scoring.ts`
* **Behavior**: Calculates a quality score (0 to 100) and gives a grade (`S`, `A`, `B`, `C`, `D`) based on how complete the project's foundation, strategy, market research, and execution progress are, while providing top actionable recommendations for improvement.

### 7. Iranian Payment & Billing Gateway
* **Files**: `lib/zibal.ts`, `lib/payment-actions.ts`
* **Behavior**: Handles subscriptions and transaction processing in Iranian Rials (IRR) via the **Zibal** gateway client, supporting automatic redirect, payment verification, and user tier updating (Free, Plus, Pro).

### 8. Export Capabilities
* **File**: `lib/export-utils.ts`
* **Behavior**: Allows users to export their business plan data into PDF, PPTX, or Image formats, using libraries like `html-to-image`, `jspdf`, and `pptxgenjs`.

---

## 🛠️ Technology Stack

| Technology Layer | Solution Used |
| :--- | :--- |
| **Framework** | Next.js (App Router, v16) |
| **Language** | TypeScript |
| **Runtime & Rendering** | React 19 (Server & Client Components) |
| **Database** | PostgreSQL |
| **Database ORM** | Prisma ORM (v7) |
| **Authentication** | NextAuth.js (v5, Beta) |
| **Object Storage** | AWS S3 SDK (configured for local/Liara S3 object storage) |
| **Styling** | Tailwind CSS v3, Framer Motion, Tailwind Animate |
| **UI Components** | Radix UI (Primitives), Lucide Icons, Sonner (Toasts) |
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
│   ├── ai/                    # Deep integration wrappers around AI APIs
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

## 📦 PWA & Service Worker
The application is configured to run as a Progressive Web Application (PWA).
- Configuration: `serwist.config.js`
- Service Worker Entrypoint: `app/sw.ts`
- Runs build-time asset caching during `npm run build`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- A running PostgreSQL Database instance
- OpenRouter API Key (placed in `.env`)
- Zibal Merchant ID (optional, for payments)

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
