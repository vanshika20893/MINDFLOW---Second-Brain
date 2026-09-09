Here is a professional, beautifully formatted **`README.md`** tailored specifically for your project.

You can add this to your GitHub repository in 1 minute using the GitHub website!

---

### How to Add It on GitHub (Takes 30 Seconds):

1. Go to your repository page on [github.com](https://github.com).
2. Click the button that says **"Add a README"** (or click **Add file** → **Create new file**, and name it `README.md`).
3. Copy the markdown content below and paste it into the editor.
4. Scroll down and click the green button: **Commit changes**.
5. Done! Your GitHub repository homepage will instantly look clean, polished, and professional.

---

### Copy and Paste This Content:

```markdown
<div align="center">

# 🧠 MindFlow OS 2.0
### *Your High-Velocity AI Second Brain*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-orange?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<p align="center">
  MindFlow transforms chaotic, stream-of-consciousness thoughts into structured action items, interactive neural topology graphs, and mental bandwidth analytics with zero cognitive friction.
</p>

</div>

---

## ✨ Key Features

* **🧠 Frictionless Thought Capture**: Write messy, unfiltered thoughts freely. Features tactile animations and an instant payment-app style "whoosh" feedback confirming your mind is clear.
* **⚡ Intelligent AI Task Extraction**: Powered by **Google Gemini 3.6 Flash** with multi-model failover and rule-based heuristic fallback. Automatically converts unstructured paragraphs into atomic, actionable to-do items.
* **🕸️ Synapse Neural Topology**: An interactive neural network powered by **React Flow (`@xyflow/react`)** that dynamically clusters thoughts into distinct life engines (*Work, Personal, Academic, Health*).
* **🎯 Prioritized Action Plan**: Linear-style task execution matrix with an integrated full-screen focus session countdown timer, duration presets, and progress tracking.
* **📊 Cognitive Load Analytics**: 7-day thought velocity heatmaps and live mental bandwidth percentage distribution.
* **🔒 Deterministic Persistence & Auth**: Multi-user account isolation with password complexity enforcement, local zero-loss atomic JSON storage, and seamless drop-in **PostgreSQL / Prisma** compatibility.

---

## 🏗️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons |
| **Interactive Graph** | `@xyflow/react` (React Flow) |
| **AI Intelligence** | Google Gemini API (`@google/genai` SDK) with heuristic regex fallback |
| **Backend Server** | Node.js, Express.js 4, CORS, dotenv |
| **Persistence Layer** | Dual-mode: Atomic JSON Store (`backend/data/store.json`) + Prisma ORM (PostgreSQL) |

---

## 📁 Project Structure

```
mindflow/
├── backend/                  # Express REST API Server
│   ├── data/                 # Local persistent data store
│   ├── prisma/               # Prisma schema & PostgreSQL migration setup
│   └── src/
│       ├── controllers/      # auth, dumps, and tasks controllers
│       ├── routes/           # REST route definitions
│       ├── services/         # Core business logic
│       ├── store/            # Atomic file storage engine
│       ├── app.js            # Express app configuration & CORS
│       └── server.js         # Backend server entry point (port 5001)
├── docs/                     # Architecture & developer documentation
├── public/                   # Emblems, branding assets, and icons
├── src/                      # Next.js Frontend Source
│   ├── app/                  # App router, globals.css & Gemini API route
│   ├── components/           # UI components (Dump, Plan, Connections, Insights, Login)
│   ├── lib/                  # REST API client & AI heuristic parser
│   └── types/                # Core TypeScript interfaces
├── package.json              # Frontend dependencies
└── tsconfig.json             # TypeScript configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.18 or higher recommended)
* `npm` or `yarn`
* A free [Google Gemini API Key](https://aistudio.google.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Configure Environment Variables
Create `.env.local` in the root directory:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
```

Configure the backend environment (optional; defaults to port 5001 and local file storage):
```bash
cd backend
cp .env.example .env
cd ..
```

---

### 3. Install Dependencies

Install frontend dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

---

### 4. Run Development Servers

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Running on http://localhost:5001
```

**Terminal 2 (Frontend Web App):**
```bash
npm run dev
# Running on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to launch your second brain!

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend health check |
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Authenticate existing user |
| `GET` | `/api/auth/me` | Verify active session |
| `GET` | `/api/dumps` | Retrieve thoughts strictly for authenticated user |
| `POST` | `/api/dumps` | Save new brain dump with AI extraction metadata |
| `DELETE` | `/api/dumps/:id` | Delete specific thought |
| `GET` | `/api/tasks` | Fetch user action items |
| `POST` | `/api/tasks` | Add manual action item |
| `PATCH` | `/api/tasks/:id` | Update task status (toggle completed) |

---

## 👩‍💻 Author

**Vanshika Goel**
* GitHub: [@vanshikagoel](https://github.com/vanshikagoel)

---

