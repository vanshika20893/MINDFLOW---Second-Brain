# MindFlow OS 2.0 Architecture & Developer Guide

Welcome to the **MindFlow** codebase! This guide provides a clear, beginner-friendly explanation of how the project is structured, how data flows through the application, and how to contribute new features.

---

## 1. Project Overview

MindFlow is an AI-powered "Second Brain" productivity application designed to capture raw, unstructured stream-of-consciousness thoughts and turn them into structured, actionable items, interactive neural connection maps, and cognitive load analytics.

### Tech Stack
* **Frontend Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack-ready)
* **Frontend Library**: React 19
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with obsidian glassmorphic design tokens
* **Interactive Graphs**: [@xyflow/react](https://reactflow.dev/) (React Flow)
* **Icons**: [Lucide React](https://lucide.dev/)
* **AI Intelligence**: Google Gemini 3.6 Flash via official `@google/genai` SDK
* **Backend Framework**: [Node.js](https://nodejs.org/) & [Express 4](https://expressjs.com/)
* **Persistence Layer**: Dual-compatible storage:
  * **Development / Portable**: Atomic local JSON storage (`backend/data/store.json` managed by `fileStore.js`)
  * **Production / Scaled**: [Prisma ORM](https://www.prisma.io/) with PostgreSQL

---

## 2. Directory Structure

```
.
├── backend/                  # Express REST API Server
│   ├── data/                 # Persistent local JSON data store (store.json)
│   ├── prisma/               # Prisma schema & PostgreSQL migration definitions
│   └── src/
│       ├── controllers/      # Request validation & HTTP response handling
│       │   ├── auth.controller.js
│       │   ├── dumps.controller.js
│       │   └── tasks.controller.js
│       ├── routes/           # Express route definitions
│       │   ├── auth.routes.js
│       │   ├── dumps.routes.js
│       │   ├── health.routes.js
│       │   └── tasks.routes.js
│       ├── services/         # Business logic & data access
│       │   ├── auth.service.js
│       │   ├── dumps.service.js
│       │   └── tasks.service.js
│       ├── store/            # Atomic file storage engine (fileStore.js)
│       ├── app.js            # Express app configuration & middleware
│       ├── db.js             # Prisma client instance
│       └── server.js         # Server entry point (starts on port 5001)
├── docs/                     # Documentation
│   └── ARCHITECTURE.md       # This file
├── public/                   # Static branding assets & emblems
├── src/                      # Next.js Frontend Source
│   ├── app/                  # Next.js App Router
│   │   ├── api/gemini/       # Server-side Gemini AI extraction route
│   │   │   └── route.ts
│   │   ├── globals.css       # Design tokens, cyber-grid, glass effects, animations
│   │   ├── layout.tsx        # Root HTML layout, metadata & fonts
│   │   └── page.tsx          # Main application orchestrator & view switcher
│   ├── components/           # UI Components
│   │   ├── features/         # Domain-specific views
│   │   │   ├── auth/         # Login & Create ID view (LoginView.tsx)
│   │   │   ├── canvas/       # Interactive neural graph (ConnectionsView.tsx)
│   │   │   ├── dump/         # Thought capture stream & feed (DumpView.tsx)
│   │   │   ├── insights/     # Cognitive analytics & digest (InsightsView.tsx)
│   │   │   └── plan/         # Action checklist & fullscreen timer (PlanView.tsx)
│   │   └── layout/           # Global chrome & navigation (Navbar.tsx)
│   ├── lib/                  # Utilities, API clients, and heuristic fallbacks
│   │   ├── ai-detector.ts    # Heuristic thought parser & AI extractor caller
│   │   ├── api.ts            # Typed REST client communicating with Express backend
│   │   └── utils.ts          # Classname helper (twMerge + clsx)
│   └── types/                # Core shared TypeScript types (DumpItem, TaskItem, NavPage)
│       └── index.ts
├── package.json              # Frontend dependencies and npm scripts
└── tsconfig.json             # TypeScript configuration
```

---

## 3. Key Architectural Concepts

### A. State Management & Navigation
* The application runs as a cohesive Single Page Application (SPA) driven by `src/app/page.tsx`.
* Navigation between the 4 primary hubs (`dump`, `plan`, `connections`, `insights`) is controlled by the `activePage` state.
* The top navigation bar (`Navbar.tsx`) allows instant tab switching with live count badges.

### B. Dual-Store Persistence Model
* In development or without PostgreSQL, the backend writes atomically to `backend/data/store.json` using `fileStore.js`.
* When a PostgreSQL database connection string is provided in `.env`, the services automatically switch to Prisma without changing any API contracts.
* This guarantees that data persists across application restarts, server reboots, and device terminations.

### C. Authentication & Multi-User Isolation
* User sessions are persisted locally via `localStorage.getItem("braindump_user")`.
* Every API request passes the user ID in the `x-user-id` HTTP header.
* The backend strictly scopes all reads, writes, and deletes by `userId`, preventing cross-user data leakage.

### D. AI Task Extraction Flow
1. User types or pastes raw thoughts in `DumpView.tsx`.
2. On submission, the text is sent to `/api/gemini/route.ts`.
3. The server uses Gemini 3.6 Flash (with automatic fallbacks across multiple models) to break messy text into atomic action tasks.
4. If offline or if the API key is absent, `src/lib/ai-detector.ts` seamlessly falls back to a deterministic rule-based parser.
5. The extracted items are saved to the backend and immediately populated into the **Plan** and **Connections** views.

---

## 4. How to Add New Features

### Adding a New Navigation View
1. Define the new page identifier in `src/types/index.ts`:
   ```ts
   export type NavPage = "dump" | "plan" | "connections" | "insights" | "newview";
   ```
2. Create your view component in `src/components/features/newview/NewView.tsx`.
3. Add a navigation item in `src/components/layout/Navbar.tsx`.
4. Render the component conditionally in `src/app/page.tsx`:
   ```tsx
   {activePage === "newview" && <NewView />}
   ```

### Adding a New Backend Endpoint
1. Add the route in `backend/src/routes/<feature>.routes.js`.
2. Add controller logic in `backend/src/controllers/<feature>.controller.js`.
3. Add data persistence logic in `backend/src/services/<feature>.service.js`.
4. Expose the client method in `src/lib/api.ts`.

---

## 5. Development & Build Commands

### Frontend (Next.js)
```bash
# Start development server on http://localhost:3000
npm run dev

# Compile production build & verify types
npm run build

# Start production server
npm run start
```

### Backend (Express)
```bash
# In the backend directory:
cd backend

# Start backend dev server on http://localhost:5001 (with auto-reload)
npm run dev

# Check server health
curl http://localhost:5001/api/health
```

---

## 6. Code Style & Conventions

* **Components**: Named exports with PascalCase (e.g., `export function DumpView()`).
* **Client Directives**: Add `"use client";` at the very top of components using React hooks or browser APIs.
* **Styling**: Use utility classes from Tailwind CSS. Reusable luxury obsidian patterns are defined in `src/app/globals.css` (e.g., `glass-obsidian`, `glass-luxury`, `btn-pill-kinetic`, `badge-peach`).
* **Imports**: Use TypeScript path aliases (`@/components/...`, `@/lib/...`, `@/types/...`).
