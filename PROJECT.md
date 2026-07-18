# Project: Karnex Canvas & Pitch Deck Overhaul

## Architecture
Karnex is an AI-powered smart co-founder tailored for the Iranian market. This project focuses on overhauling two key interactive features: the **Business Canvas** and the **Pitch Deck Builder**.

### Data Storage & Flow
1. **Canvas**:
   - Cards, templates, and view modes are migrated from the legacy `Project.data` JSONB blob into structured database tables: `Canvas`, `Card`, `CanvasVersion`, and `Comment`.
   - The frontend communicates with `/api/projects/[projectId]/canvas/[canvasId]` for CRUD operations.
   - A Zustand store (`lib/canvas/store.ts`) handles local state, undo/redo (via `zundo`), and triggers a debounced autosave.
2. **Pitch Deck**:
   - Slides, layouts, and themes are stored in the `Project.data.pitchDeck` JSONB array.
   - The frontend manages slide state in the local workspace component and syncs edits back to PostgreSQL.
   - The Pitch Deck pulls context dynamically from the project's Lean Canvas, Competitors, and Roadmap models.

---

## Code Layout
All source code and test files must reside in the repository paths, not in `.agents/`.
- `app/dashboard/canvas/`: Canvas page routing, provider mounting, and loading views.
- `components/dashboard/canvas/`: Canvas UI components (board, toolbar, topbar, cards, sections, minimap, panels).
- `lib/canvas/`: Client state (`store.ts`), export utils (`export.ts`), templates registry (`templates.ts`), completeness logic (`completeness.ts`), and API client (`api.ts`).
- `app/dashboard/pitch-deck/`: Pitch Deck page routing and gate checks.
- `components/features/pitch-deck/`: Pitch Deck builder main container, preview layouts, wizard forms, and slide templates.
- `lib/pitch-deck/`: Custom hooks and utilities for Pitch Deck state management.
- `tests/canvas/`: Vitest test suite for Canvas CRUD, state sync, and canvas-roadmap integrations.
- `tests/pitch-deck/`: Vitest test suite for Pitch Deck slide operations, theme switching, and exports.

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Database Persistence & Canvas Versioning | Refactor Canvas persistence to use structured database tables (`Card`, `Canvas`, `CanvasVersion`), write data migration script, and restore snapshot-based history versioning. | None | DONE |
| 2 | Canvas View Modes & Presentation Mode Overhaul | Rework Canvas UI with premium themes (Vazirmatn typography, HSL palettes, glassmorphism). Implement Grid and Freeform mode toggles, absolute positioning, SVG connection lines, zoom/pan, and full-screen Canvas presentation mode. | Milestone 1 | DONE |
| 3 | Pitch Deck Theme Engine & Slide Layouts | Rework Pitch Deck to a dark-mode split workspace. Implement selectable themes and specialized slide layouts (TAM/SAM/SOM concentric circles, roadmap timelines, competitor matrix, team cards, ask split-card). | None | DONE |
| 4 | Bidirectional Sync & AI Copilot Integration | Sync Canvas checklist items directly to `/dashboard/roadmap` tasks. Implement One-click Canvas Generator, Section Brainstormer, and Canvas Critique. Integrate Pitch Deck AI Sidebar (rewriter, translator, script generator, and Investor-Readiness Scorecard). | Milestones 2, 3 | DONE |
| 5 | Advanced Export Engines & Presenter cockpit | High-fidelity client-side PPTX exports using `pptxgenjs` (with styling, tables, shapes) and landscape A4 print PDF styles for both Canvas and Pitch Deck. Create Pitch Deck Presenter Cockpit and shareable presentation URLs. Write unit tests. | Milestones 2, 3, 4 | DONE |

---

## Interface Contracts

### 1. Canvas Database Schema (Prisma)
We leverage and ensure alignment with the following schema relations:
```prisma
model Canvas {
  id        String          @id @default(cuid())
  projectId String
  project   Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title     String
  template  String          @default("LEAN") // BMC, LEAN, SWOT, etc.
  cards     Card[]
  versions  CanvasVersion[]
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
}

model Card {
  id        String   @id @default(cuid())
  canvasId  String
  canvas    Canvas   @relation(fields: [canvasId], references: [id], onDelete: Cascade)
  section   String   // e.g., "problem", "solution"
  content   String   @db.Text
  type      String   @default("TEXT") // TEXT, CHECKLIST, METRIC, LINK, IMAGE
  color     String   @default("yellow")
  x         Float    @default(0)
  y         Float    @default(0)
  w         Float    @default(200)
  h         Float    @default(150)
  order     Int      @default(0)
  metadata  Json?    // For checklist subtasks, metric targets, links, etc.
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Canvas Checklist & Roadmap Synchronization
- **Function**: `promoteCanvasCardToRoadmapTask(projectId: string, cardId: string, roadmapPhaseId: string, taskDetails: any)`
- **Request Type**: Server Action / API call (POST `/api/projects/[projectId]/canvas/promote-task`)
- **Return Type**: `Promise<{ success: boolean; task: RoadmapTask }>`

### 3. Pitch Deck Slide Metadata Schema
```typescript
export interface PitchDeckSlideMetadata {
  theme?: string;         // active theme name
  // Slide-specific structures
  tam?: number;           // Total Addressable Market value
  sam?: number;           // Serviceable Addressable Market value
  som?: number;           // Serviceable Obtainable Market value
  models?: Array<{ title: string; desc: string }>; // Revenue model streams
  competitors?: Array<{ name: string; strength: string; weakness: string }>; // Competitor SWOT properties
}
```
