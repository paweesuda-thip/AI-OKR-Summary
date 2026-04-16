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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { AIScoreResult } from "./ai-score-section";
import OverviewCards from "./overview-cards";
import ObjectivesSection from "./objectives-section";
import PeriodComparisonSection from "./period-comparison-section";
import { CheckInEngagement } from "@/components/check-in-engagement";
import ClickSpark from "@/components/react-bits/ClickSpark";
import Image from "next/image";

import type {
  ParticipantDetailRaw,
} from "@/lib/types/okr";
import ProgressUpdateSection from "./progress-update-section";
import { FloatingAiChat } from "./floating-ai-chat";
import VersusMode from "./versus-mode";
import { getCycleOptions, getGroupedOrgOptions } from "@/lib/utils/org-leaf";
import DashboardTopbar from "./dashboard-topbar";
import DashboardSelectors from "./dashboard-selectors";
import FilterBar from "./filter-bar";
import { useDashboardQuery } from "@/hooks/queries/use-dashboard-query";
import { useParticipantQuery } from "@/hooks/queries/use-participant-query";

export default function Dashboard() {
  // ── Selectors ──────────────────────────────────────────────────────────────
  const cycleOptions = getCycleOptions();
  const currentCycle = cycleOptions.find(c => c.isCurrentCycle) || cycleOptions[0];

  const groupedOrgOptions = getGroupedOrgOptions({ rootOrganizationId: 18473 });
  let defaultOrgId = 18477;
  const hasDefaultOrg = groupedOrgOptions.some(g => g.options.some(o => o.organizationId === 18477));
  if (!hasDefaultOrg && groupedOrgOptions.length > 0 && groupedOrgOptions[0].options.length > 0) {
    defaultOrgId = groupedOrgOptions[0].options[0].organizationId;
  }

  const [assessmentSetId, setAssessmentSetId] = useState(currentCycle?.setId || 185467);
  const [organizationId, setOrganizationId] = useState(defaultOrgId);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2026, 1, 12), // Feb 12, 2026
    to: new Date(2026, 2, 15),   // Mar 15, 2026
  });
  const [isOverall, setIsOverall] = useState(true);

  // ── UI State ───────────────────────────────────────────────────────────────
  const [aiScoreResult, setAiScoreResult] = useState<AIScoreResult | null>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'versus'>('overview');

  // ── Derived query params ───────────────────────────────────────────────────
  const queryParams = useMemo(() => ({
    assessmentSetId,
    organizationId,
    dateStart: (!isOverall && dateRange?.from) ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    dateEnd: (!isOverall && dateRange?.to) ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  }), [assessmentSetId, organizationId, isOverall, dateRange]);

  // ── TanStack Query ─────────────────────────────────────────────────────────
  const {
    data: dashboardResult,
    isLoading: dashLoading,
    error: dashError,
  } = useDashboardQuery(queryParams);

  const {
    data: participantDetails = [],
    isLoading: partLoading,
  } = useParticipantQuery(queryParams);

  // ── Derived data ───────────────────────────────────────────────────────────
  const loading = dashLoading || partLoading;
  const errorMessage = dashError?.message || "";

  const teamSummary = dashboardResult?.teamSummary ?? null;
  const objectives = dashboardResult?.objectives ?? [];
  const contributors = dashboardResult?.contributors ?? [];
  const atRiskObjectives = dashboardResult?.atRiskObjectives ?? [];

  const dashboardData = {
    summary: teamSummary,
    objectives,
    contributors,
    atRisk: atRiskObjectives,
  };

  const selectedCycle = useMemo(() => cycleOptions.find(c => c.setId === assessmentSetId), [cycleOptions, assessmentSetId]);

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
          aiDrawerOpen={aiDrawerOpen}
          setAiDrawerOpen={setAiDrawerOpen}
          teamSummary={teamSummary}
          dashboardData={dashboardData}
          aiScoreResult={aiScoreResult}
          setAiScoreResult={setAiScoreResult}
        />

        {/* ── Control Strip & Tab Switcher ── */}
        <div className="w-full z-40 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 shrink-0 sticky top-0 shadow-2xl px-4 sm:px-8 py-3 flex flex-col xl:flex-row items-center justify-between gap-4">
          
          {/* Settings / Controls */}
          <div className="flex flex-col lg:flex-row items-center gap-3 w-full xl:w-auto overflow-x-auto scrollbar-hide shrink-0 pb-2 xl:pb-0">
            <DashboardSelectors
              selectedCycleId={assessmentSetId}
              onCycleChange={setAssessmentSetId}
              selectedOrgId={organizationId}
              onOrgChange={setOrganizationId}
              disabled={loading}
            />
            <div className="hidden lg:block w-px h-6 bg-white/10 mx-1" />
            <FilterBar
              dateRange={dateRange}
              setDateRange={setDateRange}
              isOverall={isOverall}
              setIsOverall={setIsOverall}
            />
          </div>

          {/* Sleek Glass Tab Switcher */}
          <div className="bg-[#0a0a0c] border border-white/5 p-1 rounded-full flex items-center shadow-inner relative shrink-0">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`relative px-6 py-2 text-[10px] sm:text-[11px] font-bold font-sans tracking-[0.2em] uppercase transition-colors rounded-full outline-none ${activeTab === 'overview' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {activeTab === 'overview' && <motion.div layoutId="dashboard-tab-bg" className="absolute inset-0 bg-zinc-800/80 rounded-full shadow-[inset_0_1px_rgba(255,255,255,0.1)]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              <span className="relative z-10 transition-colors">Overall</span>
            </button>
            <button 
              onClick={() => setActiveTab('versus')} 
              className={`group relative px-6 py-2 text-[10px] sm:text-[11px] font-bold font-sans tracking-[0.2em] uppercase transition-colors rounded-full outline-none flex items-center gap-2 ${activeTab === 'versus' ? 'text-fuchsia-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {activeTab === 'versus' && (
                <motion.div
                  layoutId="dashboard-tab-bg"
                  className="absolute right-0 bottom-0 w-full h-full rounded-full overflow-hidden"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-fuchsia-500/25 to-cyan-500/20" />
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 to-cyan-400/20 blur-xl group-hover:from-rose-400/40 group-hover:to-cyan-400/40 transition-colors duration-500" />
                  <div className="absolute inset-0 rounded-full border border-fuchsia-400/35 shadow-[inset_0_1px_rgba(255,255,255,0.12),0_0_18px_rgba(217,70,239,0.16)]" />
                </motion.div>
              )}
              <span className="relative z-10 flex items-center gap-2 transition-colors">
                <Swords className={`w-3.5 h-3.5 ${activeTab === 'versus' ? 'text-fuchsia-300' : 'text-cyan-500/70'}`} />
                Statio Battles
              </span>
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <main className="relative flex-1 min-w-0 flex flex-col h-full bg-black overflow-y-auto scrollbar-hide">
          <div className={`bg-transparent relative z-10 flex-1 pb-12 pt-6 px-4 sm:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-[1920px] mx-auto w-full ${loading ? "opacity-60 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}`}>

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

            {activeTab === 'versus' ? (
                <div className="w-full max-w-7xl mx-auto py-4">
                   <VersusMode />
                </div>
            ) : (
              <>

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
            {(() => {
              const topContributors =
                participantDetails.length > 0
                  ? [...participantDetails]
                      .sort((a, b) => a.seq - b.seq)
                      .slice(0, 3)
                  : loading ? [
                      { employeeId: 'skel-1', fullName: '...', totalCheckIn: 0, avgPercent: 0, pictureURL: '' } as unknown as ParticipantDetailRaw,
                      { employeeId: 'skel-2', fullName: '...', totalCheckIn: 0, avgPercent: 0, pictureURL: '' } as unknown as ParticipantDetailRaw,
                      { employeeId: 'skel-3', fullName: '...', totalCheckIn: 0, avgPercent: 0, pictureURL: '' } as unknown as ParticipantDetailRaw
                    ] : [];

              if (topContributors.length === 0) return null;

              return (
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
              );
            })()}

            {/* ── Check-In Engagement (Top/Bottom Check-ins) ── */}
            <section className="relative max-w-7xl mx-auto w-full">
              <CheckInEngagement participantDetails={participantDetails} showStatus={showStatus} />
            </section>

            {/* ── Focus Areas (Unboxed) ── */}
            <section className="relative grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto w-full">
              {(() => {
                const allSubObjectives = objectives.flatMap(o => o.subObjectives || []);

                // Filter and sort for Top 3 (Highest positive progress updates)
                const topUpdates = [...allSubObjectives]
                  .filter(sub => sub.objectiveOwnerType === 1 && (sub.progressUpdate || 0) > 0)
                  .sort((a, b) => (b.progressUpdate || 0) - (a.progressUpdate || 0))
                  .slice(0, 3);

                // Filter and sort for Bottom 3 (Lowest/Negative progress updates)
                const bottomUpdates = [...allSubObjectives]
                  .filter(sub => sub.objectiveOwnerType === 1)
                  .sort((a, b) => (a.progressUpdate || 0) - (b.progressUpdate || 0))
                  .slice(0, 3);

                return (
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
                );
              })()}
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
              </>
            )}
            </div>
        </main>
      </div>
    </ClickSpark>
  );
}
