"use client";

import { useState, useEffect, useCallback } from "react";
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
import TopPerformersSection from "./top-performers-section";
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

import apiService from "@/lib/services/api-service";
import { Objective, ContributorSum, TeamSummary } from "@/lib/types/okr";

const HERO_GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    alt: "Team collaboration"
  },
  {
    src: "https://images.unsplash.com/photo-1551281044-8b5bd36f7ea3?auto=format&fit=crop&w=1200&q=80",
    alt: "Dashboard analytics"
  },
  {
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    alt: "Executive strategy meeting"
  },
  {
    src: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1200&q=80",
    alt: "Product roadmap planning"
  },
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    alt: "Business insights visualization"
  },
  {
    src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80",
    alt: "Performance review"
  }
];

export default function Dashboard() {
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

  return (
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
              images={HERO_GALLERY_IMAGES}
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
        <main className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* ── Floating Filter Bar ── */}
          <div className="sticky top-20 z-30 mb-8">
            <div className="rounded-2xl border border-border/40 bg-background/60 p-1.5 shadow-2xl backdrop-blur-2xl">
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
          <section className="mb-8">
            <OverviewCards summary={teamSummary} />
          </section>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
            {/* Period Comparison - Spans full width on sm, 2 cols on lg */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
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

            {/* Top Performers */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1">
              <TopPerformersSection 
                  contributors={contributors} 
                  aiSummary={topPerformersSummary} 
                  aiLoading={false} 
              />
            </div>

            {/* Needs Attention */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1">
              <NeedsAttentionSection contributors={contributors} />
            </div>

            {/* At Risk Section */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <AtRiskSection atRiskObjectives={atRiskObjectives} />
            </div>

            {/* Team Members */}
            <div className="col-span-1 md:col-span-1 lg:col-span-1">
              <TeamMembersSection teamMembers={contributors.map((c: ContributorSum) => ({
                  employeeId: c.fullName,
                  employeeName: c.fullName,
                  picture: c.pictureURL,
                  employeeStatus: 1,
                  positionName: 'Contributor'
              }))} />
            </div>

            {/* No Check-in */}
            <div className="col-span-1 md:col-span-1 lg:col-span-2">
              <NoCheckInSection noCheckInEmployees={noCheckInEmployees} />
            </div>

            {/* ─── Full-width Bottom: Objectives ─── */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <ObjectivesSection objectives={objectives} />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
