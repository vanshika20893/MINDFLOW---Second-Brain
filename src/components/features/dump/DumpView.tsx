"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Brain, 
  Trash2, 
  CornerDownLeft, 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  Loader2 
} from "lucide-react";
import type { DumpItem, NavPage } from "@/types";
import { detectThoughtMetadata, extractTasksWithAI } from "@/lib/ai-detector";

interface DumpViewProps {
  dumps: DumpItem[];
  onSubmitDump: (dump: { rawText: string; isAudio: boolean; metadata?: any }) => void;
  onDeleteDump: (id: string) => void;
  onNavigate?: (page: NavPage) => void;
  saveStatus?: "idle" | "saving" | "saved" | "error";
}

export function DumpView({
  dumps,
  onSubmitDump,
  onDeleteDump,
  onNavigate,
  saveStatus = "idle",
}: DumpViewProps) {
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Payment-App Style "Whoosh" Success State Machine: "IDLE" -> "ACTIVE" -> "EXITING" -> "IDLE"
  const [whooshState, setWhooshState] = useState<"IDLE" | "ACTIVE" | "EXITING">("IDLE");
  const [whooshCount, setWhooshCount] = useState(0);
  const [highlightLatest, setHighlightLatest] = useState(false);
  const whooshTimerRef = useRef<{ exitTimeout?: NodeJS.Timeout; idleTimeout?: NodeJS.Timeout; highlightTimeout?: NodeJS.Timeout }>({});

  useEffect(() => {
    return () => {
      if (whooshTimerRef.current.exitTimeout) clearTimeout(whooshTimerRef.current.exitTimeout);
      if (whooshTimerRef.current.idleTimeout) clearTimeout(whooshTimerRef.current.idleTimeout);
      if (whooshTimerRef.current.highlightTimeout) clearTimeout(whooshTimerRef.current.highlightTimeout);
    };
  }, []);

  const triggerWhoosh = (taskCount: number) => {
    if (whooshTimerRef.current.exitTimeout) clearTimeout(whooshTimerRef.current.exitTimeout);
    if (whooshTimerRef.current.idleTimeout) clearTimeout(whooshTimerRef.current.idleTimeout);
    if (whooshTimerRef.current.highlightTimeout) clearTimeout(whooshTimerRef.current.highlightTimeout);

    setWhooshCount(taskCount);
    setWhooshState("ACTIVE");
    setHighlightLatest(true);

    // Keep highlight on the newly added dump card for 4s
    whooshTimerRef.current.highlightTimeout = setTimeout(() => {
      setHighlightLatest(false);
    }, 4000);

    // Phase 2: Start soft exit dissolve after 2000ms
    whooshTimerRef.current.exitTimeout = setTimeout(() => {
      setWhooshState("EXITING");
    }, 2000);

    // Phase 3: Seamlessly reset to clean idle input at 2420ms (420ms after exit begins)
    whooshTimerRef.current.idleTimeout = setTimeout(() => {
      setWhooshState("IDLE");
    }, 2420);
  };

  const dismissWhoosh = () => {
    if (whooshTimerRef.current.exitTimeout) clearTimeout(whooshTimerRef.current.exitTimeout);
    if (whooshTimerRef.current.idleTimeout) clearTimeout(whooshTimerRef.current.idleTimeout);

    setWhooshState("EXITING");
    whooshTimerRef.current.idleTimeout = setTimeout(() => {
      setWhooshState("IDLE");
    }, 320);
  };

  // Quick submission triggering the payment-app whoosh with AI extraction
  const handleQuickSubmit = async () => {
    if (!text.trim() || whooshState !== "IDLE" || isExtracting) return;
    const rawText = text.trim();
    setIsExtracting(true);

    try {
      const detected = await extractTasksWithAI(rawText);
      setText("");
      setIsExtracting(false);

      // Save thought into global state with AI extracted metadata
      onSubmitDump({
        rawText,
        isAudio: false,
        metadata: detected,
      });

      triggerWhoosh(detected.extractedTasks.length);
    } catch (err) {
      setIsExtracting(false);
      const fallback = detectThoughtMetadata(rawText);
      setText("");
      onSubmitDump({
        rawText,
        isAudio: false,
        metadata: fallback,
      });
      triggerWhoosh(fallback.extractedTasks.length);
    }
  };

  const copyToClipboard = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract unique categories for filter pills
  const categories = ["ALL", ...Array.from(new Set(dumps.map((d) => d.category)))];

  const filteredDumps = dumps.filter((d) => {
    const matchesSearch = d.rawText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Calm Capture Card with Payment-App Style Whoosh */}
      <div className={`relative rounded-3xl glass-obsidian bg-[#131519]/90 p-6 sm:p-8 border shadow-2xl overflow-hidden transition-all duration-500 ease-out ${
        whooshState === "ACTIVE" 
          ? "border-[#ff541e]/80 shadow-[0_0_80px_rgba(255,84,30,0.35)] scale-[1.008]"
          : whooshState === "EXITING"
          ? "border-[#ff541e]/40 shadow-[0_0_40px_rgba(255,84,30,0.15)] scale-[1]"
          : "border-white/[0.08]"
      }`}>
        {/* Ambient Glow Aura */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#ff541e]/15 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#f5c7a9]/10 blur-[120px] rounded-full pointer-events-none" />

        {whooshState !== "IDLE" ? (
          /* ========================================================
             PAYMENT-APP STYLE "WHOOSH" SUCCESS EXPERIENCE
             ======================================================== */
          <div className={`relative py-8 px-4 flex flex-col items-center justify-center text-center ${
            whooshState === "EXITING"
              ? "animate-whoosh-exit pointer-events-none"
              : "animate-in fade-in zoom-in-95 duration-300"
          }`}>
            {/* Ambient Radial Flash */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#ff541e]/15 via-transparent to-transparent rounded-3xl pointer-events-none" />

            {/* Ripple Shockwaves & Drawing Checkmark */}
            <div className="relative mb-5 flex items-center justify-center">
              {/* Expanding Concentric Rings */}
              <div className="absolute w-24 h-24 rounded-full border-2 border-[#ff541e]/50 animate-whoosh-ripple-1 pointer-events-none" />
              <div className="absolute w-24 h-24 rounded-full border border-[#f5c7a9]/40 animate-whoosh-ripple-2 pointer-events-none" />
              
              {/* Sparkles / Confetti Stars */}
              <Sparkles className="w-5 h-5 text-[#f5c7a9] absolute -top-4 -right-6 animate-whoosh-sparkle" />
              <Sparkles className="w-4 h-4 text-[#ff541e] absolute -bottom-3 -left-6 animate-whoosh-sparkle" style={{ animationDelay: "0.2s" }} />
              <Sparkles className="w-4 h-4 text-white absolute top-0 -left-8 animate-whoosh-sparkle" style={{ animationDelay: "0.4s" }} />

              {/* The Iconic Central Circular Checkmark Badge */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#ff541e] via-[#e6420f] to-[#ff7a45] flex items-center justify-center shadow-[0_0_50px_rgba(255,84,30,0.65)] animate-whoosh-scale">
                <svg
                  className="w-12 h-12 text-white"
                  viewBox="0 0 52 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="26"
                    cy="26"
                    r="23"
                    stroke="rgba(245,199,169,0.5)"
                    strokeWidth="3"
                    className="animate-whoosh-circle"
                  />
                  <path
                    d="M15 27L23 35L37 19"
                    stroke="currentColor"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-whoosh-check"
                  />
                </svg>
              </div>
            </div>

            {/* Crisp, Calming Triumphant Typography */}
            <div className="space-y-1 z-10 max-w-md">
              <h2 className="text-3xl sm:text-4xl font-italic-headline text-white tracking-tight">
                ALL SORTED.
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 font-medium font-body">
                Your head is empty. Everything has been safely organized into your second brain.
              </p>
              {whooshCount > 0 && (
                <p className="text-xs text-[#f5c7a9] font-mono pt-1">
                  ✨ {whooshCount} {whooshCount === 1 ? "item" : "items"} extracted &amp; scheduled into your plan
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 pt-5 z-10">
              {onNavigate && (
                <button
                  onClick={() => onNavigate("plan")}
                  className="btn-pill-kinetic flex items-center gap-2 text-xs"
                >
                  <span>View in Plan</span>
                  <CornerDownLeft className="w-3.5 h-3.5 text-[#f5c7a9]" />
                </button>
              )}
              <button
                onClick={dismissWhoosh}
                className="rounded-full px-5 py-2.5 text-xs font-semibold text-[#f5c7a9] hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] transition-all shadow-sm font-heading tracking-wider uppercase"
              >
                + Dump Another
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             STANDARD CAPTURE INPUT (IDLE) - LUXURY COMMAND CARD
             ======================================================== */
          <div className="animate-in fade-in duration-300">
            {/* Editorial Badge & Headline */}
            <div className="relative z-10 mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="badge-peach">✦ SYNAPSE ENGINE</span>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#f5c7a9]/70">Zero Friction</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-italic-headline text-white tracking-tight">
                  CAPTURE YOUR <span className="text-[#ff541e] text-glow-orange">THOUGHTS</span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 font-body mt-1 max-w-xl">
                  A single thought, or everything all at once — write freely, our AI will extract actionable clarity.
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {saveStatus === "saving" && (
                  <span className="badge-luxury text-amber-300 text-[11px] border-amber-500/30 bg-amber-500/10 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="font-heading tracking-wider">Saving to DB...</span>
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="badge-luxury text-emerald-300 text-[11px] border-emerald-500/30 bg-emerald-500/10">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="font-heading tracking-wider">Saved ✓</span>
                  </span>
                )}
                {saveStatus === "error" && (
                  <span className="badge-luxury text-rose-300 text-[11px] border-rose-500/30 bg-rose-500/10">
                    <span className="font-heading tracking-wider">Saved locally</span>
                  </span>
                )}
              </div>
            </div>

            {/* Input Box */}
            <div className="relative z-10 space-y-3">
              <div className="relative group">
                <textarea
                  id="main-capture-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      handleQuickSubmit();
                    }
                  }}
                  disabled={isExtracting}
                  placeholder={isExtracting ? "AI is extracting actionable tasks..." : "A single thought, or everything all at once... (Press ⌘ + Enter to save)"}
                  rows={3}
                  className="w-full min-h-[110px] resize-y rounded-2xl bg-[#0a0b0e] p-4 text-sm sm:text-base text-zinc-100 placeholder-zinc-500 border border-white/[0.08] focus:border-[#ff541e]/70 focus:outline-none focus:ring-2 focus:ring-[#ff541e]/20 transition-all leading-relaxed shadow-inner font-body disabled:opacity-60"
                />

              </div>

              {/* Live Intelligence Micro-Bar */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-mono">
                <div>
                  {text.trim().length > 0 ? (
                    <span className="text-[#f5c7a9]/80">
                      {text.trim().split(/\s+/).length} words • {text.trim().length} chars
                    </span>
                  ) : (
                    <span className="text-zinc-400">
                      Tip: Dump your daily plan, messy worries, ideas, or to-dos.
                    </span>
                  )}
                </div>

                {text.trim().length > 12 && (
                  <div className="flex items-center gap-1 text-[#ff541e] animate-in fade-in font-heading tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-structuring ready</span>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={handleQuickSubmit}
                  disabled={!text.trim() || isExtracting}
                  className="btn-pill-kinetic flex items-center gap-2 py-2 px-5 text-xs font-heading tracking-wider uppercase disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md group"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f5c7a9]" />
                      <span>Extracting with AI...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Thought →</span>
                      <span className="kbd-cap bg-black/40 border-[#f5c7a9]/30 text-[#f5c7a9] text-[9px] py-0.5 px-1.5">⌘↵</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-heading uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-[#ff541e] to-[#e6420f] text-white shadow-md shadow-[#ff541e]/30 scale-105"
                  : "bg-[#16181c] hover:bg-white/[0.07] text-zinc-300 hover:text-white border border-white/[0.08]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search thoughts..."
            className="w-full rounded-full bg-[#16181c] pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 border border-white/[0.08] focus:border-[#ff541e]/60 focus:outline-none focus:ring-1 focus:ring-[#ff541e]/20 transition-all shadow-inner font-body"
          />
        </div>
      </div>

      {/* Dumps Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
          <span className="flex items-center gap-2 font-heading tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#ff541e]" />
            <span className="uppercase tracking-widest font-bold text-[#f5c7a9]">Archived Synapse Stream</span>
          </span>
          <span className="badge-peach text-[10px]">{filteredDumps.length} records</span>
        </div>

        <div className="grid gap-3.5">
          {filteredDumps.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#121418]/60 p-8 sm:p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#ff541e]">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
                A Clean Slate Awaits
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-body max-w-md mx-auto">
                No thoughts recorded yet. Type your first thought, meeting note, or wild idea in the box above to see AI extract actionable clarity!
              </p>
            </div>
          ) : (
            filteredDumps.map((dump, idx) => {
              const isLatest = idx === 0 && highlightLatest;
            return (
            <div
              key={dump.id}
              className={`glass-luxury rounded-3xl p-5 sm:p-6 relative transition-all duration-300 group border ${
                isLatest
                  ? "animate-new-card border-[#ff541e]/80 shadow-[0_0_40px_rgba(255,84,30,0.25)]"
                  : "border-white/[0.07] hover:border-[#ff541e]/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Metadata Chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Category */}
                    <span className="badge-luxury text-xs font-semibold text-[#f5c7a9] border-white/10 bg-white/[0.04]">
                      {dump.category}
                    </span>

                    <span className="text-xs text-zinc-500 font-mono ml-auto sm:ml-0">
                      {dump.createdAt}
                    </span>
                  </div>

                  {/* Main Raw Thought Text */}
                  <p className="text-sm sm:text-base text-zinc-100 leading-relaxed font-body font-normal selection:bg-[#ff541e]/30">
                    {dump.rawText}
                  </p>

                  {/* Systematically Extracted Items */}
                  {dump.extractedTasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#f5c7a9]/70 font-bold block">
                        ✦ Auto-Structured Breakdown:
                      </span>
                      <div className="grid gap-2">
                        {dump.extractedTasks.map((rawItem, idx) => {
                          const item = typeof rawItem === "string"
                            ? { text: rawItem, type: "TODO" as const, category: dump.category, timeframe: undefined }
                            : rawItem;

                          const isRoutine = item.type === "ROUTINE";
                          const isProject = item.type === "PROJECT";
                          const isIdea = item.type === "IDEA";

                          return (
                            <div
                              key={idx}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-white/[0.025] hover:bg-white/[0.04] rounded-2xl px-3.5 py-2.5 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                {/* Type Badge */}
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                                  isRoutine
                                    ? "bg-indigo-950/80 text-indigo-300 border border-indigo-700/50"
                                    : isProject
                                    ? "bg-purple-950/80 text-purple-300 border border-purple-700/50"
                                    : isIdea
                                    ? "bg-amber-950/80 text-amber-300 border border-amber-700/50"
                                    : "bg-[#ff541e]/15 text-[#ff6a38] border border-[#ff541e]/30"
                                }`}>
                                  {isRoutine ? "🔁 Routine" : isProject ? "🚀 Project" : isIdea ? "💡 Idea" : "⚡ To-Do"}
                                </span>

                                {/* Title */}
                                <span className="text-zinc-200 font-medium font-body">{item.text}</span>
                              </div>

                              {/* Category & Timeframe Tag */}
                              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 pl-6 sm:pl-0 shrink-0">
                                {item.category && (
                                  <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-400">
                                    {item.category}
                                  </span>
                                )}
                                {item.timeframe && (
                                  <span className="text-[#ff541e] font-semibold">
                                    {item.timeframe}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions (Copy / Delete) */}
                <div className="flex sm:flex-col items-center gap-1 shrink-0 self-end sm:self-start opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyToClipboard(dump.id, dump.rawText)}
                    title="Copy Thought"
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  >
                    {copiedId === dump.id ? (
                      <Check className="w-4 h-4 text-[#f5c7a9]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteDump(dump.id)}
                    title="Delete Thought"
                    className="p-2 rounded-xl text-zinc-500 hover:text-[#ff541e] hover:bg-[#ff541e]/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
}
