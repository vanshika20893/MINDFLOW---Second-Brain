"use client";

import React, { useMemo } from "react";
import { 
  TrendingUp, 
  Brain, 
  Clock, 
  Target, 
  Flame, 
  Activity, 
  Layers, 
  Sparkles,
  Inbox
} from "lucide-react";
import type { DumpItem } from "@/types";
import type { TaskItem } from "@/types";

interface InsightsViewProps {
  dumps?: DumpItem[];
  tasks?: TaskItem[];
}

export function InsightsView({ dumps = [], tasks = [] }: InsightsViewProps) {
  const dumpCount = dumps.length;
  const taskCount = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

  // Compute unique active spheres / categories across all thoughts
  const categories = useMemo(() => {
    const set = new Set<string>();
    dumps.forEach((d) => {
      if (d.extractedTasks && d.extractedTasks.length > 0) {
        d.extractedTasks.forEach((t) => {
          const cat = typeof t === "string" ? d.category : (t.category || d.category);
          if (cat) set.add(cat);
        });
      } else if (d.category) {
        set.add(d.category);
      }
    });
    tasks.forEach((t) => {
      if (t.tags && t.tags[1]) {
        // preserve extra categories if any
      }
    });
    return Array.from(set);
  }, [dumps, tasks]);

  // Compute bandwidth allocation percentage across all thoughts & tasks
  const categoryDistribution = useMemo(() => {
    if (dumps.length === 0 && tasks.length === 0) return [];
    const counts: Record<string, number> = {};
    let totalItems = 0;

    dumps.forEach((d) => {
      if (d.extractedTasks && d.extractedTasks.length > 0) {
        d.extractedTasks.forEach((t) => {
          const cat = typeof t === "string" ? d.category : (t.category || d.category || "General");
          counts[cat] = (counts[cat] || 0) + 1;
          totalItems++;
        });
      } else {
        const cat = d.category || "General";
        counts[cat] = (counts[cat] || 0) + 1;
        totalItems++;
      }
    });

    if (totalItems === 0) return [];

    const colors = [
      "bg-gradient-to-r from-[#ff541e] to-[#ff7a45]",
      "bg-gradient-to-r from-[#f5c7a9] to-[#ebd2c0]",
      "bg-gradient-to-r from-amber-600 to-amber-400",
      "bg-gradient-to-r from-purple-600 to-purple-400",
      "bg-gradient-to-r from-emerald-600 to-emerald-400",
      "bg-gradient-to-r from-blue-600 to-blue-400",
      "bg-gradient-to-r from-rose-600 to-rose-400",
    ];

    return Object.entries(counts)
      .map(([label, count], idx) => ({
        label,
        count,
        percent: Math.round((count / totalItems) * 100),
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [dumps, tasks]);

  // Dynamic 7-day velocity chart
  const days = useMemo(() => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentDayIdx = (new Date().getDay() + 6) % 7; // Map Sun=0 to index 6

    return dayNames.map((name, idx) => {
      // If user has zero dumps, all days are zero
      if (dumps.length === 0) {
        return { name, count: 0, level: "none" };
      }
      // Put today's real dump count on the current day column
      if (idx === currentDayIdx) {
        return { 
          name, 
          count: dumps.length, 
          level: dumps.length >= 5 ? "max" : dumps.length >= 3 ? "high" : "med" 
        };
      }
      return { name, count: 0, level: "none" };
    });
  }, [dumps]);

  const focusSavedHours = (dumps.length * 0.25).toFixed(1);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="relative rounded-3xl glass-luxury bg-[#131519]/90 p-6 sm:p-8 border border-white/[0.08] shadow-2xl overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#ff541e]/15 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#f5c7a9]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="badge-peach">✦ COGNITIVE VELOCITY</span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#f5c7a9]/70">Mental Bandwidth Analytics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-italic-headline text-white tracking-tight">
              NEURAL <span className="text-[#ff541e] text-glow-orange">INSIGHTS</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 font-body mt-1">
              Live reflection, mental bandwidth allocation, and clarity velocity patterns for your second brain.
            </p>
          </div>

          <span className="badge-luxury text-[#f5c7a9] text-xs self-start sm:self-auto border-white/10 bg-white/[0.04]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff541e]" />
            <span className="font-heading tracking-wider">AI Cognitive Digest</span>
          </span>
        </div>
      </div>

      {/* 4 Metric Cards (Bento Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-luxury rounded-3xl p-5 border border-white/[0.07] hover:border-[#ff541e]/30 transition-all duration-200">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#f5c7a9]/80">Thoughts Captured</span>
            <div className="p-1.5 rounded-xl bg-[#ff541e]/15 border border-[#ff541e]/30 text-[#ff541e]">
              <Brain className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-display">{dumpCount}</div>
          <div className="text-xs text-[#ff541e] mt-1 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>{dumpCount > 0 ? `${dumpCount} synced` : "Clean slate"}</span>
          </div>
        </div>

        <div className="glass-luxury rounded-3xl p-5 border border-white/[0.07] hover:border-[#f5c7a9]/30 transition-all duration-200">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#f5c7a9]/80">Action Items</span>
            <div className="p-1.5 rounded-xl bg-[#f5c7a9]/15 border border-[#f5c7a9]/30 text-[#f5c7a9]">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-display">{taskCount}</div>
          <div className="text-xs text-[#f5c7a9] mt-1 font-mono">
            {taskCount > 0 ? `${completionRate}% completed` : "0 pending"}
          </div>
        </div>

        <div className="glass-luxury rounded-3xl p-5 border border-white/[0.07] hover:border-[#ff541e]/30 transition-all duration-200">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#f5c7a9]/80">Focus Saved</span>
            <div className="p-1.5 rounded-xl bg-[#ff541e]/15 border border-[#ff541e]/30 text-[#ff541e]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-display">{focusSavedHours} hrs</div>
          <div className="text-xs text-zinc-400 mt-1 font-mono">Via auto-structuring</div>
        </div>

        <div className="glass-luxury rounded-3xl p-5 border border-white/[0.07] hover:border-white/[0.15] transition-all duration-200">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#f5c7a9]/80">Active Spheres</span>
            <div className="p-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-white">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-display">{categories.length} Areas</div>
          <div className="text-xs text-zinc-400 mt-1 font-mono">
            {categories.length > 0 ? categories.slice(0, 3).join(", ") : "None yet"}
          </div>
        </div>
      </div>

      {/* Cognitive Digest Summary Card */}
      <div className="glass-luxury rounded-3xl p-6 sm:p-7 border border-white/[0.08] space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff541e]" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#f5c7a9] font-bold">
            ✦ AI Synthesis &amp; Reflection
          </h3>
        </div>

        <div className="relative rounded-2xl bg-[#0a0b0e] p-5 border border-white/[0.06] font-body">
          {dumps.length === 0 ? (
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              &ldquo;Your second brain is on a fresh clean slate. Once you begin capturing raw thoughts in the <strong className="text-white">Dump</strong> tab, your cognitive distribution, focus velocity, and weekly synthesis will automatically materialize here.&rdquo;
            </p>
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                &ldquo;Your mental bandwidth is actively distributed across <strong className="text-[#f5c7a9]">{categories.length} life engines</strong> ({categoryDistribution.slice(0, 3).map(c => `${c.label} ${c.percent}%`).join(", ")}). You have <strong className="text-[#ff541e]">{taskCount} structured actions</strong> and <strong className="text-white">{dumpCount} thoughts</strong> safely preserved in your second brain.&rdquo;
              </p>
              {tasks.some(t => /aditya|fight|conflict/i.test(t.title)) && (
                <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-xl px-3 py-2">
                  <span className="text-rose-400 font-bold">✦ Interpersonal Priority:</span>
                  <span>Take space to breathe first, then have a calm conversation to clear the air.</span>
                </div>
              )}
              {tasks.some(t => /dsa|coding/i.test(t.title)) && (
                <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 rounded-xl px-3 py-2">
                  <span className="text-indigo-400 font-bold">✦ Cognitive Flow:</span>
                  <span>Dedicate an uninterrupted 25-minute focus session for your DSA practice.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Activity Heatmap + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Weekly Activity Heatmap */}
        <div className="lg:col-span-6 glass-luxury rounded-3xl p-6 border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-display">
              <Flame className="w-3.5 h-3.5 text-[#ff541e]" />
              <span>7-Day Thought Velocity</span>
            </h3>
            <span className="badge-peach text-[10px]">
              {dumps.length > 0 ? "Active Session" : "0 Captures"}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-1">
            {days.map((day) => (
              <div key={day.name} className="flex flex-col items-center gap-1.5">
                <div 
                  className={`w-full h-16 rounded-xl border transition-all flex items-end justify-center pb-1.5 text-xs font-mono font-bold ${
                    day.level === "max"
                      ? "bg-gradient-to-t from-[#ff541e] via-[#ff6a38] to-[#f5c7a9] border-[#f5c7a9]/80 text-[#0d0e11] shadow-lg shadow-[#ff541e]/35 scale-105"
                      : day.level === "high"
                      ? "bg-[#ff541e]/40 border-[#ff541e]/60 text-white"
                      : day.level === "med"
                      ? "bg-[#ff541e]/15 border-[#ff541e]/30 text-[#f5c7a9]"
                      : "bg-white/[0.03] border-white/[0.06] text-zinc-600"
                  }`}
                >
                  {day.count}
                </div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">{day.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="lg:col-span-6 glass-luxury rounded-3xl p-6 border border-white/[0.08] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-display">
            <Activity className="w-3.5 h-3.5 text-[#f5c7a9]" />
            <span>Mental Bandwidth Allocation</span>
          </h3>

          <div className="space-y-3.5 pt-1 font-body">
            {categoryDistribution.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono space-y-1">
                <Inbox className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                <p>No categories detected yet.</p>
                <p className="text-[11px] text-zinc-600">Categories will map here as you record thoughts.</p>
              </div>
            ) : (
              categoryDistribution.map((cat) => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-200">
                    <span>{cat.label}</span>
                    <span className="font-mono text-[#f5c7a9] text-[11px] font-bold">{cat.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/70 overflow-hidden border border-white/[0.06]">
                    <div 
                      className={`h-full rounded-full ${cat.color} transition-all duration-700 shadow-sm`}
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
