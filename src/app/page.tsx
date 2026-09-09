"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { DumpView } from "@/components/features/dump/DumpView";
import { PlanView } from "@/components/features/plan/PlanView";
import { ConnectionsView } from "@/components/features/canvas/ConnectionsView";
import { InsightsView } from "@/components/features/insights/InsightsView";
import { LoginView } from "@/components/features/auth/LoginView";
import { detectThoughtMetadata, extractTasksWithAI } from "@/lib/ai-detector";
import { 
  checkApiHealth, 
  getBackendDumps, 
  postBackendDump, 
  deleteBackendDump, 
  logoutUser, 
  verifySession,
  getBackendTasks,
  postBackendTask,
  updateBackendTask,
  type AuthUser
} from "@/lib/api";
import type { NavPage } from "@/types";
import type { DumpItem } from "@/types";
import type { TaskItem } from "@/types";

const INITIAL_DUMPS: DumpItem[] = [];
const INITIAL_TASKS: TaskItem[] = [];

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [activePage, setActivePage] = useState<NavPage>("dump");
  const [dumps, setDumps] = useState<DumpItem[]>(INITIAL_DUMPS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Sync and verify login/logout state with backend on startup
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const saved = localStorage.getItem("braindump_user");
        if (saved && saved !== "null") {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id && parsed.id !== "dev-user-001" && parsed.id !== "user-dev") {
            const validUser = await verifySession(parsed.id);
            if (validUser) {
              if (isMounted) setCurrentUser(validUser);
            } else {
              const isAlive = await checkApiHealth();
              if (isAlive) {
                // Backend is online and verified user is not in database -> clean stale state
                localStorage.removeItem("braindump_user");
                if (isMounted) setCurrentUser(null);
              } else {
                // Offline fallback
                if (isMounted) setCurrentUser(parsed);
              }
            }
          } else {
            localStorage.removeItem("braindump_user");
            if (isMounted) setCurrentUser(null);
          }
        } else {
          if (isMounted) setCurrentUser(null);
        }
      } catch {
        if (isMounted) setCurrentUser(null);
      }
      if (isMounted) setIsAuthLoaded(true);
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("braindump_user");
      localStorage.setItem("braindump_logged_out", "true");
    }
  };

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("braindump_user", JSON.stringify(user));
      localStorage.removeItem("braindump_logged_out");
    }
  };

  // Load dumps & tasks strictly for currentUser
  useEffect(() => {
    if (!currentUser?.id) {
      setDumps([]);
      setTasks([]);
      return;
    }

    let isMounted = true;
    async function loadBackendData() {
      try {
        const isHealthy = await checkApiHealth();
        if (!isMounted) return;
        setBackendConnected(isHealthy);

        if (isHealthy) {
          const [backendDumps, backendTasks] = await Promise.all([
            getBackendDumps(currentUser?.id),
            getBackendTasks(currentUser?.id)
          ]);
          if (!isMounted) return;

          // Restore persistent completed task titles from localStorage mirror
          const completedSaved = typeof window !== "undefined" && currentUser?.id
            ? JSON.parse(localStorage.getItem(`braindump_completed_${currentUser.id}`) || "[]")
            : [];
          const completedSet = new Set<string>(completedSaved);

          const allTasks: TaskItem[] = [];

          // 1. Add persisted manual tasks
          backendTasks.forEach((bTask) => {
            allTasks.push({
              id: bTask.id,
              title: bTask.title,
              sourceDumpTitle: bTask.sourceDumpTitle || "Manual entry",
              type: bTask.type,
              priority: bTask.priority,
              timeframe: bTask.timeframe,
              dueDate: bTask.dueDate || "Today",
              completed: bTask.completed || completedSet.has(bTask.title) || completedSet.has(bTask.id),
              tags: bTask.tags || ["quick-task"],
            });
          });

          // 2. Convert and add brain dumps + extracted tasks
          const converted: DumpItem[] = backendDumps.map((bDump) => {
            const detected = (bDump as any).metadata || detectThoughtMetadata(bDump.content);
            const dateStr = bDump.createdAt
              ? new Date(bDump.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Just now";

            detected.extractedTasks?.forEach((item: any, idx: number) => {
              const taskId = `task-${bDump.id}-${idx}`;
              allTasks.push({
                id: taskId,
                title: item.text,
                sourceDumpTitle: bDump.content.slice(0, 26) + "...",
                type: item.type,
                priority: item.priority || detected.priority,
                timeframe: item.timeframe,
                dueDate: item.timeframe || (item.priority === "CRITICAL" ? "Today" : "This Week"),
                completed: completedSet.has(item.text) || completedSet.has(taskId),
                tags: [item.type?.toLowerCase() || "todo", (item.category || "").replace(/[^a-zA-Z]/g, "").toLowerCase()],
              });
            });

            return {
              id: bDump.id,
              rawText: bDump.content,
              category: detected.category,
              priority: detected.priority,
              isAudio: false,
              createdAt: dateStr,
              status: "SYNCED" as const,
              extractedTasks: detected.extractedTasks || [],
            };
          });

          setDumps(converted);
          setTasks(allTasks);
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("Backend not reachable yet (fallback to local state):", err);
        setBackendConnected(false);
      }
    }

    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Global ⌘K / Ctrl+K keyboard shortcut to jump directly to Capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActivePage("dump");
        setTimeout(() => {
          document.getElementById("main-capture-input")?.focus();
        }, 50);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCaptureSubmit = async ({ rawText, isAudio, metadata }: { rawText: string; isAudio: boolean; metadata?: any }) => {
    if (!currentUser?.id) return;
    const detected = metadata || await extractTasksWithAI(rawText);
    const tempId = `dump-${Date.now()}`;

    // 1. Optimistic UI: Add immediately to Dumps Feed
    const dumpEntry: DumpItem = {
      id: tempId,
      rawText,
      category: detected.category,
      priority: detected.priority,
      isAudio,
      createdAt: "Just now",
      status: "SYNCED",
      extractedTasks: detected.extractedTasks,
    };
    setDumps((prev) => [dumpEntry, ...prev]);

    // 2. Add Systematically Typed Tasks to Plan View
    const newTasks: TaskItem[] = detected.extractedTasks.map((item: any, idx: number) => ({
      id: `task-${tempId}-${idx}`,
      title: item.text,
      sourceDumpTitle: rawText.slice(0, 26) + "...",
      type: item.type,
      priority: item.priority || detected.priority,
      timeframe: item.timeframe,
      dueDate: item.timeframe || (item.priority === "CRITICAL" ? "Today" : "This Week"),
      completed: false,
      tags: [item.type.toLowerCase(), item.category.replace(/[^a-zA-Z]/g, "").toLowerCase()],
    }));
    setTasks((prev) => [...newTasks, ...prev]);

    // 3. Persist to Node/Express REST API (POST /api/dumps) bound strictly to currentUser.id
    setSaveStatus("saving");
    try {
      const saved = await postBackendDump(rawText, currentUser.id, detected);
      setDumps((prev) => prev.map((d) => (d.id === tempId ? { ...d, id: saved.id } : d)));
      setTasks((prev) => prev.map((t) => t.id.startsWith(`task-${tempId}`) ? { ...t, id: t.id.replace(tempId, saved.id) } : t));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.warn("Backend save failed, preserved locally in state:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3500);
    }
  };

  const handleToggleTask = async (id: string) => {
    let newCompleted = false;
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          newCompleted = !t.completed;
          return { ...t, completed: newCompleted };
        }
        return t;
      });
      if (typeof window !== "undefined" && currentUser?.id) {
        const completedTitles = updated.filter((t) => t.completed).map((t) => t.title);
        localStorage.setItem(`braindump_completed_${currentUser.id}`, JSON.stringify(completedTitles));
      }
      return updated;
    });

    if (currentUser?.id) {
      await updateBackendTask(id, { completed: newCompleted }, currentUser.id).catch(() => {});
    }
  };

  const handleAddTask = async (title: string, priority: "CRITICAL" | "HIGH" | "ROUTINE") => {
    if (!currentUser?.id) return;
    const detected = detectThoughtMetadata(title);
    const tempId = `task-${Date.now()}`;
    const taskEntry: TaskItem = {
      id: tempId,
      title,
      sourceDumpTitle: "Manual entry",
      priority: priority || detected.priority,
      dueDate: "Today",
      completed: false,
      tags: ["quick-task"],
    };
    setTasks((prev) => [taskEntry, ...prev]);

    try {
      const saved = await postBackendTask({
        id: tempId,
        title,
        priority: priority || detected.priority,
        dueDate: "Today",
        completed: false,
        tags: ["quick-task"],
        sourceDumpTitle: "Manual entry"
      }, currentUser.id);
      if (saved?.id && saved.id !== tempId) {
        setTasks((prev) => prev.map((t) => t.id === tempId ? { ...t, id: saved.id } : t));
      }
    } catch (err) {
      console.warn("Failed to persist manual task to backend:", err);
    }
  };

  const handleDeleteDump = async (id: string) => {
    setDumps((prev) => prev.filter((d) => d.id !== id));
    setTasks((prev) => prev.filter((t) => !t.id.includes(id)));
    if (currentUser?.id) {
      await deleteBackendDump(id, currentUser.id);
    }
  };

  if (isAuthLoaded && !currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="relative min-h-screen bg-[#0d0e11] cyber-grid text-zinc-100 flex flex-col overflow-x-hidden selection:bg-[#f26419]/30 selection:text-[#f5c7a9]">
      {/* Ambient Spatial Lighting (Copper Amber & Warm Peach Mesh Glows) */}
      <div className="fixed top-[-10%] left-[15%] w-[550px] h-[420px] bg-[#f26419]/[0.09] blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-[30%] right-[10%] w-[520px] h-[460px] bg-[#f5c7a9]/[0.06] blur-[180px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[30%] w-[650px] h-[380px] bg-[#f26419]/[0.06] blur-[190px] pointer-events-none -z-10" />
      
      {/* Top Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        dumpCount={dumps.length}
        taskCount={tasks.filter((t) => !t.completed).length}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Page Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
        <div key={activePage} className="animate-in fade-in duration-300">
          {activePage === "dump" && (
            <DumpView
              dumps={dumps}
              onSubmitDump={handleCaptureSubmit}
              onDeleteDump={handleDeleteDump}
              onNavigate={setActivePage}
              saveStatus={saveStatus}
            />
          )}

          {activePage === "plan" && (
            <PlanView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
            />
          )}

          {activePage === "connections" && (
            <ConnectionsView dumps={dumps} onNavigate={setActivePage} />
          )}

          {activePage === "insights" && (
            <InsightsView dumps={dumps} tasks={tasks} />
          )}
        </div>
      </main>

      {/* Editorial Marquee Ticker (MindFlow Design System) */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#121418]/90 backdrop-blur-md py-2.5 overflow-hidden select-none">
        <div className="animate-marquee font-heading text-xs uppercase tracking-widest text-[#f5c7a9]/80 flex items-center space-x-8 whitespace-nowrap">
          <span className="flex items-center gap-3">
            <span className="text-[#f26419]">✦</span> MINDFLOW // YOUR SECOND BRAIN
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[#f26419]">✦</span> IT ALL BEGINS WITH A THOUGHT
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[#f26419]">✦</span> TURN CHAOS INTO CLARITY
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[#f26419]">✦</span> HIGH VELOCITY SYNAPSE INTELLIGENCE
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[#f26419]">✦</span> ZERO COGNITIVE OVERHEAD
          </span>
          {/* Duplicate set for seamless continuous marquee loop */}
          <span className="flex items-center gap-3">
            <span className="text-[#f26419]">✦</span> MINDFLOW // YOUR SECOND BRAIN
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[#f26419]">✦</span> IT ALL BEGINS WITH A THOUGHT
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[#f26419]">✦</span> TURN CHAOS INTO CLARITY
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[#f26419]">✦</span> HIGH VELOCITY SYNAPSE INTELLIGENCE
          </span>
          <span className="flex items-center gap-3">
            <span className="text-[#f26419]">✦</span> ZERO COGNITIVE OVERHEAD
          </span>
        </div>
      </footer>
    </div>
  );
}
