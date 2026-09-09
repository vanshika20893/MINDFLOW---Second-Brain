"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Play, 
  Pause, 
  X, 
  AlertCircle, 
  Hourglass, 
  Check, 
  Minimize2, 
  Clock,
  ChevronDown
} from "lucide-react";
import type { TaskItem } from "@/types";

interface PlanViewProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, priority: "CRITICAL" | "HIGH" | "ROUTINE") => void;
}

export function PlanView({ tasks, onToggleTask, onAddTask }: PlanViewProps) {
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // =========================================================================
  // FOCUS TIME & WHOLE SCREEN TIMER STATE
  // =========================================================================

  // Helper to generate default suggested focus time based on priority
  const getDefaultFocusTime = (task: TaskItem): number => {
    if (task.priority === "CRITICAL") return 30;
    if (task.priority === "HIGH") return 25;
    return 15;
  };

  // Custom focus duration overrides per task (task.id -> minutes)
  const [taskFocusTimes, setTaskFocusTimes] = useState<Record<string, number>>({});

  // Setup Modal State (Triggered when user clicks "Start" on a task)
  const [setupTask, setSetupTask] = useState<TaskItem | null>(null);
  const [durationHours, setDurationHours] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  // Fullscreen Timer State
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [sessionInitialSeconds, setSessionInitialSeconds] = useState<number>(0);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [isFullScreenTimerOpen, setIsFullScreenTimerOpen] = useState<boolean>(false);

  // Completion State (Inside Fullscreen Overlay)
  const [completionData, setCompletionData] = useState<{
    taskId: string;
    focusedMinutes: number;
    showBlockedInput: boolean;
    blockedNote: string;
  } | null>(null);

  // Active Task Object
  const activeTask = tasks.find((t) => t.id === activeTimerTaskId) || null;

  // Countdown Interval Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTimerTaskId && !isTimerPaused && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            const focusedMinutes = Math.max(1, Math.round(sessionInitialSeconds / 60));
            triggerSessionCompletion(activeTimerTaskId, focusedMinutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimerTaskId, isTimerPaused, timerSecondsLeft, sessionInitialSeconds]);

  // Open the Time Configuration pop-up for a task (Suggested time is already set in it)
  const openFocusSetup = (task: TaskItem) => {
    const suggestedMins = taskFocusTimes[task.id] || getDefaultFocusTime(task);
    setSetupTask(task);
    setDurationHours(Math.floor(suggestedMins / 60));
    setDurationMinutes(suggestedMins % 60);
    setDurationSeconds(0);
  };

  // Start the Fullscreen Timer from Setup Pop-up
  const startFocusSessionFromSetup = () => {
    if (!setupTask) return;
    const totalSecs = (durationHours * 3600) + (durationMinutes * 60) + durationSeconds;
    const finalSeconds = totalSecs > 0 ? totalSecs : 25 * 60;
    const finalMinutes = Math.max(1, Math.round(finalSeconds / 60));

    setTaskFocusTimes((prev) => ({ ...prev, [setupTask.id]: finalMinutes }));

    setActiveTimerTaskId(setupTask.id);
    setSessionInitialSeconds(finalSeconds);
    setTimerSecondsLeft(finalSeconds);
    setIsTimerPaused(false);
    setCompletionData(null);
    setIsFullScreenTimerOpen(true);
    setSetupTask(null);
  };

  const pauseTimer = () => setIsTimerPaused(true);
  const resumeTimer = () => setIsTimerPaused(false);

  const addExtraMinutes = (extraMinutes: number) => {
    setTimerSecondsLeft((prev) => prev + extraMinutes * 60);
    setSessionInitialSeconds((prev) => prev + extraMinutes * 60);
  };

  const finishTimerEarly = () => {
    if (!activeTimerTaskId) return;
    const elapsedSeconds = sessionInitialSeconds - timerSecondsLeft;
    const focusedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    triggerSessionCompletion(activeTimerTaskId, focusedMinutes);
  };

  const triggerSessionCompletion = (taskId: string, minutes: number) => {
    setIsTimerPaused(true);
    setCompletionData({
      taskId,
      focusedMinutes: minutes,
      showBlockedInput: false,
      blockedNote: "",
    });
    setIsFullScreenTimerOpen(true);
  };

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
    }
    return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const handleCompleteTask = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (targetTask && !targetTask.completed) {
      onToggleTask(taskId);
    }
    closeFullscreenSession();
  };

  const handleNeedMoreTime = (taskId: string) => {
    setCompletionData(null);
    const targetTask = tasks.find((t) => t.id === taskId);
    if (targetTask) {
      setIsFullScreenTimerOpen(false);
      openFocusSetup(targetTask);
    }
  };

  const closeFullscreenSession = () => {
    setActiveTimerTaskId(null);
    setTimerSecondsLeft(0);
    setIsTimerPaused(false);
    setCompletionData(null);
    setIsFullScreenTimerOpen(false);
  };

  // Progress computation for whole screen progress bar
  const totalSeconds = sessionInitialSeconds;
  const elapsedSeconds = totalSeconds > 0 ? totalSeconds - timerSecondsLeft : 0;
  const timerPercent = totalSeconds > 0 ? Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 100)) : 0;

  // =========================================================================

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = 
      filter === "ALL" ? true : filter === "PENDING" ? !t.completed : t.completed;
    const matchesPriority =
      priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), "HIGH");
    setNewTaskTitle("");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Calm Header Card */}
      <div className="relative rounded-3xl glass-luxury bg-[#131519]/90 p-6 sm:p-8 border border-white/[0.08] shadow-2xl overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#ff541e]/15 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#f5c7a9]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="badge-peach">✦ VELOCITY MATRIX</span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#f5c7a9]/70">Prioritized Execution</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-italic-headline text-white tracking-tight">
              ACTION <span className="text-[#ff541e] text-glow-orange">PLAN</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 font-body mt-1">
              One clear, focused task at a time. Converted dynamically from your raw thoughts.
            </p>
          </div>

          <span className="badge-luxury text-[#f5c7a9] text-xs self-start sm:self-auto border-white/10 bg-white/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff541e] animate-pulse" />
            <span className="font-heading tracking-wider">{tasks.filter(t => !t.completed).length} pending actions</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 p-4 rounded-2xl bg-[#0a0b0e] border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#f5c7a9]/80 font-heading uppercase tracking-wider">Weekly Progress</span>
            <span className="text-zinc-200 font-bold">{completedCount} of {tasks.length} completed ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/70 overflow-hidden border border-white/[0.06]">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#ff541e] via-[#f5c7a9] to-[#ff541e] transition-all duration-500 shadow-sm shadow-[#ff541e]/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Add Custom Task Input */}
        <form onSubmit={handleAddNew} className="relative z-10 mt-4 flex items-center gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add an action item... (Press Enter)"
            className="flex-1 rounded-2xl bg-[#0a0b0e] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 border border-white/[0.08] focus:border-[#ff541e]/60 focus:outline-none focus:ring-2 focus:ring-[#ff541e]/20 transition-all shadow-inner font-body"
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="btn-pill-kinetic flex items-center gap-2 py-3 px-5 text-xs font-heading tracking-wider uppercase disabled:opacity-30 transition-all shadow-md shadow-[#ff541e]/25"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Task →</span>
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-[#16181c] p-1 rounded-full border border-white/[0.08] shadow-sm">
          {(["ALL", "PENDING", "COMPLETED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-heading tracking-wider uppercase transition-all duration-200 ${
                filter === f
                  ? "bg-gradient-to-r from-[#ff541e] to-[#e6420f] text-white shadow-md shadow-[#ff541e]/30 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {f === "ALL" ? "All Tasks" : f === "PENDING" ? "To Do" : "Completed"}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#f5c7a9]/70 font-mono text-[11px] hidden sm:inline uppercase tracking-wider">Priority:</span>
          {["ALL", "CRITICAL", "HIGH"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-medium transition-all ${
                priorityFilter === p
                  ? "bg-[#ff541e]/20 text-[#ff6a38] border border-[#ff541e]/40 shadow-sm font-bold"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]"
              }`}
            >
              {p === "CRITICAL" ? "🔥 Urgent" : p === "HIGH" ? "⚡ High" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Task Matrix Cards (Linear-Style Rows) */}
      <div className="grid gap-2.5">
        {filteredTasks.length === 0 ? (
          <div className="glass-luxury rounded-3xl p-12 text-center space-y-2 border border-white/[0.08]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">All Caught Up</h3>
            <p className="text-xs text-zinc-400">No tasks match this filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isTimerRunning = activeTimerTaskId === task.id;

            return (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`glass-luxury rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 group border ${
                  task.completed ? "opacity-45 bg-black/20" : "border-white/[0.06] hover:border-[#ff541e]/30"
                } ${isTimerRunning ? "border-[#ff541e] shadow-xl shadow-[#ff541e]/30 bg-[#16181c]" : ""}`}
              >
                {/* Left Section */}
                <div className="flex items-start gap-3.5 flex-1">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className={`p-1 mt-0.5 rounded-lg transition-all ${
                      task.completed 
                        ? "text-[#f5c7a9]" 
                        : "text-zinc-500 hover:text-[#ff541e] group-hover:scale-105"
                    }`}
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-[#f5c7a9]" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-500 group-hover:text-[#ff541e] transition-colors" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.type && (
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                          task.type === "ROUTINE"
                            ? "bg-indigo-950/80 text-indigo-300 border border-indigo-700/50"
                            : task.type === "PROJECT"
                            ? "bg-purple-950/80 text-purple-300 border border-purple-700/50"
                            : task.type === "IDEA"
                            ? "bg-amber-950/80 text-amber-300 border border-amber-700/50"
                            : "bg-[#ff541e]/15 text-[#ff6a38] border border-[#ff541e]/30"
                        }`}>
                          {task.type === "ROUTINE" ? "🔁 Routine" : task.type === "PROJECT" ? "🚀 Project" : task.type === "IDEA" ? "💡 Idea" : "⚡ To-Do"}
                        </span>
                      )}
                      <h4 className={`text-sm sm:text-base font-semibold text-white transition-colors font-body ${
                        task.completed ? "line-through text-zinc-500" : "group-hover:text-[#f5c7a9]"
                      }`}>
                        {task.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-zinc-400 flex-wrap font-sans">
                      <span className="text-zinc-500 text-[11px]">from &ldquo;{task.sourceDumpTitle}&rdquo;</span>
                      <span className="text-zinc-600">•</span>
                      <span className="flex items-center gap-1 text-zinc-300 font-mono text-[11px]">
                        <Calendar className="w-3 h-3 text-[#ff541e]" />
                        {task.type === "ROUTINE" ? `Schedule: ${task.dueDate}` : `Due: ${task.dueDate}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {task.priority === "CRITICAL" ? (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium shrink-0 bg-[#ff541e]/15 text-[#ff6a38] border border-[#ff541e]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff541e]" />
                      Urgent
                    </span>
                  ) : task.priority === "HIGH" ? (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium shrink-0 bg-[#f5c7a9]/15 text-[#f5c7a9] border border-[#f5c7a9]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f5c7a9]" />
                      High
                    </span>
                  ) : null}

                  {isTimerRunning ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFullScreenTimerOpen(true);
                      }}
                      className="btn-pill-kinetic flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold animate-pulse"
                      title="Click to view full screen timer"
                    >
                      <Play className="w-3 h-3 fill-current text-[#f5c7a9]" />
                      <span>Focus: {formatTimer(timerSecondsLeft)}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFocusSetup(task);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-heading font-semibold text-[#f5c7a9] hover:text-white bg-[#16181c] hover:bg-[#ff541e]/20 border border-white/[0.08] hover:border-[#ff541e]/40 transition-all shadow-sm group-hover:border-[#ff541e]/30 uppercase tracking-wider"
                    >
                      <Play className="w-3 h-3 text-[#ff541e] fill-current" />
                      <span>Focus</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* POP-UP FOR SETTING TIME */}
      {/* ========================================================================= */}
      {setupTask && (
        <div 
          onClick={() => setSetupTask(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl glass-luxury border border-white/[0.1] bg-[#121418] p-6 sm:p-7 shadow-2xl shadow-black space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ff541e]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                  Focus Duration
                </h3>
              </div>
              <button 
                onClick={() => setSetupTask(null)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task context */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Target Task</span>
              <p className="text-sm font-semibold text-white line-clamp-1">{setupTask.title}</p>
            </div>

            {/* Suggested Time Notice (Pre-set) */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono">Suggested duration:</span>
              <button
                type="button"
                onClick={() => {
                  const suggested = getDefaultFocusTime(setupTask);
                  setDurationHours(Math.floor(suggested / 60));
                  setDurationMinutes(suggested % 60);
                  setDurationSeconds(0);
                }}
                className="font-mono font-bold text-[#ff541e] bg-[#ff541e]/15 border border-[#ff541e]/30 px-2.5 py-0.5 rounded-lg hover:bg-[#ff541e]/25 transition-colors"
                title="Click to apply suggested duration"
              >
                {getDefaultFocusTime(setupTask)} min (Suggested)
              </button>
            </div>

            {/* Hours, Minutes, Seconds Dropdowns */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#f5c7a9]/80 uppercase tracking-wider block">
                Set Duration (Hr / Min / Sec):
              </span>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Hours Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                    Hours (hr)
                  </label>
                  <div className="relative">
                    <select
                      value={durationHours}
                      onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
                      className="w-full appearance-none rounded-xl bg-black/80 border border-white/[0.1] pl-3 pr-7 py-2.5 text-xs font-mono font-bold text-white focus:border-[#ff541e]/80 focus:outline-none focus:ring-1 focus:ring-[#ff541e]/20 transition-all cursor-pointer hover:border-white/20"
                    >
                      {Array.from({ length: 13 }, (_, i) => (
                        <option key={i} value={i} className="bg-[#121418] text-white">
                          {i} hr
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Minutes Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                    Minutes (min)
                  </label>
                  <div className="relative">
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                      className="w-full appearance-none rounded-xl bg-black/80 border border-white/[0.1] pl-3 pr-7 py-2.5 text-xs font-mono font-bold text-white focus:border-[#ff541e]/80 focus:outline-none focus:ring-1 focus:ring-[#ff541e]/20 transition-all cursor-pointer hover:border-white/20"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i} className="bg-[#121418] text-white">
                          {i} min
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Seconds Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                    Seconds (sec)
                  </label>
                  <div className="relative">
                    <select
                      value={durationSeconds}
                      onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10))}
                      className="w-full appearance-none rounded-xl bg-black/80 border border-white/[0.1] pl-3 pr-7 py-2.5 text-xs font-mono font-bold text-white focus:border-[#ff541e]/80 focus:outline-none focus:ring-1 focus:ring-[#ff541e]/20 transition-all cursor-pointer hover:border-white/20"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i} className="bg-[#121418] text-white">
                          {i < 10 ? `0${i}` : i} sec
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Quick Presets:
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: "15m", h: 0, m: 15, s: 0 },
                  { label: "25m", h: 0, m: 25, s: 0 },
                  { label: "30m", h: 0, m: 30, s: 0 },
                  { label: "45m", h: 0, m: 45, s: 0 },
                  { label: "1h", h: 1, m: 0, s: 0 },
                ].map((preset) => {
                  const isSelected =
                    durationHours === preset.h &&
                    durationMinutes === preset.m &&
                    durationSeconds === preset.s;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setDurationHours(preset.h);
                        setDurationMinutes(preset.m);
                        setDurationSeconds(preset.s);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono font-medium transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-[#ff541e] to-[#e6420f] text-white shadow-md shadow-[#ff541e]/30 scale-105 font-bold"
                          : "bg-white/[0.03] border border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.07]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total Duration Summary Bar */}
            <div className="p-3 rounded-2xl bg-white/[0.025] border border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-[#f5c7a9]/70 font-mono">Total session duration:</span>
              <span className="font-mono font-bold text-white text-sm">
                {durationHours > 0 ? `${durationHours}h ` : ""}
                {durationMinutes}m {durationSeconds < 10 ? `0${durationSeconds}` : durationSeconds}s
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setSetupTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startFocusSessionFromSetup}
                disabled={durationHours === 0 && durationMinutes === 0 && durationSeconds === 0}
                className="btn-pill-kinetic flex items-center gap-2 py-2 px-5 text-xs font-heading uppercase tracking-wider text-white shadow-lg shadow-[#ff541e]/30 hover:scale-105 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Session →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WHOLE SCREEN POP-UP TIMER */}
      {/* ========================================================================= */}
      {isFullScreenTimerOpen && activeTask && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0d0e11]/98 backdrop-blur-3xl p-6 sm:p-12 overflow-y-auto animate-in fade-in select-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff541e]/[0.08] blur-[180px] rounded-full pointer-events-none" />

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#ff541e]/15 border border-[#ff541e]/35 text-xs font-mono font-bold text-[#ff541e]">
              <span className="w-2 h-2 rounded-full bg-[#ff541e] animate-ping" />
              <span>Focus Session Active</span>
            </div>

            <button
              onClick={() => setIsFullScreenTimerOpen(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-mono transition-all"
              title="Minimize timer"
            >
              <Minimize2 className="w-4 h-4 text-[#f5c7a9]" />
              <span className="hidden sm:inline">Minimize</span>
            </button>
          </div>

          {/* Center Content */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center max-w-xl mx-auto w-full text-center">
            
            {completionData ? (
              <div className="glass-obsidian rounded-3xl p-8 sm:p-10 border border-white/10 bg-[#121418] shadow-2xl space-y-6 w-full animate-in zoom-in-95">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ff541e]/20 border border-[#ff541e]/40 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#f5c7a9]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-italic-headline text-white tracking-tight">
                    FOCUS SESSION COMPLETE
                  </h3>
                  <p className="text-sm text-zinc-300 font-body">
                    You focused for <strong className="text-[#f5c7a9] font-mono">{completionData.focusedMinutes} minutes</strong> on:
                  </p>
                  <p className="text-lg font-bold text-[#ff541e] font-display">
                    &ldquo;{activeTask.title}&rdquo;
                  </p>
                </div>

                {completionData.showBlockedInput ? (
                  <div className="space-y-3 bg-black/60 p-4 rounded-2xl border border-white/10 text-left">
                    <label className="text-xs font-mono text-zinc-300 block">
                      What blocked your progress?
                    </label>
                    <input
                      type="text"
                      value={completionData.blockedNote}
                      onChange={(e) => setCompletionData((prev) => prev ? ({ ...prev, blockedNote: e.target.value }) : null)}
                      placeholder="e.g. Waiting on API key or feedback..."
                      className="w-full rounded-xl bg-[#16181c] px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 border border-white/10 focus:border-[#ff541e] focus:outline-none font-body"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          closeFullscreenSession();
                        }}
                        className="btn-pill-kinetic px-5 py-2 text-xs font-heading"
                      >
                        Save &amp; Close →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCompleteTask(activeTask.id)}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-[#ff541e]/20 to-[#ff541e]/10 border border-[#ff541e]/50 hover:bg-[#ff541e]/30 text-white text-xs font-heading tracking-wider uppercase transition-all hover:scale-105 shadow-lg shadow-[#ff541e]/20"
                    >
                      <Check className="w-5 h-5 text-[#f5c7a9]" />
                      <span>✓ Finished</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNeedMoreTime(activeTask.id)}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#16181c] border border-white/10 hover:bg-white/[0.08] text-zinc-200 text-xs font-heading tracking-wider uppercase transition-all hover:scale-105"
                    >
                      <Hourglass className="w-5 h-5 text-amber-400" />
                      <span>Need More Time</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCompletionData((prev) => prev ? ({ ...prev, showBlockedInput: true }) : null)}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-black/50 border border-white/10 hover:bg-white/[0.06] text-zinc-300 text-xs font-heading tracking-wider uppercase transition-all hover:scale-105"
                    >
                      <AlertCircle className="w-5 h-5 text-[#ff541e]" />
                      <span>Blocked</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-5xl font-italic-headline text-white tracking-tight">
                    {activeTask.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-mono text-[#f5c7a9]/70">
                    from note: &ldquo;{activeTask.sourceDumpTitle}&rdquo; • Due: {activeTask.dueDate}
                  </p>
                </div>

                <div className="relative py-4">
                  <div className="text-7xl sm:text-9xl md:text-[10rem] font-black font-display tracking-tight text-white drop-shadow-[0_0_50px_rgba(255,84,30,0.45)]">
                    {formatTimer(timerSecondsLeft)}
                  </div>

                  <div className="w-64 sm:w-80 h-2 bg-black/70 rounded-full mx-auto mt-6 overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-[#ff541e] via-[#f5c7a9] to-[#ff541e] transition-all duration-1000"
                      style={{ width: `${timerPercent}%` }}
                    />
                  </div>

                  <p className="text-xs font-mono text-[#f5c7a9]/70 mt-4 uppercase tracking-widest">
                    {isTimerPaused ? "Paused" : "Stay with this task until finished"}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {isTimerPaused ? (
                    <button
                      type="button"
                      onClick={resumeTimer}
                      className="btn-pill-kinetic flex items-center gap-2 px-7 py-3 text-xs font-heading tracking-wider uppercase shadow-xl hover:scale-105 transition-all"
                    >
                      <Play className="w-4 h-4 fill-current text-[#f5c7a9]" />
                      <span>Resume →</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseTimer}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#16181c] border border-white/10 hover:bg-white/[0.08] text-xs font-heading uppercase tracking-wider text-zinc-200 transition-all hover:scale-105"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => addExtraMinutes(5)}
                    className="px-5 py-3 rounded-full bg-black/60 border border-white/10 hover:border-[#ff541e]/40 text-xs font-mono font-bold text-[#f5c7a9] hover:text-white transition-all"
                  >
                    +5 Min
                  </button>

                  <button
                    type="button"
                    onClick={finishTimerEarly}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#ff541e]/15 border border-[#ff541e]/40 hover:bg-[#ff541e]/25 text-xs font-heading uppercase tracking-wider text-[#ff6a38] transition-all hover:scale-105"
                  >
                    <Check className="w-4 h-4" />
                    <span>Finish Early</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Philosophy Anchor */}
          <div className="relative z-10 text-center">
            <p className="text-xs font-mono text-[#f5c7a9]/60 uppercase tracking-wider">
              ✦ IT ALL BEGINS WITH A SINGLE THOUGHT ✦
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
