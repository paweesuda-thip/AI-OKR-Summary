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
    <header className="w-full h-14 shrink-0 bg-background/80 backdrop-blur-2xl border-b border-border/50 flex items-center justify-between px-4 sm:px-8 z-50 sticky top-0 transition-colors">
      {/* Brand / Logo */}
      <div
        className="flex items-center gap-3 sm:gap-3.5 group min-w-0 transition-transform duration-500 motion-reduce:transform-none"
        aria-label="Statio OKR"
      >
        <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-rose-500/20 via-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 text-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.2)] transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(217,70,239,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 to-cyan-400/20 blur-xl transition-colors duration-500 group-hover:from-rose-400/40 group-hover:to-cyan-400/40" />
          <Hexagon className="relative z-10 size-6 fill-fuchsia-500/30" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col">
          <h1 className="font-sans text-base font-black uppercase leading-tight tracking-[0.2em] drop-shadow-[0_0_15px_rgba(217,70,239,0.4)] transition-all duration-500 sm:text-lg group-hover:drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]">
            <ShinyText
              text="Statio-OKR"
              speed={3}
              backgroundImage="linear-gradient(120deg, #f43f5e 0%, #d946ef 20%, #8b5cf6 40%, #06b6d4 60%, #10b981 80%, #f43f5e 100%)"
            />
          </h1>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        <motion.div
          layout
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-muted/40 border border-border/50 p-1 rounded-lg flex items-center shadow-sm"
        >
          <button
            onClick={() => setActiveTab("overview")}
            className={`relative cursor-pointer px-4 sm:px-5 py-1.5 text-[11px] sm:text-xs font-medium tracking-wide transition-colors rounded-md outline-none ${
              activeTab === "overview" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === "overview" && (
              <motion.div
                layoutId="dashboard-tab-bg"
                className="absolute inset-0 bg-background rounded-md shadow-sm border border-border/50"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 transition-colors">Overall</span>
          </button>
          <button
            onClick={() => setActiveTab("versus")}
            className={`group relative cursor-pointer px-4 sm:px-5 py-1.5 text-[11px] sm:text-xs font-medium tracking-wide transition-colors rounded-md outline-none flex items-center gap-1.5 ${
              activeTab === "versus" ? "text-[#f5e6e0]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === "versus" && (
              <motion.div
                layoutId="dashboard-tab-bg"
                className="absolute right-0 bottom-0 w-full h-full rounded-md"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              >
                {/* Subtle iridescent base */}
                <div className="absolute inset-0 rounded-md bg-[#0e0a12]" />
                <div
                  className="absolute inset-0 rounded-md opacity-70"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,180,160,0.10), rgba(200,170,255,0.12), rgba(150,200,255,0.10))",
                  }}
                />

                {/* Traveling-light border (Siri-style comet) */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-[1.5px] rounded-md ai-comet-border"
                />

                {/* Soft ambient halo */}
                <div className="pointer-events-none absolute -inset-2 rounded-md bg-[radial-gradient(ellipse_at_center,rgba(236,180,220,0.18),transparent_60%)] blur-md" />

                {/* Inner hairline for crispness */}
                <div className="pointer-events-none absolute inset-0 rounded-md border border-white/10 shadow-[inset_0_1px_rgba(255,255,255,0.08)]" />
              </motion.div>
            )}
            <span className="relative z-10 flex items-center gap-1.5 transition-colors">
              <Swords className={`w-3.5 h-3.5 ${activeTab === "versus" ? "text-[#f0c8b8]" : ""}`} />
              <span className="hidden sm:inline">Battles</span>
              <span className="inline sm:hidden">Vs</span>
            </span>
          </button>
        </motion.div>
      </div>
    </header>
  );
}
