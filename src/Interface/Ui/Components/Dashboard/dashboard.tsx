"use client";

import { useState, useMemo } from "react";
import {
  AlertCircle,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  Trophy,
  Crown,
  Medal,
  Swords,
  Sparkles,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/src/Interface/Ui/Primitives/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/src/Interface/Ui/Primitives/drawer";

import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { AIScoreResult, AIScoreSection } from "@/src/Interface/Ui/Components/Ai/ai-score-section";
import OverviewCards from "@/src/Interface/Ui/Components/Okr/overview-cards";
import ObjectivesSection from "@/src/Interface/Ui/Components/Okr/objectives-section";
import PeriodComparisonSection from "@/src/Interface/Ui/Components/Okr/period-comparison-section";
import { CheckInEngagement } from "@/src/Interface/Ui/Components/Okr/check-in-engagement";
import ClickSpark from "@/src/Interface/Ui/Components/Shared/react-bits/ClickSpark";
import Image from "next/image";

import type {
  ParticipantDetailRaw,
} from "@/src/Domain/Entities/Okr";
import ProgressUpdateSection from "@/src/Interface/Ui/Components/Okr/progress-update-section";
import { FloatingAiChat } from "@/src/Interface/Ui/Components/Ai/floating-ai-chat";
import VersusMode from "@/src/Interface/Ui/Components/Okr/versus-mode";
import DashboardTopbar from "./dashboard-topbar";
import DashboardSelectors from "./dashboard-selectors";
import FilterBar from "./filter-bar";
import { useDashboardQuery } from "@/src/Interface/Ui/Hooks/use-dashboard-query";
import { useParticipantQuery } from "@/src/Interface/Ui/Hooks/use-participant-query";
import { useDdlOptions, useOrgNodeQuery } from "@/src/Interface/Ui/Hooks/use-ddl-query";

export default function Dashboard() {
  const FALLBACK_CYCLE_ID = 185467;
  const FALLBACK_ORG_ID = 18477;

  // ── Selectors (live DDL APIs) ──────────────────────────────────────────────
  const {
    cycleOptions,
    isLoading: ddlLoading,
    error: ddlError,
  } = useDdlOptions({ rootOrganizationId: 18473 });

  const { groupedOrgOptions: allOrgGroupedOptions } = useOrgNodeQuery();

  const currentCycle = useMemo(
    () => cycleOptions.find((cycle) => cycle.isCurrentCycle) || cycleOptions[0],
    [cycleOptions],
  );

  const defaultOrgId = useMemo(() => {
    const hasPreferred = allOrgGroupedOptions.some((group) =>
      group.options.some((option) => option.organizationId === FALLBACK_ORG_ID),
    );

    if (hasPreferred) return FALLBACK_ORG_ID;
    return allOrgGroupedOptions[0]?.options[0]?.organizationId ?? FALLBACK_ORG_ID;
  }, [allOrgGroupedOptions]);

  const [assessmentSetId, setAssessmentSetId] = useState(FALLBACK_CYCLE_ID);
  const [organizationId, setOrganizationId] = useState(FALLBACK_ORG_ID);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: today,
    };
  });
  const [isOverall, setIsOverall] = useState(true);

  // ── UI State ───────────────────────────────────────────────────────────────
  const [aiScoreResult, setAiScoreResult] = useState<AIScoreResult | null>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'versus'>('overview');

  const resolvedAssessmentSetId = useMemo(() => {
    const exists = cycleOptions.some((cycle) => cycle.setId === assessmentSetId);
    if (exists) return assessmentSetId;
    return currentCycle?.setId ?? FALLBACK_CYCLE_ID;
  }, [assessmentSetId, currentCycle?.setId, cycleOptions]);

  const resolvedOrganizationId = useMemo(() => {
    const exists = allOrgGroupedOptions.some((group) =>
      group.options.some((option) => option.organizationId === organizationId),
    );
    if (exists) return organizationId;
    return defaultOrgId;
  }, [defaultOrgId, allOrgGroupedOptions, organizationId]);

  // ── Derived query params ───────────────────────────────────────────────────
  const queryParams = useMemo(() => ({
    assessmentSetId: resolvedAssessmentSetId,
    organizationId: resolvedOrganizationId,
    dateStart: (!isOverall && dateRange?.from) ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    dateEnd: (!isOverall && dateRange?.to) ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  }), [resolvedAssessmentSetId, resolvedOrganizationId, isOverall, dateRange]);

  // ── TanStack Query ─────────────────────────────────────────────────────────
  const shouldRunOverviewQueries = activeTab === 'overview';

  const {
    data: dashboardResult,
    isLoading: dashLoading,
    error: dashError,
  } = useDashboardQuery(queryParams, { enabled: shouldRunOverviewQueries });

  const {
    data: participantDetails = [],
    isLoading: partLoading,
  } = useParticipantQuery(queryParams, { enabled: shouldRunOverviewQueries });

  // ── Derived data ───────────────────────────────────────────────────────────
  const loading = dashLoading || partLoading || ddlLoading;
  const errorMessage =
    dashError?.message ||
    (ddlError instanceof Error ? ddlError.message : "") ||
    "";

  const teamSummary = dashboardResult?.teamSummary ?? null;
  const objectives = useMemo(
    () => dashboardResult?.objectives ?? [],
    [dashboardResult?.objectives],
  );
  const contributors = useMemo(
    () => dashboardResult?.contributors ?? [],
    [dashboardResult?.contributors],
  );
  const atRiskObjectives = useMemo(
    () => dashboardResult?.atRiskObjectives ?? [],
    [dashboardResult?.atRiskObjectives],
  );

  const dashboardData = useMemo(
    () => ({
      summary: teamSummary,
      objectives,
      contributors,
      atRisk: atRiskObjectives,
    }),
    [atRiskObjectives, contributors, objectives, teamSummary],
  );

  const selectedCycle = useMemo(
    () => cycleOptions.find(c => c.setId === resolvedAssessmentSetId),
    [cycleOptions, resolvedAssessmentSetId],
  );

  const topContributors = useMemo(() => {
    if (participantDetails.length > 0) {
      return [...participantDetails].sort((a, b) => a.seq - b.seq).slice(0, 3);
    }

    if (loading) {
      return [
        { employeeId: 'skel-1', fullName: '...', totalCheckIn: 0, avgPercent: 0, pictureURL: '' } as unknown as ParticipantDetailRaw,
        { employeeId: 'skel-2', fullName: '...', totalCheckIn: 0, avgPercent: 0, pictureURL: '' } as unknown as ParticipantDetailRaw,
        { employeeId: 'skel-3', fullName: '...', totalCheckIn: 0, avgPercent: 0, pictureURL: '' } as unknown as ParticipantDetailRaw,
      ];
    }

    return [];
  }, [loading, participantDetails]);

  const { topUpdates, bottomUpdates } = useMemo(() => {
    const allSubObjectives = objectives.flatMap((objective) => objective.subObjectives || []);

    return {
      topUpdates: [...allSubObjectives]
        .filter((sub) => sub.objectiveOwnerType === 1 && (sub.progressUpdate || 0) > 0)
        .sort((a, b) => (b.progressUpdate || 0) - (a.progressUpdate || 0))
        .slice(0, 3),
      bottomUpdates: [...allSubObjectives]
        .filter((sub) => sub.objectiveOwnerType === 1)
        .sort((a, b) => (a.progressUpdate || 0) - (b.progressUpdate || 0))
        .slice(0, 3),
    };
  }, [objectives]);

  const showStatus = useMemo(() => {
    if (!selectedCycle?.dateEnd) return true;

    const cycleEnd = new Date(selectedCycle.dateEnd);
    
    // Determine the date to evaluate against
    // If Overall QTR is ON, use the real current date.
    // If Overall QTR is OFF (filtering by date), use the end date of the filter range.
    const evaluatedDate = isOverall 
      ? new Date() 
      : (dateRange?.to ? dateRange.to : new Date());

    if (evaluatedDate.getFullYear() > cycleEnd.getFullYear()) return true;
    if (evaluatedDate.getFullYear() === cycleEnd.getFullYear() && evaluatedDate.getMonth() >= cycleEnd.getMonth()) return true;
    
    return false;
  }, [isOverall, selectedCycle, dateRange]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
      <div className="flex flex-col h-svh w-full overflow-hidden bg-transparent text-white">
        <DashboardTopbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* ── Overview Control Strip (hidden in Versus) ── */}
        <AnimatePresence initial={false}>
          {activeTab === "overview" && (
            <motion.div
              key="overview-control-strip"
              layout
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="w-full z-40 bg-background/80 backdrop-blur-2xl border-b border-border/50 shrink-0 sticky top-0 px-4 sm:px-8 py-3 overflow-x-hidden overflow-y-visible"
            >
              <div className="flex flex-col xl:flex-row items-center gap-4 justify-between max-w-[1920px] mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-3 w-full xl:w-auto overflow-x-auto scrollbar-hide shrink-0 pb-2 xl:pb-0">
                  <DashboardSelectors
                    cycleOptions={cycleOptions}
                    orgGroupedOptions={allOrgGroupedOptions}
                    selectedCycleId={resolvedAssessmentSetId}
                    onCycleChange={setAssessmentSetId}
                    selectedOrgId={resolvedOrganizationId}
                    onOrgChange={setOrganizationId}
                    disabled={loading}
                    loading={ddlLoading}
                  />
                  <div className="hidden lg:block w-px h-5 bg-border/50 mx-1" />
                  <FilterBar
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    isOverall={isOverall}
                    setIsOverall={setIsOverall}
                  />
                </div>

                <div className="shrink-0 flex items-center py-0.5">
                  <Drawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen}>
                    <DrawerTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open AI Insights"
                        className="group relative isolate h-8 shrink-0 cursor-pointer overflow-visible rounded-full px-2.5 sm:px-3.5 outline-none transition-[transform,box-shadow] hover:scale-[1.015] hover:shadow-[0_10px_32px_-10px_rgba(255,170,200,0.35)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-[0_6px_26px_-10px_rgba(160,130,220,0.4)]"
                      >
                        <span className="absolute inset-0 rounded-full bg-[#0f0b14]" aria-hidden />
                        <span
                          className="absolute inset-0 rounded-full opacity-[0.88]"
                          style={{
                            background:
                              "linear-gradient(122deg, rgba(255,135,185,0.32) 0%, rgba(255,175,125,0.24) 14%, rgba(255,230,140,0.2) 29%, rgba(150,235,165,0.24) 43%, rgba(95,215,235,0.26) 57%, rgba(130,175,255,0.28) 71%, rgba(205,165,255,0.3) 85%, rgba(255,175,205,0.26) 100%)",
                          }}
                          aria-hidden
                        />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -inset-[1.5px] rounded-full ai-comet-border-insights"
                        />
                        <span
                          className="pointer-events-none absolute -inset-px rounded-full opacity-[0.95] blur-[11px]"
                          style={{
                            background:
                              "radial-gradient(ellipse 85% 70% at 45% -18%, rgba(255,200,130,0.38), transparent 50%), radial-gradient(ellipse 75% 60% at 88% 8%, rgba(130,195,255,0.36), transparent 50%), radial-gradient(ellipse 65% 55% at 12% 95%, rgba(255,150,195,0.28), transparent 48%)",
                          }}
                          aria-hidden
                        />
                        <span
                          className="pointer-events-none absolute inset-0 rounded-full border border-white/18 shadow-[inset_0_1px_rgba(255,255,255,0.14)]"
                          aria-hidden
                        />
                        <span className="relative z-10 flex items-center justify-center gap-1.5">
                          <Sparkles
                            className="h-3.5 w-3.5 shrink-0 text-[#fff8fc] drop-shadow-[0_0_7px_rgba(255,160,200,0.75)] drop-shadow-[0_0_12px_rgba(130,210,255,0.55)] transition-transform duration-300 group-hover:scale-105"
                            strokeWidth={2}
                          />
                          <span className="hidden text-[11px] font-semibold tracking-wide text-[#faf6ff] drop-shadow-[0_0_8px_rgba(240,170,220,0.45)] drop-shadow-[0_0_12px_rgba(170,200,255,0.35)] sm:inline">
                            AI Insights
                          </span>
                        </span>
                      </button>
                    </DrawerTrigger>
                    <DrawerContent className="h-[90vh] bg-background/95 backdrop-blur-3xl border-border/50">
                      <div className="mx-auto w-full max-w-7xl h-full flex flex-col p-4">
                        <DrawerHeader className="shrink-0 text-center sm:text-left border-b border-border/50 pb-6">
                          <DrawerTitle className="text-2xl flex items-center justify-center sm:justify-start gap-3 font-semibold tracking-tight text-foreground">
                            <div className="p-2 rounded-xl bg-muted/50 border border-border/50 shadow-sm">
                              <Sparkles className="w-5 h-5 text-foreground" />
                            </div>
                            Neurometric Analysis
                          </DrawerTitle>
                          <DrawerDescription className="text-muted-foreground mt-2 text-sm max-w-xl">
                            Deep dive into team performance trends, neural insights, and actionable trajectory modifications for your command center.
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="flex-1 overflow-y-auto mt-6 pr-2 relative scrollbar-hide">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main className="relative flex-1 min-w-0 flex flex-col h-full overflow-y-auto scrollbar-hide">
          <motion.div
            layout
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={`relative z-10 flex-1 w-full ${
              activeTab === "versus"
                ? "pt-0 px-0 pb-0 max-w-none"
                : "pt-6 px-4 sm:px-8 pb-12 max-w-[1920px] mx-auto"
            } ${loading ? "opacity-60 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}`}
          >

            {errorMessage && (
              <div className="mb-8 px-6 py-5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-between animate-in fade-in zoom-in duration-300 w-full">
                <div className="flex items-center gap-4 text-base text-destructive">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
              {activeTab === 'versus' ? (
                <motion.div
                  key="versus-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="w-full"
                >
                  <VersusMode
                    cycleOptions={cycleOptions}
                    orgGroupedOptions={allOrgGroupedOptions}
                    ddlLoading={ddlLoading}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="overview-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                >

          {/* ── Overview Metrics Strip ── */}
          <section className="mb-10">
            <OverviewCards
              summary={teamSummary}
              participantDetails={participantDetails}
              objectives={objectives}
              showStatus={showStatus}
            />
          </section>

          {/* ── Main Layout: Dashboard Style ── */}
          <div className="flex flex-col gap-12">
            {/* ── Top Performers (HoloCard Leaderboard) ── */}
            {topContributors.length > 0 && (
                <section className="relative">
                  {/* Section Header — Apple-style minimal */}
                  <div className="mb-12 flex flex-col items-center text-center relative">
                    <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground/60 mb-2">Top Performers</span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-6">Hall of Fame</h3>
                  </div>

                  {/* Podium Grid — Editorial Portrait Cards */}
                  <div className="flex flex-col md:flex-row justify-center items-end gap-5 lg:gap-6 max-w-4xl mx-auto px-4 w-full">
                    {(() => {
                      const rankConfig = [
                        { icon: Crown, accent: 'text-amber-500 dark:text-amber-400', accentBg: 'bg-amber-500/10 dark:bg-amber-400/10', ring: 'ring-amber-500/20 dark:ring-amber-400/20', glow: 'hover:shadow-amber-200/20 dark:hover:shadow-amber-500/10' },
                        { icon: Medal, accent: 'text-zinc-400 dark:text-zinc-500', accentBg: 'bg-zinc-400/10 dark:bg-zinc-500/10', ring: 'ring-zinc-400/20 dark:ring-zinc-500/20', glow: 'hover:shadow-zinc-200/20 dark:hover:shadow-zinc-500/10' },
                        { icon: Trophy, accent: 'text-orange-500 dark:text-orange-400', accentBg: 'bg-orange-500/10 dark:bg-orange-400/10', ring: 'ring-orange-500/20 dark:ring-orange-400/20', glow: 'hover:shadow-orange-200/20 dark:hover:shadow-orange-500/10' },
                      ];

                      return [1, 0, 2].map((origIndex) => {
                        const p = topContributors[origIndex];
                        if (!p) return null;

                        const isFirst = origIndex === 0;
                        const config = rankConfig[origIndex];
                        const RankIcon = config.icon;

                        return (
                          <div
                            key={p.employeeId || origIndex}
                            className={`group relative flex flex-col w-full md:w-1/3 ${
                              isFirst ? 'order-1 md:order-2 md:-translate-y-5 z-10' :
                              origIndex === 1 ? 'order-2 md:order-1' :
                              'order-3 md:order-3'
                            }`}
                          >
                            <div className={`relative overflow-hidden rounded-2xl bg-background/50 dark:bg-zinc-900/50 border border-border/30 dark:border-white/6 transition-all duration-500 hover:border-border/50 dark:hover:border-white/12 ${isFirst ? 'shadow-xl' : 'shadow-lg'} ${config.glow}`}>
                              {/* Portrait Photo */}
                              <div className={`relative w-full ${isFirst ? 'aspect-[3/4]' : 'aspect-[4/5]'} overflow-hidden bg-muted/30`}>
                                {(p.pictureMediumURL || p.pictureURL) ? (
                                  <Image
                                    src={p.pictureMediumURL || p.pictureURL}
                                    alt={p.fullName}
                                    fill
                                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                    unoptimized
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-muted/40 flex items-center justify-center">
                                    <span className="text-4xl font-light text-muted-foreground/40">{p.fullName?.charAt(0)}</span>
                                  </div>
                                )}

                                {/* Cinematic gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 group-hover:opacity-0 transition-opacity duration-500" />

                                {/* Rank pill — top left */}
                                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md ${config.accentBg} ${config.ring} ring-1 z-20 group-hover:opacity-0 transition-opacity duration-500`}>
                                  <RankIcon className={`w-3 h-3 ${config.accent}`} />
                                  <span className={`text-[11px] font-bold ${config.accent}`}>#{origIndex + 1}</span>
                                </div>

                                {/* Name overlay — bottom of photo */}
                                <div className="absolute inset-x-0 bottom-0 px-4 pb-4 z-20 group-hover:opacity-0 group-hover:translate-y-2 transition-all duration-500">
                                  <h4 className={`${isFirst ? 'text-xl' : 'text-lg'} font-semibold text-white tracking-tight leading-tight drop-shadow-sm`}>
                                    {p.fullName}
                                  </h4>
                                </div>

                                {/* ── HOVER OVERLAY: Enterprise Detail Panel ── */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex flex-col" style={{ background: 'linear-gradient(160deg, rgba(10,12,18,0.97) 0%, rgba(16,20,30,0.97) 100%)' }}>
                                  {/* Header strip */}
                                  <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                                    <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-zinc-500 mb-0.5">Performance Review</p>
                                    <h5 className="text-sm font-bold text-white leading-tight truncate">{p.fullName}</h5>
                                  </div>

                                  {/* Radar + Score side-by-side */}
                                  <div className="flex items-center gap-1 px-3 pt-3 pb-1">
                                    <div className="w-[100px] h-[90px] shrink-0">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="62%"
                                          data={[
                                            { s: 'Goal', v: p.goalAchievementScore ?? 0, fullMark: 100 },
                                            { s: 'Qly',  v: p.qualityScore ?? 0,           fullMark: 100 },
                                            { s: 'Eng',  v: p.engagementBehaviorScore ?? 0, fullMark: 100 },
                                          ]}
                                        >
                                          <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                          <PolarAngleAxis dataKey="s" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 8, fontWeight: 600 }} />
                                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                          <Radar dataKey="v" stroke={config.accent.replace('text-', '#').includes('amber') ? '#f59e0b' : config.accent.includes('zinc') ? '#71717a' : '#f97316'} strokeWidth={1.5} fill="rgba(255,255,255,0.07)" fillOpacity={1} />
                                          <defs />
                                        </RadarChart>
                                      </ResponsiveContainer>
                                    </div>
                                    {/* Total score block */}
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                      <span className="text-[8px] font-semibold tracking-[0.18em] uppercase text-zinc-500">Total Score</span>
                                      <span className="text-3xl font-black text-white font-mono leading-none mt-0.5 tabular-nums">
                                        {Math.round(p.totalScore ?? p.avgPercent)}
                                      </span>
                                      {(() => {
                                        const trend = p.trend ?? 'normal';
                                        const cfg2 = trend === 'up'
                                          ? { Icon: TrendingUp,   color: 'text-emerald-400', label: 'Improving' }
                                          : trend === 'down'
                                          ? { Icon: TrendingDown, color: 'text-rose-400',    label: 'Declining' }
                                          : { Icon: Activity,     color: 'text-zinc-400',    label: 'Stable' };
                                        return (
                                          <div className={`flex items-center gap-1 mt-1.5 ${cfg2.color}`}>
                                            <cfg2.Icon className="w-3 h-3" strokeWidth={2.5} />
                                            <span className="text-[9px] font-bold uppercase tracking-wider">{cfg2.label}</span>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>

                                  {/* Metric bars */}
                                  <div className="flex flex-col gap-2 px-4 py-2">
                                    {[
                                      { label: 'Goal Achievement', val: p.goalAchievementScore ?? 0,     color: '#10b981' },
                                      { label: 'Quality of Work',  val: p.qualityScore ?? 0,             color: '#f59e0b' },
                                      { label: 'Engagement',       val: p.engagementBehaviorScore ?? 0,  color: '#a78bfa' },
                                    ].map(({ label, val, color }) => (
                                      <div key={label}>
                                        <div className="flex items-center justify-between mb-0.5">
                                          <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
                                          <span className="text-[10px] font-bold font-mono text-white">{Math.round(val)}</span>
                                        </div>
                                        <div className="h-[3px] w-full bg-white/[0.06] rounded-full overflow-hidden">
                                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(val, 100)}%`, backgroundColor: color }} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Footer: check-in ratio */}
                                  <div className="mt-auto px-4 pb-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Check-ins</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold font-mono text-white">{p.totalCheckIn}<span className="text-zinc-600">/{p.totalCheckInAll}</span></span>
                                      {p.totalMissCheckIn > 0 && (
                                        <span className="text-[9px] font-semibold text-rose-400">−{p.totalMissCheckIn} missed</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Bottom stats row — Total Score + Trend */}
                              <div className="px-4 py-3 flex items-center justify-between bg-background/50 dark:bg-zinc-900/50 border-t border-border/20 dark:border-white/5">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Total Score</span>
                                  <span className="text-lg font-bold font-mono text-white tabular-nums leading-none mt-0.5">
                                    {p.totalScore?.toFixed(0) ?? p.avgPercent.toFixed(1)}
                                  </span>
                                </div>
                                {(() => {
                                  const trend = p.trend ?? 'normal';
                                  const cfg = trend === 'up'
                                    ? { Icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Up' }
                                    : trend === 'down'
                                    ? { Icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Down' }
                                    : { Icon: Activity, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', label: 'Stable' };
                                  const { Icon, color, bg, border, label } = cfg;
                                  return (
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${bg} ${border}`}>
                                      <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={2.5} />
                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{label}</span>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </section>
            )}

            {/* ── Check-In Engagement (Top/Bottom Check-ins) ── */}
            <section className="relative max-w-7xl mx-auto w-full">
              <CheckInEngagement participantDetails={participantDetails} showStatus={showStatus} queryParams={queryParams} />
            </section>

            {/* ── Focus Areas (Unboxed) ── */}
            <section className="relative grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto w-full">
              <>
                <div className="bg-background/20 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-lg transition-all hover:bg-background/40 hover:border-border/50">
                  <ProgressUpdateSection
                    title="Trending"
                    description="Tasks with the highest acceleration"
                    subObjectives={topUpdates}
                    type="top"
                  />
                </div>
                <div className="bg-background/20 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-lg transition-all hover:bg-background/40 hover:border-border/50">
                  <ProgressUpdateSection
                    title="Needs Attention"
                    description="Tasks losing momentum"
                    subObjectives={bottomUpdates}
                    type="bottom"
                  />
                </div>
              </>
            </section>

            {/* ── Period Comparison ── */}
            <section className="hidden relative bg-background/20 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-lg max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h3 className="text-xl font-bold text-foreground">
                  Momentum Comparison
                </h3>
              </div>
              <PeriodComparisonSection
                comparison={{
                  currentCompletionRate:
                    teamSummary?.objectiveCompletionRate || 0,
                  previousCompletionRate:
                    (teamSummary?.objectiveCompletionRate || 0) - 5,
                  completionRateDelta: 5,
                  currentAvgProgress: teamSummary?.avgObjectiveProgress || 0,
                  previousAvgProgress:
                    (teamSummary?.avgObjectiveProgress || 0) - 8,
                  avgProgressDelta: 8,
                  currentCheckInCount: teamSummary?.totalKRs || 0,
                  previousCheckInCount: (teamSummary?.totalKRs || 0) - 12,
                  checkInCountDelta: 12,
                  progressTrend:
                    "Upward trend observed mostly in engineering teams",
                  engagementTrend: "Consistent weekly check-ins maintained",
                }}
              />
            </section>

            {/* ── Objectives ── */}
            <section className="relative bg-background/20 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-lg max-w-7xl mx-auto w-full pb-12">
              <ObjectivesSection objectives={objectives} showStatus={showStatus} />
            </section>
          </div>

          {/* ── Floating AI Chat ── */}
          <FloatingAiChat dashboardData={dashboardData} />
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>
        </main>
      </div>
  );
}
