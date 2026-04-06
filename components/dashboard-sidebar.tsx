"use client";

import React, { Dispatch, SetStateAction } from "react";
import { DateRange } from "react-day-picker";
import { Sparkles, LayoutDashboard, CalendarDays, Clock, PanelLeftClose, PanelLeft } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import DashboardSelectors from "./dashboard-selectors";
import FilterBar from "./filter-bar";
import MagicRings from "@/components/react-bits/MagicRings";
import { AIScoreResult, AIScoreSection } from "./ai-score-section";
import { TeamSummary } from "@/lib/types/okr";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  assessmentSetId: number;
  setAssessmentSetId: (id: number) => void;
  organizationId: number;
  setOrganizationId: (id: number) => void;
  loading: boolean;

  aiDrawerOpen: boolean;
  setAiDrawerOpen: (open: boolean) => void;
  teamSummary: TeamSummary | null;
  dashboardData: any;
  aiScoreResult: AIScoreResult | null;
  setAiScoreResult: Dispatch<SetStateAction<AIScoreResult | null>>;

  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  isOverall: boolean;
  setIsOverall: (val: boolean) => void;

  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function DashboardSidebar({
  assessmentSetId,
  setAssessmentSetId,
  organizationId,
  setOrganizationId,
  loading,
  aiDrawerOpen,
  setAiDrawerOpen,
  teamSummary,
  dashboardData,
  aiScoreResult,
  setAiScoreResult,
  dateRange,
  setDateRange,
  isOverall,
  setIsOverall,
  isOpen,
  setIsOpen,
}: DashboardSidebarProps) {

  return (
    <aside data-panel="sidebar" className="z-30 flex h-full shrink-0 select-none">
      {/* ── Icon Rail (always visible) ── */}
      <div className="flex w-14 flex-col items-center border-r border-border/40 bg-sidebar py-3 gap-1">
        {/* Logo */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-colors mb-2 cursor-pointer"
          title="Toggle sidebar"
        >
          <LayoutDashboard className="h-5 w-5" />
        </button>

        {/* Nav icons */}
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
            isOpen && "bg-accent text-accent-foreground"
          )}
          title="Cycle & Organization"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          title="Time Period"
        >
          <Clock className="h-4 w-4" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* AI button */}
        <Drawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-indigo-500 hover:bg-indigo-500/15 transition-colors cursor-pointer"
              title="AI Insights"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh] bg-background/95 backdrop-blur-3xl border-border/50">
            <div className="mx-auto w-full max-w-7xl h-full flex flex-col p-4">
              <DrawerHeader className="shrink-0 text-center sm:text-left">
                <DrawerTitle className="text-2xl flex items-center justify-center sm:justify-start gap-2 font-bold tracking-tight">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                  AI Insights
                </DrawerTitle>
                <DrawerDescription>
                  Deep dive into team performance trends and actionable recommendations.
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto mt-4 pr-2 relative">
                <div className="pointer-events-none fixed inset-0 z-0 opacity-20 dark:opacity-30 blur-xl">
                  <MagicRings
                    color="#6366f1"
                    colorTwo="#a855f7"
                    speed={0.3}
                    ringCount={3}
                    attenuation={20}
                    lineThickness={2}
                    baseRadius={0.4}
                    opacity={0.5}
                    followMouse={false}
                  />
                </div>
                <div className="relative z-10 h-full">
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

        {/* Collapse toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors mt-1 cursor-pointer"
          title={isOpen ? "Collapse panel" : "Expand panel"}
        >
          {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Expandable Panel ── */}
      <div
        className={cn(
          "overflow-hidden border-r border-border/40 bg-sidebar transition-[width] duration-300 ease-in-out",
          isOpen ? "w-64" : "w-0"
        )}
      >
        <div className="flex h-full w-64 flex-col">
          {/* Panel Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
            <h2 className="text-sm font-bold tracking-tight">Statio OKR</h2>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium bg-muted px-1.5 py-0.5 rounded">
              Dashboard
            </span>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Selectors */}
            <div>
              <DashboardSelectors
                selectedCycleId={assessmentSetId}
                onCycleChange={setAssessmentSetId}
                selectedOrgId={organizationId}
                onOrgChange={setOrganizationId}
                disabled={loading}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-border/40" />

            {/* Time Period */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
                Time Period
              </p>
              <FilterBar
                dateRange={dateRange}
                setDateRange={setDateRange}
                isOverall={isOverall}
                setIsOverall={setIsOverall}
              />
            </div>
          </div>

          {/* Panel Footer */}
          <div className="p-3 border-t border-border/30">
            <Drawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen}>
              <DrawerTrigger asChild>
                <button className="w-full h-10 rounded-xl cursor-pointer font-semibold text-sm transition-all bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Insights</span>
                </button>
              </DrawerTrigger>
            </Drawer>
          </div>
        </div>
      </div>
    </aside>
  );
}
