"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  Sparkles, 
  Network, 
  BarChart3, 
  ChevronDown, 
  Cpu, 
  LogOut, 
  Database,
  Compass
} from "lucide-react";
import type { NavPage } from "@/types";

interface NavbarProps {
  activePage: NavPage;
  setActivePage: (page: NavPage) => void;
  dumpCount: number;
  taskCount: number;
  user?: { id: string; name: string; email: string } | null;
  onLogout?: () => void;
}

export function Navbar({
  activePage,
  setActivePage,
  dumpCount,
  taskCount,
  user,
  onLogout,
}: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: "dump" as NavPage, label: "Dump", icon: Compass, badge: dumpCount },
    { id: "plan" as NavPage, label: "Plan", icon: Sparkles, badge: taskCount },
    { id: "connections" as NavPage, label: "Connections", icon: Network, badge: null },
    { id: "insights" as NavPage, label: "Insights", icon: BarChart3, badge: null },
  ];

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0d0e11]/90 backdrop-blur-2xl transition-all">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Enhanced Brand Logo Button */}
        <button
          type="button"
          onClick={() => setActivePage("dump")}
          className="flex items-center gap-3.5 group text-left px-2.5 py-1.5 -ml-2.5 rounded-2xl transition-all duration-300 hover:bg-white/[0.04] active:scale-[0.98] border border-transparent hover:border-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f26419]/60 cursor-pointer select-none"
          aria-label="MindFlow Home Canvas"
          title="MindFlow // Return to Canvas"
        >
          {/* Emblem with Multi-Layer Glow & Micro-interactions */}
          <div className="relative flex-shrink-0">
            {/* Ambient Radial Back-Glow */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#f26419] via-[#ff7528] to-[#f5c7a9] opacity-40 blur-md group-hover:opacity-90 group-hover:blur-lg transition-all duration-500" />

            {/* Gradient Bezel Ring */}
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-b from-white/[0.22] via-white/[0.08] to-[#f26419]/30 p-[1px] shadow-xl shadow-black/60 transition-all duration-300">
              {/* Obsidian Core Well */}
              <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-gradient-to-b from-[#181a20] via-[#101216] to-[#0a0b0e] p-1.5 overflow-hidden relative">
                {/* Subtle Inner Reflection Sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <Image
                  src="/emblem.png"
                  alt="MindFlow Logo"
                  width={44}
                  height={44}
                  className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(242,100,25,0.4)] group-hover:scale-110 group-hover:rotate-[4deg] transition-transform duration-500"
                  priority
                />
              </div>
            </div>

            {/* Live Synapse Pulse Dot */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5c7a9] opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full border border-black/50 bg-gradient-to-tr from-[#f26419] to-[#ff7528] shadow-sm shadow-[#f26419]"></span>
            </span>
          </div>

          {/* Typography & System Label */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight font-display leading-none">
                <span className="text-white drop-shadow-sm">MIND</span>
                <span className="bg-gradient-to-r from-[#f26419] via-[#ff7528] to-[#f5c7a9] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(242,100,25,0.4)]">
                  FLOW
                </span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase text-[#f5c7a9] bg-[#f26419]/15 border border-[#f26419]/30 group-hover:border-[#f26419]/60 transition-colors shadow-sm">
                OS 2.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f26419] animate-pulse" />
              <span className="text-[10px] font-mono tracking-[0.18em] text-[#f5c7a9]/75 uppercase font-medium">
                AI Synapse Grid
              </span>
            </div>
          </div>
        </button>

        {/* Center: Core 4 Navigation Pages (Floating Glass Dock) */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-[#16181c]/90 p-1 border border-white/[0.08] shadow-2xl shadow-black/80 backdrop-blur-xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`relative flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#f26419] to-[#d8520e] text-white shadow-md shadow-[#f26419]/35 font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-zinc-400"}`} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold leading-none ${
                      isActive 
                        ? "bg-black/40 text-[#f5c7a9]" 
                        : "bg-white/[0.08] text-zinc-300 border border-white/[0.08]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: User Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] p-1.5 pr-2.5 border border-white/[0.08] hover:border-white/[0.16] transition-all group shadow-sm"
            >
              {/* Glowing Avatar */}
              <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-[#f26419] to-[#c0480a] flex items-center justify-center text-white font-bold text-[11px] shadow-sm shadow-[#f26419]/30">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "MF"}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-3xl glass-luxury border border-white/[0.1] p-3 shadow-2xl shadow-black animate-in fade-in slide-in-from-top-2 z-50">
                
                {/* User Info Header */}
                <div className="p-3 border-b border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{user?.name || "MindFlow Explorer"}</span>
                    <span className="text-[9px] font-mono font-bold text-[#f5c7a9] bg-[#f26419]/20 border border-[#f26419]/30 px-2 py-0.5 rounded-full">
                      MindFlow Pro
                    </span>
                  </div>
                  <p className="text-[11px] text-[#f5c7a9]/70 font-mono mt-0.5">{user?.email || "user@mindflow.ai"}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2 space-y-1">
                  {/* AI Status */}
                  <div className="flex items-center justify-between px-3 py-2 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-[#f26419]" />
                      <span>AI Model</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#f5c7a9]">Gemini 3.6 Flash</span>
                  </div>

                  {/* Storage Status */}
                  <div className="flex items-center justify-between px-3 py-2 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-[#f5c7a9]" />
                      <span>Thoughts Stored</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-300">{dumpCount} dumps</span>
                  </div>
                </div>

                {/* Log Out Divider */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (onLogout) {
                        onLogout();
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-[#f26419] hover:bg-[#f26419]/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dock (Pill bar on smaller screens) */}
      <div className="md:hidden flex items-center justify-around py-2 px-2 border-t border-white/[0.06] bg-[#0d0e11]/95 backdrop-blur-xl">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-[#f26419] font-bold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] tracking-wider uppercase">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
