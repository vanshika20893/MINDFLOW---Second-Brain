"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  KeyRound, 
  UserPlus, 
  LogIn, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { loginUser, registerUser, type AuthUser } from "@/lib/api";

interface LoginViewProps {
  onLogin: (user: AuthUser) => void;
}

type AuthMode = "LOGIN" | "SIGNUP";

export function LoginView({ onLogin }: LoginViewProps) {
  // Start on Create ID so user can establish their own brand-new clean slate ID
  const [mode, setMode] = useState<AuthMode>("SIGNUP");
  
  // Login fields (clean slate, no pre-filled test data)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign up / Create ID fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [suggestSwitch, setSuggestSwitch] = useState<AuthMode | null>(null);

  // Password Rules Validation Logic
  const hasMinLength = signupPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(signupPassword);
  const hasNumber = /[0-9]/.test(signupPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(signupPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecial;
  const passwordsMatch = signupPassword === signupConfirmPassword && signupPassword.length > 0;

  // 1. Handle Log In for existing users
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!loginPassword) {
      setErrorMsg("Please enter your password.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuggestSwitch(null);

    try {
      const user = await loginUser({
        email: loginEmail.trim(),
        password: loginPassword
      });
      onLogin(user);
    } catch (err: any) {
      const msg = err.message || "Failed to log in.";
      setErrorMsg(msg);
      if (msg.toLowerCase().includes("no account found") || msg.toLowerCase().includes("create an id") || msg.toLowerCase().includes("create an account")) {
        setSuggestSwitch("SIGNUP");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Sign Up / Create new ID
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!signupEmail.trim()) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg("Please ensure your password satisfies all security criteria below.");
      return;
    }
    if (!passwordsMatch) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuggestSwitch(null);

    try {
      const user = await registerUser({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword
      });
      onLogin(user);
    } catch (err: any) {
      const msg = err.message || "Failed to create ID.";
      setErrorMsg(msg);
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("log in instead")) {
        setSuggestSwitch("LOGIN");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0d0e11] cyber-grid flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* Dynamic Ambient Background Lighting */}
      <div className="fixed top-[-20%] left-[20%] w-[600px] h-[500px] bg-[#f26419]/[0.12] blur-[180px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-15%] right-[15%] w-[550px] h-[450px] bg-[#f5c7a9]/[0.08] blur-[170px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6 z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-3.5">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-[#f26419] via-[#ff7528] to-[#f5c7a9] opacity-40 blur-md" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-white/[0.22] via-white/[0.08] to-[#f26419]/30 p-[1px] shadow-xl shadow-black/60">
                <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-gradient-to-b from-[#181a20] via-[#101216] to-[#0a0b0e] p-2 overflow-hidden">
                  <Image
                    src="/emblem.png"
                    alt="MindFlow Emblem"
                    width={56}
                    height={56}
                    className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(242,100,25,0.4)]"
                    priority
                  />
                </div>
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white block leading-none">
                  MIND<span className="bg-gradient-to-r from-[#f26419] via-[#ff7528] to-[#f5c7a9] bg-clip-text text-transparent">FLOW</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase text-[#f5c7a9] bg-[#f26419]/15 border border-[#f26419]/30">
                  OS 2.0
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f26419] animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-[#f5c7a9]/70 uppercase">
                  AI Synapse Canvas
                </span>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-italic-headline text-white tracking-tight uppercase">
              {mode === "LOGIN" ? (
                <>ACCESS YOUR <span className="text-[#f26419] text-glow-orange">MINDFLOW WORKSPACE</span></>
              ) : (
                <>CREATE YOUR <span className="text-[#f26419] text-glow-orange">MINDFLOW ID</span></>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-body max-w-sm mx-auto mt-1">
              {mode === "LOGIN"
                ? "Enter your registered email and password to open your second brain."
                : "Fill in your details below to establish your new account on a fresh clean slate."}
            </p>
          </div>
        </div>

        {/* Mode Selector Pill (Log In vs. Create ID) */}
        <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setMode("SIGNUP");
              setErrorMsg(null);
              setSuggestSwitch(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === "SIGNUP"
                ? "bg-gradient-to-r from-[#f26419] to-[#d8520e] text-white shadow-md shadow-[#f26419]/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New ID</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("LOGIN");
              setErrorMsg(null);
              setSuggestSwitch(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === "LOGIN"
                ? "bg-gradient-to-r from-[#f26419] to-[#d8520e] text-white shadow-md shadow-[#f26419]/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl glass-luxury border border-white/[0.1] p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-5">
          
          {/* Error Message */}
          {errorMsg && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300 font-medium animate-in fade-in space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              {suggestSwitch === "SIGNUP" && (
                <button
                  type="button"
                  onClick={() => {
                    setSignupEmail(loginEmail);
                    setMode("SIGNUP");
                    setErrorMsg(null);
                  }}
                  className="mt-1 text-[11px] font-mono text-[#f5c7a9] underline hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Switch to Create ID with this email &rarr;</span>
                </button>
              )}
              {suggestSwitch === "LOGIN" && (
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail(signupEmail);
                    setMode("LOGIN");
                    setErrorMsg(null);
                  }}
                  className="mt-1 text-[11px] font-mono text-[#f5c7a9] underline hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Switch to Log In with this email &rarr;</span>
                </button>
              )}
            </div>
          )}

          {/* ========================================================
              FORM 1: CREATE NEW ID / SIGN UP (With Password Rules)
              ======================================================== */}
          {mode === "SIGNUP" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4 animate-in fade-in duration-200">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#f5c7a9]" />
                  <span>Your Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl bg-[#0a0b0e] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 border border-white/[0.08] focus:border-[#f26419]/70 focus:outline-none focus:ring-2 focus:ring-[#f26419]/20 transition-all font-body"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#f26419]" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl bg-[#0a0b0e] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 border border-white/[0.08] focus:border-[#f26419]/70 focus:outline-none focus:ring-2 focus:ring-[#f26419]/20 transition-all font-body"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#f5c7a9]" />
                    <span>Create Password</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Enter a secure password"
                  className="w-full rounded-xl bg-[#0a0b0e] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 border border-white/[0.08] focus:border-[#f26419]/70 focus:outline-none focus:ring-2 focus:ring-[#f26419]/20 transition-all font-body"
                />
              </div>

              {/* Live Password Rules Checklist */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-3 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                  Password Requirements:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400" : "text-zinc-500"}`}>
                    {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1 mr-1" />}
                    <span>8+ Characters</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-400" : "text-zinc-500"}`}>
                    {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1 mr-1" />}
                    <span>1 Uppercase (A-Z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400" : "text-zinc-500"}`}>
                    {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1 mr-1" />}
                    <span>1 Number (0-9)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-400" : "text-zinc-500"}`}>
                    {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-1 mr-1" />}
                    <span>1 Symbol (!@#$)</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#f26419]" />
                    <span>Confirm Password</span>
                  </span>
                  {signupConfirmPassword && (
                    <span className={`text-[10px] font-mono flex items-center gap-1 ${passwordsMatch ? "text-emerald-400" : "text-rose-400"}`}>
                      {passwordsMatch ? "✓ Passwords Match" : "✕ Must match"}
                    </span>
                  )}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl bg-[#0a0b0e] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 border border-white/[0.08] focus:border-[#f26419]/70 focus:outline-none focus:ring-2 focus:ring-[#f26419]/20 transition-all font-body"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isPasswordValid || !passwordsMatch}
                className="w-full mt-2 rounded-full py-3.5 px-6 font-heading font-bold text-xs uppercase tracking-widest text-white bg-gradient-to-r from-[#f26419] to-[#d8520e] hover:from-[#ff7528] hover:to-[#f26419] shadow-lg shadow-[#f26419]/30 hover:shadow-[#f26419]/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Establishing Clean Slate ID...</span>
                  </>
                ) : (
                  <>
                    <span>Create MindFlow ID →</span>
                    <ArrowRight className="w-4 h-4 text-[#f5c7a9]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================
              FORM 2: LOG IN (For Existing ID)
              ======================================================== */}
          {mode === "LOGIN" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-200">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#f26419]" />
                  <span>Email ID</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full rounded-xl bg-[#0a0b0e] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 border border-white/[0.08] focus:border-[#f26419]/70 focus:outline-none focus:ring-2 focus:ring-[#f26419]/20 transition-all font-body"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#f5c7a9]" />
                    <span>Password</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl bg-[#0a0b0e] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 border border-white/[0.08] focus:border-[#f26419]/70 focus:outline-none focus:ring-2 focus:ring-[#f26419]/20 transition-all font-body"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 rounded-full py-3.5 px-6 font-heading font-bold text-xs uppercase tracking-widest text-white bg-gradient-to-r from-[#f26419] to-[#d8520e] hover:from-[#ff7528] hover:to-[#f26419] shadow-lg shadow-[#f26419]/30 hover:shadow-[#f26419]/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Log In to MindFlow</span>
                    <ArrowRight className="w-4 h-4 text-[#f5c7a9]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Switch Link */}
          <div className="pt-3 border-t border-white/[0.06] text-center">
            {mode === "LOGIN" ? (
              <p className="text-xs text-zinc-400">
                Don&apos;t have an ID yet?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("SIGNUP");
                    setErrorMsg(null);
                    setSuggestSwitch(null);
                  }}
                  className="text-[#f5c7a9] hover:text-[#f26419] font-semibold underline underline-offset-4 cursor-pointer transition-colors ml-1"
                >
                  Create your ID here
                </button>
              </p>
            ) : (
              <p className="text-xs text-zinc-400">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("LOGIN");
                    setErrorMsg(null);
                    setSuggestSwitch(null);
                  }}
                  className="text-[#f5c7a9] hover:text-[#f26419] font-semibold underline underline-offset-4 cursor-pointer transition-colors ml-1"
                >
                  Log in with Email &amp; Password
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Security & Features footer */}
        <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Synapse Store</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#f26419]" />
            <span>AI Brain Engine</span>
          </span>
        </div>
      </div>
    </div>
  );
}
