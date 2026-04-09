"use client";

import React, { Dispatch, SetStateAction } from "react";
import { Sparkles, Hexagon } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import MagicRings from "@/components/react-bits/MagicRings";
import { AIScoreResult, AIScoreSection } from "./ai-score-section";
import { TeamSummary } from "@/lib/types/okr";
import { cn } from "@/lib/utils";

import ShinyText from "@/components/react-bits/ShinyText";

interface DashboardTopbarProps {
  aiDrawerOpen: boolean;
  setAiDrawerOpen: (open: boolean) => void;
  teamSummary: TeamSummary | null;
  dashboardData: any;
  aiScoreResult: AIScoreResult | null;
  setAiScoreResult: Dispatch<SetStateAction<AIScoreResult | null>>;
}

export default function DashboardTopbar({
  aiDrawerOpen,
  setAiDrawerOpen,
  teamSummary,
  dashboardData,
  aiScoreResult,
  setAiScoreResult,
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
        {/* AI Action Drawer */}
        <Drawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen}>
          <DrawerTrigger asChild>
            <button className="group relative h-9 px-4 rounded-full cursor-pointer transition-all bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40 flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider uppercase relative z-10 hidden sm:inline">AI Insights</span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh] bg-[#050505]/95 backdrop-blur-3xl border-white/10">
            <div className="mx-auto w-full max-w-7xl h-full flex flex-col p-4">
              <DrawerHeader className="shrink-0 text-center sm:text-left border-b border-white/5 pb-6">
                <DrawerTitle className="text-2xl flex items-center justify-center sm:justify-start gap-3 font-bold tracking-tight text-white">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  Neurometric Analysis
                </DrawerTitle>
                <DrawerDescription className="text-zinc-400 mt-2 text-sm tracking-wide max-w-xl">
                  Deep dive into team performance trends, neural insights, and actionable trajectory modifications for your command center.
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto mt-6 pr-2 relative filter-container scrollbar-hide">
                <div className="pointer-events-none fixed inset-0 z-0 opacity-20 blur-2xl flex items-center justify-center">
                  <MagicRings
                    color="#6366f1"
                    colorTwo="#22d3ee"
                    speed={0.2}
                    ringCount={4}
                    attenuation={25}
                    lineThickness={2}
                    baseRadius={0.4}
                    opacity={0.4}
                    followMouse={false}
                  />
                </div>
                <div className="relative z-10 h-full max-w-4xl mx-auto">
                  <AIScoreSection
                    teamSummary={teamSummary}
                    dashboardData={dashboardData}
                    aiScoreResult={aiScoreResult}
                    onAiScoreResultChange={setAiScoreResult}
                  />
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
}
