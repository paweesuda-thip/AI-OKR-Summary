"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { AIScoreSection } from "./ai-score-section";
import OverviewCards from "./overview-cards";
import ObjectivesSection from "./objectives-section";
import { SimpleChatbot } from "./ai-element/simple-chatbot";
import FilterBar from "./filter-bar";
import PeriodComparisonSection from "./period-comparison-section";
import ShinyText from "@/components/react-bits/ShinyText";
import MagicRings from "@/components/react-bits/MagicRings";
import { CheckInEngagement } from "@/components/check-in-engagement";
import ClickSpark from "@/components/react-bits/ClickSpark";
import { EvervaultCard } from "@/components/ui/evervault-card";

import apiService from "@/lib/services/api-service";
import {
  Objective,
  ContributorSum,
  TeamSummary,
  ParticipantDetailRaw,
} from "@/lib/types/okr";
import Image from "next/image";
import ProgressUpdateSection from "./progress-update-section";
import { FloatingAiChat } from "./floating-ai-chat";
import { ModeToggle } from "@/components/mode-toggle";

export default function Dashboard() {
  // const ASSESSMENT_SET_ID = 18892; // demo
  // const ORGANIZATION_ID = 18477; // demo
  const ASSESSMENT_SET_ID = 185467; // prod
  const ORGANIZATION_ID = 18477; // prod

  const [teamSummary, setTeamSummary] = useState<TeamSummary | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [contributors, setContributors] = useState<ContributorSum[]>([]);
  const [atRiskObjectives, setAtRiskObjectives] = useState<Objective[]>([]);

  const [participantDetails, setParticipantDetails] = useState<
    ParticipantDetailRaw[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Background removal state cache
  const [processedImages, setProcessedImages] = useState<Record<string, string>>({});

  const processImage = useCallback(async (url: string) => {
    if (!url) return;
    if (processedImages[url]) return;

    try {
      const proxyRes = await fetch(`/api/toonify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.toonifiedUrl) {
          setProcessedImages(prev => ({ ...prev, [url]: data.toonifiedUrl }));
        }
      }
    } catch (err) {
      console.error("Failed to remove background:", err);
    }
  }, [processedImages]);

  useEffect(() => {
    const topContributors =
      participantDetails.length > 0
        ? [...participantDetails]
            .sort((a, b) => a.seq - b.seq)
            .slice(0, 3)
        : [];
        
    topContributors.forEach(p => {
      const url = p.pictureMediumURL || p.pictureURL;
      if (url && !processedImages[url]) {
        processImage(url);
      }
    });
  }, [participantDetails, processImage, processedImages]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2026, 1, 12), // Feb 12, 2026
    to: new Date(2026, 2, 15), // Mar 15, 2026
  });
  const [isOverall, setIsOverall] = useState(false);

  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const dashboardData = {
    summary: teamSummary,
    objectives,
    contributors,
    atRisk: atRiskObjectives,
  };

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const dateStart = (!isOverall && dateRange?.from) ? format(dateRange.from, "yyyy-MM-dd") : undefined;
      const dateEnd = (!isOverall && dateRange?.to) ? format(dateRange.to, "yyyy-MM-dd") : undefined;

      const [result, participantResult] = await Promise.all([
        apiService.getOKRTeamDashboard({
          assessmentSetId: ASSESSMENT_SET_ID,
          organizationId: ORGANIZATION_ID,
          dateStart,
          dateEnd,
        }),
        apiService.getParticipantDetails({
          assessmentSetId: ASSESSMENT_SET_ID,
          organizationId: ORGANIZATION_ID,
          dateStart,
          dateEnd,
        }),
      ]);

      setTeamSummary(result.teamSummary);
      setObjectives(result.objectives);
      setContributors(result.contributors);
      setAtRiskObjectives(result.atRiskObjectives);
      setParticipantDetails(participantResult || []);
    } catch (err: unknown) {
      console.error("Dashboard fetch error:", err);
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          "Unable to load data. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange, isOverall]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <ClickSpark
      sparkColor="#fff"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <div className="w-full pb-12 min-h-screen">
        {/* ── Fixed Global Header ── */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-2xl transition-all duration-300">
          <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 h-20 max-w-[1600px] mx-auto gap-4">
            
            {/* Left: Branding */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-transform hover:scale-105">
                <div className="text-zinc-900 dark:text-zinc-100 font-bold text-lg leading-none tracking-tighter">S</div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                  Statio OKR
                </h1>
                <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 dark:bg-zinc-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-500 dark:bg-zinc-400"></span>
                  </span>
                  Live Dashboard
                </span>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <FilterBar
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  isOverall={isOverall}
                  setIsOverall={setIsOverall}
                />
              </div>
              
              <div className="hidden md:block h-8 w-px bg-border/50" />
              
              <div className="flex items-center gap-2">
                <ModeToggle />
              </div>
            </div>

          </div>
        </header>

        {error && (
          <div className="mx-6 sm:mx-10 mt-28 px-6 py-5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-between animate-in fade-in zoom-in duration-300 max-w-[1600px] xl:mx-auto">
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
        <main className={`relative pt-28 px-4 sm:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto ${loading ? "opacity-60 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}`}>

          {/* ── Overview Metrics Strip ── */}
          <section className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-20">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Statio OKR</h2>
            </div>
            <OverviewCards
              summary={teamSummary}
              participantDetails={participantDetails}
              objectives={objectives}
            />
          </section>

          {/* ── AI Performance Insight ── */}
          <AIScoreSection teamSummary={teamSummary} dashboardData={dashboardData} />

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
                  <div className="mb-8 flex flex-col items-center text-center relative z-20 pb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-background/50 backdrop-blur-md mb-8 shadow-sm">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-[11px] font-bold tracking-widest uppercase text-foreground">Hall of Fame</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-center items-end gap-4 max-w-5xl mx-auto px-4 mt-8">
                    {(() => {
                      // Order: 2nd, 1st, 3rd for podium layout
                      return [1, 0, 2].map((origIndex) => {
                        const p = topContributors[origIndex];
                        if (!p) return null;
                        
                        const isFirst = origIndex === 0;
                        
                        return (
                          <div 
                            key={p.employeeId || origIndex} 
                            className={`flex flex-col w-full md:w-1/3 ${
                              isFirst ? 'order-1 md:order-2 md:-translate-y-6 z-10' : 
                              origIndex === 1 ? 'order-2 md:order-1' : 
                              'order-3 md:order-3'
                            }`}
                          >
                            <div className={`relative group w-full ${isFirst ? 'h-[320px]' : 'h-[280px]'}`}>
                              {/* Card Border Container */}
                              <div className={`absolute inset-0 border border-border/40 dark:border-border/60 bg-background/40 backdrop-blur-md transition-colors duration-300 rounded-2xl ${isFirst ? 'shadow-lg ring-1 ring-black/5 dark:ring-white/10' : 'shadow-md'}`}>
                                {/* Watermark Number */}
                                <div className={`absolute top-4 right-6 font-mono text-6xl font-black italic transition-colors pointer-events-none select-none tracking-tighter z-10 opacity-75 text-foreground/80 drop-shadow-sm`}>
                                  #{origIndex + 1}
                                </div>
                              </div>

                              {/* Evervault Background Effect (constrained) */}
                              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                <EvervaultCard className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                              </div>

                              {/* Large Pop-out Image */}
                              <div 
                                className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center pointer-events-none z-10"
                                style={{ clipPath: 'inset(-100% 0 0 0 round 0 0 1rem 1rem)' }}
                              >
                                {processedImages[p.pictureMediumURL || p.pictureURL] ? (
                                  <Image 
                                    src={processedImages[p.pictureMediumURL || p.pictureURL]} 
                                    alt={p.fullName} 
                                    width={400}
                                    height={400}
                                    className={`w-auto object-contain object-bottom drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 origin-bottom ${isFirst ? 'h-[125%]' : 'h-[115%]'}`}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 text-foreground/50 animate-spin" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Info Overlay (Blurred Bottom) */}
                              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/80 to-transparent pt-16 pb-6 px-4 flex flex-col items-center text-center z-20 rounded-b-2xl pointer-events-none">
                                <h4 className={`${isFirst ? 'text-xl' : 'text-lg'} font-bold text-foreground tracking-tight mb-1`}>
                                  {p.fullName}
                                </h4>
                                <div className="text-xs font-medium text-muted-foreground">
                                  {p.totalCheckIn} Check-ins • {p.avgPercent.toFixed(1)}% Avg Progress
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
              <CheckInEngagement participantDetails={participantDetails} />
            </section>

            {/* ── Focus Areas (Unboxed) ── */}
            <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto w-full">
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
                        description="Objectives with the highest progress jumps"
                        subObjectives={topUpdates} 
                        type="top" 
                      />
                    </div>
                    <div className="bg-background/20 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-lg transition-all hover:bg-background/40 hover:border-border/50">
                      <ProgressUpdateSection 
                        title="Unpopular" 
                        description="Objectives needing more momentum"
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
              <ObjectivesSection objectives={objectives} />
            </section>
          </div>

        {/* ── Floating AI Chat ── */}
        <FloatingAiChat dashboardData={dashboardData} />
        </main>
      </div>
    </ClickSpark>
  );
}
