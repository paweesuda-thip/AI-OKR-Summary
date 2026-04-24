"use client";

import React from "react";
import { Hexagon, Swords } from "lucide-react";
import { motion } from "framer-motion";

import ShinyText from "@/src/Interface/Ui/Components/Shared/react-bits/ShinyText";

interface DashboardTopbarProps {
  activeTab: "overview" | "versus";
  setActiveTab: (tab: "overview" | "versus") => void;
}

export default function DashboardTopbar({
  activeTab,
  setActiveTab,
}: DashboardTopbarProps) {
  return (
    <header className="w-full h-16 shrink-0 bg-[#050505]/95 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-4 sm:px-8 z-50 sticky top-0 shadow-2xl">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3.5 group cursor-pointer transition-transform duration-500 hover:scale-[1.02]">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/20 via-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 text-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.2)] group-hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] transition-all duration-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 to-cyan-400/20 blur-xl group-hover:from-rose-400/40 group-hover:to-cyan-400/40 transition-colors duration-500" />
          <Hexagon className="w-6 h-6 fill-fuchsia-500/30 relative z-10" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-black tracking-[0.2em] uppercase leading-tight font-sans drop-shadow-[0_0_15px_rgba(217,70,239,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-500">
            <ShinyText 
              text="Statio-OKR" 
              speed={3} 
              backgroundImage="linear-gradient(120deg, #f43f5e 0%, #d946ef 20%, #8b5cf6 40%, #06b6d4 60%, #10b981 80%, #f43f5e 100%)"
            />
          </h1>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <motion.div
          layout
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="bg-[#0a0a0c] border border-white/5 p-1 rounded-full flex items-center shadow-inner relative shrink-0"
        >
          <button
            onClick={() => setActiveTab("overview")}
            className={`relative cursor-pointer px-6 py-2 text-[10px] sm:text-[11px] font-bold font-sans tracking-[0.2em] uppercase transition-colors rounded-full outline-none ${
              activeTab === "overview" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {activeTab === "overview" && (
              <motion.div
                layoutId="dashboard-tab-bg"
                className="absolute inset-0 bg-zinc-800/80 rounded-full shadow-[inset_0_1px_rgba(255,255,255,0.1)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 transition-colors">Overall</span>
          </button>
          <button
            onClick={() => setActiveTab("versus")}
            className={`group relative cursor-pointer px-6 py-2 text-[10px] sm:text-[11px] font-bold font-sans tracking-[0.2em] uppercase transition-colors rounded-full outline-none flex items-center gap-2 ${
              activeTab === "versus" ? "text-[#f5e6e0]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {activeTab === "versus" && (
              <motion.div
                layoutId="dashboard-tab-bg"
                className="absolute right-0 bottom-0 w-full h-full rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              >
                {/* Subtle iridescent base */}
                <div className="absolute inset-0 rounded-full bg-[#0e0a12]" />
                <div
                  className="absolute inset-0 rounded-full opacity-70"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,180,160,0.10), rgba(200,170,255,0.12), rgba(150,200,255,0.10))",
                  }}
                />

                {/* Traveling-light border (Siri-style comet) */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-[1.5px] rounded-full ai-comet-border"
                />

                {/* Soft ambient halo */}
                <div className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(236,180,220,0.18),transparent_60%)] blur-md" />

                {/* Inner hairline for crispness */}
                <div className="pointer-events-none absolute inset-0 rounded-full border border-white/10 shadow-[inset_0_1px_rgba(255,255,255,0.08)]" />
              </motion.div>
            )}
            <span className="relative z-10 flex items-center gap-2 transition-colors">
              <Swords className={`w-3.5 h-3.5 ${activeTab === "versus" ? "text-[#f0c8b8]" : "text-cyan-500/70"}`} />
              Statio Battles
            </span>
          </button>
        </motion.div>
      </div>
    </header>
  );
}
