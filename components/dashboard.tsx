"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, AlertCircle, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import OverviewCards from "./overview-cards";
import ObjectivesSection from "./objectives-section";
import type { TopPerformersAISummary } from "./top-performers-section";
import NeedsAttentionSection from "./needs-attention-section";
import NoCheckInSection from "./no-checkin-section";
import AISummaryPanel from "./ai-summary-panel";
import FilterBar, { FilterOption } from "./filter-bar";
import AtRiskSection from "./at-risk-section";
import PeriodComparisonSection from "./period-comparison-section";
import TeamMembersSection from "./team-members-section";
import ShinyText from "@/components/react-bits/ShinyText";
import DomeGallery from "@/components/react-bits/DomeGallery";
import MagicRings from "@/components/react-bits/MagicRings";
import HoloCard from "@/components/gaia/holo-card";
import ScrollReveal from "@/components/react-bits/ScrollReveal";
import ScrollFloat from "@/components/react-bits/ScrollFloat";
import ClickSpark from "@/components/react-bits/ClickSpark";

import apiService from "@/lib/services/api-service";
import { Objective, ContributorSum, TeamSummary } from "@/lib/types/okr";

export default function Dashboard() {
  // const ASSESSMENT_SET_ID = 18892; // demo
  // const ORGANIZATION_ID = 0; // demo
  const ASSESSMENT_SET_ID = 185467; // prod
  const ORGANIZATION_ID = 18477; // prod

  const [teamSummary, setTeamSummary] = useState<TeamSummary | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [contributors, setContributors] = useState<ContributorSum[]>([]);
  const [atRiskObjectives, setAtRiskObjectives] = useState<Objective[]>([]);
  const [noCheckInEmployees, setNoCheckInEmployees] = useState<ContributorSum[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topPerformersSummary, setTopPerformersSummary] = useState<TopPerformersAISummary | null>(null);

  // Filter state
  const [selectedSet, setSelectedSet] = useState<FilterOption | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<FilterOption | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiService.getOKRTeamDashboard({
        assessmentSetId: ASSESSMENT_SET_ID,
        organizationId: ORGANIZATION_ID,
      });

      setTeamSummary(result.teamSummary);
      setObjectives(result.objectives);
      setContributors(result.contributors);
      setAtRiskObjectives(result.atRiskObjectives);
      setNoCheckInEmployees(result.noCheckInEmployees || []);
    } catch (err: unknown) {
      console.error("Dashboard fetch error:", err);
      const errorObj = err as { response?: { data?: { message?: string } }, message?: string };
      setError(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          "Unable to load data. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const dashboardData = {
    summary: teamSummary,
    objectives,
    contributors,
    atRisk: atRiskObjectives,
  };

  const heroMetrics = [
    {
      label: "Objectives",
      value: teamSummary ? `${teamSummary.completedObjectives}/${teamSummary.totalObjectives}` : "--"
    },
    {
      label: "Avg Progress",
      value: teamSummary ? `${teamSummary.avgObjectiveProgress.toFixed(1)}%` : "--"
    },
    {
      label: "Contributors",
      value: teamSummary ? `${teamSummary.totalContributors}` : "--"
    }
  ];

  const domeGalleryImages = useMemo(() => {
    if (!contributors || contributors.length === 0) {
      return Array.from({ length: 6 }).map((_, i) => ({
        src: `https://api.dicebear.com/9.x/open-peeps/svg?seed=Felix${i}`,
        alt: `Mock avatar ${i}`
      }));
    }
    
    return contributors.slice(0, 15).map(person => ({
      src: person.pictureURL || `https://api.dicebear.com/9.x/open-peeps/svg?seed=${person.fullName.replace(/\s+/g,'')}`,
      alt: person.fullName
    }));
  }, [contributors]);

  return (
    <ClickSpark
      sparkColor="#fff"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="w-full pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/40 px-6 py-8 shadow-2xl backdrop-blur-2xl sm:px-10 lg:px-12">
        {/* Inner subtle glow */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/3 to-transparent opacity-50 dark:from-white/2" />
        
        <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-foreground/80 uppercase shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              AI-Powered Performance Cockpit
            </span>

            <div className="space-y-2">
              <ShinyText
                text="Modern OKR Intelligence"
                className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
                color="var(--color-muted-foreground)"
                shineColor="var(--color-foreground)"
                speed={4}
                spread={120}
                pauseOnHover
              />
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                A redesigned command center for your team&apos;s execution rhythm. Monitor outcomes, compare momentum, and surface coaching opportunities.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:max-w-lg sm:gap-4">
              {heroMetrics.map((item) => (
                <div key={item.label} className="flex flex-col justify-center rounded-2xl border border-border/40 bg-background/40 px-4 py-3.5 shadow-sm backdrop-blur-md transition-colors hover:bg-background/60">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">{item.label}</p>
                  <p className="mt-1.5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={fetchDashboard}
                disabled={loading}
                className="rounded-full px-6 py-5 text-sm font-medium shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Refresh Dashboard
              </Button>
              
              {/* Trigger Drawer for AI Summary */}
              <Drawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button 
                    className="rounded-full px-6 py-5 text-sm font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Open AI Summary
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[90vh] bg-background/95 backdrop-blur-3xl border-border/50">
                  <div className="mx-auto w-full max-w-7xl h-full flex flex-col p-4">
                    <DrawerHeader className="shrink-0 text-center sm:text-left">
                      <DrawerTitle className="text-2xl flex items-center justify-center sm:justify-start gap-2">
                        <Sparkles className="w-6 h-6 text-primary" />
                        AI OKR Intelligence
                      </DrawerTitle>
                      <DrawerDescription>
                        Deep dive into strategic insights, team performance patterns, and actionable recommendations.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 overflow-y-auto mt-4 pr-2 relative">
                        {/* Magic Rings subtle background glow inside drawer */}
                        <div className="pointer-events-none fixed inset-0 z-0 opacity-20 dark:opacity-30 blur-xl">
                            <MagicRings
                              color="#7c3aed"
                              colorTwo="#06b6d4"
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
                            <AISummaryPanel 
                                dashboardData={dashboardData} 
                                onTopPerformersSummary={setTopPerformersSummary} 
                                forceOpen={true} // Optional prop we'll pass to force it open
                            />
                        </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>

              <p className="text-xs font-medium text-muted-foreground/70 sm:text-sm">Live sync from latest check-ins.</p>
            </div>
          </div>

          <div className="relative h-[280px] overflow-hidden rounded-3xl border border-border/30 bg-background/20 shadow-2xl ring-1 ring-white/5 sm:h-[340px]">
            <DomeGallery
              images={domeGalleryImages}
              fit={0.38}
              minRadius={540}
              maxRadius={760}
              overlayBlurColor="var(--color-background)"
              maxVerticalRotationDeg={6}
              dragSensitivity={24}
              dragDampening={1.6}
              grayscale={false}
            />
          </div>
        </div>
      </section>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mx-6 sm:mx-10 mt-8 px-6 py-5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-between animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-4 text-base text-destructive">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setError("")}
            className="text-destructive hover:text-destructive hover:bg-destructive/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center h-[60vh] animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Loading objective data...</p>
          </div>
        </div>
      ) : (
        <main className="mt-8 px-4 sm:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto">
          
          {/* Header & Global Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Team Execution</h2>
              <p className="text-muted-foreground mt-2 text-lg">Monitor momentum and surface coaching opportunities.</p>
            </div>
            
            <div className="flex-shrink-0">
              <FilterBar
                  sets={[]}
                  periods={[]}
                  employees={contributors.map((c: ContributorSum) => ({ id: c.fullName, name: c.fullName, avatar: c.fullName.charAt(0) }))}
                  selectedSet={selectedSet}
                  selectedPeriod={selectedPeriod}
                  selectedEmployeeIds={selectedEmployeeIds}
                  onSetChange={setSelectedSet}
                  onPeriodChange={setSelectedPeriod}
                  onEmployeeChange={setSelectedEmployeeIds}
              />
            </div>
          </div>

          {/* ── Overview Metrics Strip ── */}
          <section className="mb-20">
            <OverviewCards summary={teamSummary} />
          </section>

          {/* ── Main Layout: Landing Page Style ── */}
          <div className="flex flex-col gap-32">
            
            {/* ── Top Performers (HoloCard Leaderboard) ── */}
            {contributors && contributors.length > 0 && (
              <section className="relative">
                <div className="mb-16 flex flex-col items-center text-center">
                  <ScrollFloat textClassName="text-sm font-bold tracking-[0.2em] text-amber-500 uppercase mb-4">
                    Leaderboard
                  </ScrollFloat>
                  <ScrollReveal textClassName="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    Top Performers
                  </ScrollReveal>
                  <p className="mt-4 text-muted-foreground max-w-2xl text-base">
                    Recognizing the outstanding execution and consistent momentum of our leading contributors.
                  </p>
                  
                  {topPerformersSummary?.teamSummary && (
                    <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-6 max-w-3xl backdrop-blur-sm">
                      <p className="text-foreground/90 font-medium">{topPerformersSummary.teamSummary}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto px-4">
                  {contributors.slice(0, 3).map((person, i) => {
                    const badges = ["🥇 Gold Tier", "🥈 Silver Tier", "🥉 Bronze Tier"];
                    const colors = ["#fbbf24", "#94a3b8", "#b45309"];
                    const aiPersonSummary = topPerformersSummary?.rankings?.[i]?.summary;
                    
                    return (
                      <div key={person.fullName} className="w-full max-w-[320px] mx-auto">
                        <HoloCard
                          branding={{}}
                          data={{
                            name: person.fullName,
                            subtitle: `${person.avgObjectiveProgress.toFixed(1)}% Avg Progress`,
                            description: aiPersonSummary || `${person.krCount} Key Results • ${person.checkInCount} Check-ins`,
                            badge: badges[i] || `Rank #${i+1}`,
                            primaryId: person.fullName,
                            secondaryInfo: `Check-ins: ${person.checkInCount}`,
                            overlayColor: colors[i] || "#ffffff",
                            overlayOpacity: 15,
                            backgroundImage: person.pictureURL || `https://picsum.photos/seed/${person.fullName.replace(/\s+/g,'')}/400/600`
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Momentum / Period Comparison ── */}
            <section className="relative">
              <div className="mb-12 flex flex-col items-center text-center">
                <ScrollFloat textClassName="text-sm font-bold tracking-[0.2em] text-blue-500 uppercase mb-2">
                  Momentum
                </ScrollFloat>
                <ScrollReveal textClassName="text-3xl md:text-4xl font-bold text-foreground">
                  Period Comparison
                </ScrollReveal>
              </div>
              <div className="max-w-6xl mx-auto px-4 w-full">
                <PeriodComparisonSection comparison={{
                    currentCompletionRate: teamSummary?.objectiveCompletionRate || 0,
                    previousCompletionRate: (teamSummary?.objectiveCompletionRate || 0) - 5,
                    completionRateDelta: 5,
                    currentAvgProgress: teamSummary?.avgObjectiveProgress || 0,
                    previousAvgProgress: (teamSummary?.avgObjectiveProgress || 0) - 8,
                    avgProgressDelta: 8,
                    currentCheckInCount: teamSummary?.totalKRs || 0,
                    previousCheckInCount: (teamSummary?.totalKRs || 0) - 12,
                    checkInCountDelta: 12,
                    progressTrend: 'Upward trend observed mostly in engineering teams',
                    engagementTrend: 'Consistent weekly check-ins maintained',
                }} />
              </div>
            </section>

            {/* ── Focus Areas (Unboxed) ── */}
            <section className="relative">
              <div className="mb-12 flex flex-col items-center text-center">
                <ScrollFloat textClassName="text-sm font-bold tracking-[0.2em] text-rose-500 uppercase mb-2">
                  Risk Analysis
                </ScrollFloat>
                <ScrollReveal textClassName="text-3xl md:text-4xl font-bold text-foreground">
                  Focus Areas
                </ScrollReveal>
                <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
                  Identify roadblocks and objectives that require immediate attention to maintain momentum.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 w-full">
                <div className="bg-background/20 backdrop-blur-xl border border-border/30 rounded-4xl p-8 shadow-xl transition-all hover:bg-background/40 hover:border-border/50">
                  <NeedsAttentionSection contributors={contributors} />
                </div>
                <div className="bg-background/20 backdrop-blur-xl border border-border/30 rounded-4xl p-8 shadow-xl transition-all hover:bg-background/40 hover:border-border/50">
                  <AtRiskSection atRiskObjectives={atRiskObjectives} />
                </div>
              </div>
            </section>

            {/* ── Team Directory ── */}
            {(contributors.length > 3 || noCheckInEmployees.length > 0) && (
              <section className="relative">
                <div className="mb-12 flex flex-col items-center text-center">
                  <ScrollFloat textClassName="text-sm font-bold tracking-[0.2em] text-emerald-500 uppercase mb-2">
                    Directory
                  </ScrollFloat>
                  <ScrollReveal textClassName="text-3xl md:text-4xl font-bold text-foreground">
                    Team Members
                  </ScrollReveal>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 w-full">
                  {contributors.length > 3 && (
                    <div className="bg-background/20 backdrop-blur-xl border border-border/30 rounded-4xl p-8 shadow-xl transition-all hover:bg-background/40 hover:border-border/50">
                      <TeamMembersSection teamMembers={contributors.slice(3).map((c: ContributorSum) => ({
                          employeeId: c.fullName,
                          employeeName: c.fullName,
                          picture: c.pictureURL,
                          employeeStatus: 1,
                          positionName: 'Contributor'
                      }))} />
                    </div>
                  )}
                  {noCheckInEmployees.length > 0 && (
                    <div className={`bg-background/20 backdrop-blur-xl border border-border/30 rounded-4xl p-8 shadow-xl transition-all hover:bg-background/40 hover:border-border/50 ${contributors.length <= 3 ? 'lg:col-span-2' : ''}`}>
                      <NoCheckInSection noCheckInEmployees={noCheckInEmployees} />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Objectives ── */}
            <section className="relative pb-12">
               <div className="mb-12 flex flex-col items-center text-center">
                  <ScrollFloat textClassName="text-sm font-bold tracking-[0.2em] text-indigo-500 uppercase mb-2">
                    Execution
                  </ScrollFloat>
                  <ScrollReveal textClassName="text-3xl md:text-4xl font-bold text-foreground">
                    All Objectives
                  </ScrollReveal>
               </div>
               <div className="max-w-7xl mx-auto px-4 w-full">
                 <ObjectivesSection objectives={objectives} />
               </div>
            </section>
          </div>
        </main>
      )}
      </div>
    </ClickSpark>
  );
}
