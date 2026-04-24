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
      <div className="flex items-center gap-2.5 sm:gap-3 group">
        <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0a0a0c]">
          {/* Glowing Aura */}
          <div className="absolute -inset-2 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 rounded-full blur-md opacity-30 group-hover:opacity-60 transition duration-500" />
          
          {/* Siri-style comet border (Color shifted to match logo) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-[1.5px] rounded-full ai-comet-border opacity-90"
            style={{ filter: "hue-rotate(220deg) brightness(1.2)" }}
          />

          <Hexagon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white relative z-10" strokeWidth={1.5} />
        </div>
        <div className="flex items-center">
          <ShinyText 
            speed={5} 
            backgroundImage="linear-gradient(110deg, #f0abfc 0%, #c084fc 30%, #67e8f9 50%, #c084fc 70%, #f0abfc 100%)"
            text={
              <React.Fragment>
                <span className="text-[17px] sm:text-[19px] font-black italic tracking-tighter uppercase font-sans pr-1">Statio</span>
                <span className="text-[17px] sm:text-[19px] font-light italic tracking-[0.2em] uppercase font-sans ml-0.5">OKR</span>
              </React.Fragment>
            }
          />
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
