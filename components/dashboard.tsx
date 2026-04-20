"use client";

import { useState, useMemo } from "react";
import {
  AlertCircle,
  X,
  TrendingUp,
  Trophy,
  Crown,
  Medal,
  Swords,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { AIScoreResult, AIScoreSection } from "./ai-score-section";
import OverviewCards from "./overview-cards";
import ObjectivesSection from "./objectives-section";
import PeriodComparisonSection from "./period-comparison-section";
import { CheckInEngagement } from "@/components/check-in-engagement";
import ClickSpark from "@/components/react-bits/ClickSpark";
import Image from "next/image";
import MagicRings from "@/components/react-bits/MagicRings";

import type {
  ParticipantDetailRaw,
} from "@/lib/types/okr";
import ProgressUpdateSection from "./progress-update-section";
import { FloatingAiChat } from "./floating-ai-chat";
import VersusMode from "./versus-mode";
import DashboardTopbar from "./dashboard-topbar";
import DashboardSelectors from "./dashboard-selectors";
import FilterBar from "./filter-bar";
import { useDashboardQuery } from "@/hooks/queries/use-dashboard-query";
import { useParticipantQuery } from "@/hooks/queries/use-participant-query";
import { useDdlOptions } from "@/hooks/queries/use-ddl-query";

export default function Dashboard() {
  const FALLBACK_CYCLE_ID = 185467;
  const FALLBACK_ORG_ID = 18477;

  // ── Selectors (live DDL APIs) ──────────────────────────────────────────────
  const {
    cycleOptions,
    groupedOrgOptions,
    isLoading: ddlLoading,
    error: ddlError,
  } = useDdlOptions({ rootOrganizationId: 18473 });

  const currentCycle = useMemo(
    () => cycleOptions.find((cycle) => cycle.isCurrentCycle) || cycleOptions[0],
    [cycleOptions],
  );

  const defaultOrgId = useMemo(() => {
    const hasPreferred = groupedOrgOptions.some((group) =>
      group.options.some((option) => option.organizationId === FALLBACK_ORG_ID),
    );

    if (hasPreferred) return FALLBACK_ORG_ID;
    return groupedOrgOptions[0]?.options[0]?.organizationId ?? FALLBACK_ORG_ID;
  }, [groupedOrgOptions]);

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
    const exists = groupedOrgOptions.some((group) =>
      group.options.some((option) => option.organizationId === organizationId),
    );
    if (exists) return organizationId;
    return defaultOrgId;
  }, [defaultOrgId, groupedOrgOptions, organizationId]);

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
    <ClickSpark
      sparkColor="#fff"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="flex flex-col h-svh w-full overflow-hidden bg-black text-white">
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
              className="w-full z-40 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 shrink-0 sticky top-0 shadow-2xl px-4 sm:px-8 py-3 overflow-hidden"
            >
              <div className="flex flex-col xl:flex-row items-center gap-4 justify-between">
                <div className="flex flex-col lg:flex-row items-center gap-3 w-full xl:w-auto overflow-x-auto scrollbar-hide shrink-0 pb-2 xl:pb-0">
                  <DashboardSelectors
                    cycleOptions={cycleOptions}
                    orgGroupedOptions={groupedOrgOptions}
                    selectedCycleId={resolvedAssessmentSetId}
                    onCycleChange={setAssessmentSetId}
                    selectedOrgId={resolvedOrganizationId}
                    onOrgChange={setOrganizationId}
                    disabled={loading}
                    loading={ddlLoading}
                  />
                  <div className="hidden lg:block w-px h-6 bg-white/10 mx-1" />
                  <FilterBar
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    isOverall={isOverall}
                    setIsOverall={setIsOverall}
                  />
                </div>

                <div className="shrink-0">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main className="relative flex-1 min-w-0 flex flex-col h-full bg-black overflow-y-auto scrollbar-hide">
          <motion.div
            layout
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={`bg-transparent relative z-10 flex-1 w-full ${
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
                    orgGroupedOptions={groupedOrgOptions}
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
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                {/* Rank pill — top left */}
                                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md ${config.accentBg} ${config.ring} ring-1`}>
                                  <RankIcon className={`w-3 h-3 ${config.accent}`} />
                                  <span className={`text-[11px] font-bold ${config.accent}`}>#{origIndex + 1}</span>
                                </div>

                                {/* Name overlay — bottom of photo */}
                                <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
                                  <h4 className={`${isFirst ? 'text-xl' : 'text-lg'} font-semibold text-white tracking-tight leading-tight drop-shadow-sm`}>
                                    {p.fullName}
                                  </h4>
                                </div>
                              </div>

                              {/* Stats row */}
                              <div className="px-4 py-3 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Progress</span>
                                  <span className={`text-sm font-semibold tabular-nums ${config.accent}`}>{p.avgPercent.toFixed(1)}%</span>
                                </div>
                                <div className="w-px h-7 bg-border/30 dark:bg-white/6" />
                                <div className="flex flex-col items-end">
                                  <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Check-ins</span>
                                  <span className="text-sm font-semibold text-foreground tabular-nums">{p.totalCheckIn}</span>
                                </div>
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
    </ClickSpark>
  );
}
