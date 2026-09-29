# 🤖 AGENTS.md — AI Agent Operating Manual & Architecture Guidelines

Welcome to **AL-TASK** (Jira + Confluence Clone). This document provides immediate, authoritative context and behavioral guidelines for all AI agents working on this repository.

---

## 🎯 Project Overview & Scope
- **Domain**: Jira + Confluence Clone for Agile teams.
- **Architectural Principle**: **Lean Single-Instance Architecture (Zero-Overengineering)**.
- **Eliminated Overengineering**:
  - ❌ **NO Redis / Upstash**: Handled via native in-memory adapters and sliding windows.
  - ❌ **NO LiveKit / Video Calls**: Chat and video modules have been fully pruned.
  - ❌ **NO Distributed Pub/Sub**: Single-instance WebSocket natively handled by Socket.IO `IoAdapter`.
- **5 Core Pillars**:
  1. Multi-tenant Workspaces & RBAC (Owner, Workspace Admin, Member, Viewer).
  2. Real-time Jira Kanban Board (@dnd-kit + Optimistic UI + Error Rollbacks).
  3. Confluence Wiki Tree + TipTap Markdown Editor (1.5s Debounced Auto-save).
  4. Bidirectional Task ↔ Document Linking (`linkedPageIds` ↔ `linkedTaskIds`).
  5. High-Performance Dashboard (Single MongoDB `$facet` Aggregation pipeline, sub-30ms).

---

## 🧭 Codebase Map & Tech Stack

### Monorepo & Submodule Layout
```
AL-TASK/
├── README.md               # International standard portfolio showcase
├── REFACTORING_NOTES.md    # Master refactoring history and deep context
├── AGENTS.md               # AI Agent operating manual (this file)
├── backend/                # NestJS 11 + Mongoose + Socket.IO (Port 5512)
└── frontend/               # Next.js 15 (React 19) + TanStack Query + Zustand (Port 3000)
```

### Key Files & Endpoints
| Component | Path / Endpoint | Purpose |
|---|---|---|
| **Task ↔ Page Linking (BE)** | `backend/src/modules/tasks/controllers/task-links.controller.ts` | `POST /tasks/:taskId/links/page`, `GET /pages/:pageId/linked-tasks` |
| **Task Links Service (BE)** | `backend/src/modules/tasks/services/task-links.service.ts` | Atomic push/pull to `linkedPageIds` and `linkedTaskIds` |
| **Dashboard $facet (BE)** | `backend/src/modules/dashboard/services/dashboard.service.ts` | Sub-30ms single aggregation pipeline |
| **Task & Page Schemas (BE)** | `backend/src/modules/tasks/schemas/task.schema.ts`, `page.schema.ts` | Compound indexes and relational fields |
| **Seed Script (BE)** | `backend/scripts/seed-portfolio.ts` | Seeds 4 users, FinTech workspace, 24 tasks, 6 wiki pages |
| **Task Linked Pages Panel (FE)**| `frontend/src/modules/workspace/tasks/detail/TaskLinkedPagesPanel.tsx` | Search & attach Confluence docs to tasks |
| **Page Linked Tasks Panel (FE)**| `frontend/src/modules/docs/components/PageLinkedTasksPanel.tsx` | View tasks referencing the Confluence doc |
| **1-Click Demo Login (FE)** | `frontend/src/modules/auth/login/components/LoginForm.tsx` | Instant evaluation button for recruiters |

---

## ⚡ Essential Commands Cheat Sheet

```bash
# 1. Run Portfolio Demo Seed
pnpm --filter backend run seed:portfolio

# 2. Run Backend Tests (Must always be 100% pass)
pnpm --filter backend test

# 3. Build Backend
pnpm --filter backend build

# 4. Build Frontend
pnpm --filter frontend build

# 5. Start Local Dev Servers
pnpm --filter backend dev
pnpm --filter frontend dev
```

---

## 🚨 Critical Agent Rules & Gotchas

1. **PowerShell Statement Separator (Windows)**:
   - Always use `;` to chain commands in PowerShell. **NEVER use `&&`**, which triggers syntax errors in Windows PowerShell 5.1.
2. **UsersService Method**:
   - Call `usersService.getUserById(id: string)`, **NOT** `findById`.
3. **NestJS Unit Testing with Guards**:
   - In controllers protected with `@UseGuards(JwtAuthGuard)`, always override the guard in unit tests:
     ```typescript
     .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
     ```
4. **Dynamic Imports in Frontend**:
   - Heavy editor components (`TiptapEditor`, `OnlineDocumentEditorModal`) must be imported using `next/dynamic` with `{ ssr: false }` to keep initial bundle sizes low.
5. **Zero Failure Tolerance in Tests**:
   - The test suite has **54 suites, 461 unit tests**. All 461 tests must pass (100% pass rate) before concluding any task.
