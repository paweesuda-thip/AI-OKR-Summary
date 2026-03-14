"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  Target,
  CopyCheck,
  TrendingUp,
  Users,
  CheckCircle2,
  Crown,
  Medal,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

import OverviewCards from "./overview-cards";
import ObjectivesSection from "./objectives-section";
import type { TopPerformersAISummary } from "./top-performers-section";
import NeedsAttentionSection from "./needs-attention-section";
import AISummaryPanel from "./ai-summary-panel";
import FilterBar from "./filter-bar";
import AtRiskSection from "./at-risk-section";
import PeriodComparisonSection from "./period-comparison-section";
import ShinyText from "@/components/react-bits/ShinyText";
import CardSwap, { Card } from "@/components/react-bits/CardSwap";
import MagicRings from "@/components/react-bits/MagicRings";
import { CheckInEngagement } from "@/components/check-in-engagement";
import ClickSpark from "@/components/react-bits/ClickSpark";

import apiService from "@/lib/services/api-service";
import {
  Objective,
  ContributorSum,
  TeamSummary,
  ParticipantDetailRaw,
} from "@/lib/types/okr";
import HoloCard from "./gaia/holo-card";

// Wrapper component to handle background removal for each person
function ToonifiedHoloCard({
  person,
  rank,
  color,
  badge,
  defaultImage,
  aiSummary,
}: {
  person: ParticipantDetailRaw;
  rank: number;
  color: string;
  badge: React.ReactNode;
  defaultImage: string;
  aiSummary?: string;
}) {
  const [imageUrl, setImageUrl] = useState<string>(defaultImage);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const CACHE_PREFIX = "bg_removed_v1_";

    function getCacheKey(url: string) {
      // Simple hash to avoid key collision on similar URLs
      let hash = 0;
      for (let i = 0; i < url.length; i++) {
        hash = ((hash << 5) - hash) + url.charCodeAt(i);
        hash = hash & hash;
      }
      return CACHE_PREFIX + Math.abs(hash).toString(36);
    }

    function loadFromCache(url: string): string | null {
      try { return localStorage.getItem(getCacheKey(url)); }
      catch { return null; }
    }

    function saveToCache(url: string, base64: string) {
      try {
        localStorage.setItem(getCacheKey(url), base64);
      } catch {
        // localStorage full — evict old bg cache and retry
        Object.keys(localStorage)
          .filter(k => k.startsWith(CACHE_PREFIX))
          .forEach(k => localStorage.removeItem(k));
        try { localStorage.setItem(getCacheKey(url), base64); } catch { /* ignore */ }
      }
    }

    async function processImage() {
      if (!defaultImage) return;

      // ✅ Cache hit — same top performer as before, skip generation
      const cached = loadFromCache(defaultImage);
      if (cached) {
        setImageUrl(cached);
        return;
      }

      setIsProcessing(true);
      try {
        // Fetch image via server to bypass CORS, then remove background client-side
        const proxyRes = await fetch(`/api/toonify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: defaultImage }),
        });

        if (proxyRes.ok) {
          const data = await proxyRes.json();
          if (data.toonifiedUrl) {
            saveToCache(defaultImage, data.toonifiedUrl);
            setImageUrl(data.toonifiedUrl);
          }
        }
      } catch (err) {
        console.error("Failed to remove background:", err);
      } finally {
        setIsProcessing(false);
      }
    }

    processImage();
  }, [defaultImage]);

  return (
    <div className="w-full max-w-[320px] mx-auto relative">
      {isProcessing && (
        <div className="absolute top-4 right-4 z-50 bg-black/50 backdrop-blur-md rounded-full p-2 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-white animate-spin" />
          <span className="text-xs text-white font-medium">Toonifying...</span>
        </div>
      )}
      <HoloCard
        branding={{}}
        data={{
          name: person.fullName,
          subtitle: `${person.avgPercent.toFixed(1)}% Avg Progress`,
          description: aiSummary || `${person.totalCheckInAll} Check-ins`,
          badge: badge || (
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" /> Rank #{rank}
            </div>
          ),
          primaryId: String(person.employeeId),
          secondaryInfo: `Check-ins: ${person.totalCheckIn}`,
          overlayColor: color || "#ffffff",
          overlayOpacity: 15,
          personImage: imageUrl,
          backgroundImage: rank === 1
            ? "/top1-2.png" // Epic Gold/Space
            : rank === 2
            ? "/top2-2.png" // Cool Blue/Silver Nebula
            : "/top3-2.png", // Warm Bronze/Orange Space
        }}
      />
    </div>
  );
}

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
  const [topPerformersSummary, setTopPerformersSummary] =
    useState<TopPerformersAISummary | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2026, 1, 12), // Feb 12, 2026
    to: new Date(2026, 2, 15), // Mar 15, 2026
  });

  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [result, participantResult] = await Promise.all([
        apiService.getOKRTeamDashboard({
          assessmentSetId: ASSESSMENT_SET_ID,
          organizationId: ORGANIZATION_ID,
        }),
        apiService.getParticipantDetails({
          assessmentSetId: ASSESSMENT_SET_ID,
          organizationId: ORGANIZATION_ID,
          dateStart: dateRange?.from
            ? format(dateRange.from, "yyyy-MM-dd")
            : undefined,
          dateEnd: dateRange?.to
            ? format(dateRange.to, "yyyy-MM-dd")
            : undefined,
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
  }, [dateRange]);

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
      value: teamSummary
        ? `${teamSummary.completedObjectives}/${teamSummary.totalObjectives}`
        : "--",
    },
    {
      label: "Avg Progress",
      value: teamSummary
        ? `${teamSummary.avgObjectiveProgress.toFixed(1)}%`
        : "--",
    },
    {
      label: "Contributors",
      value: teamSummary ? `${teamSummary.totalContributors}` : "--",
    },
  ];

  const overviewCardsData = useMemo(() => {
    if (!teamSummary) return [];
    return [
      {
        label: "Objectives",
        value: `${teamSummary.completedObjectives}/${teamSummary.totalObjectives}`,
        sub: `Completion rate ${teamSummary.objectiveCompletionRate?.toFixed(1)}%`,
        colorKey: "indigo",
        Icon: Target,
        colors: {
          bg: "bg-primary/5",
          border: "border-primary/20",
          icon: "text-primary",
          iconBg: "bg-primary/10",
          value: "text-primary",
        },
      },
      {
        label: "Key Results",
        value: `${teamSummary.completedKRs}/${teamSummary.totalKRs}`,
        sub: `Completion rate ${teamSummary.krCompletionRate?.toFixed(1)}%`,
        colorKey: "emerald",
        Icon: CopyCheck,
        colors: {
          bg: "bg-emerald-500/5",
          border: "border-emerald-500/20",
          icon: "text-emerald-600 dark:text-emerald-400",
          iconBg: "bg-emerald-500/10",
          value: "text-emerald-600 dark:text-emerald-400",
        },
      },
      {
        label: "Avg Progress",
        value: `${teamSummary.avgObjectiveProgress?.toFixed(1)}%`,
        sub: "Current cycle average",
        colorKey: "amber",
        Icon: TrendingUp,
        colors: {
          bg: "bg-amber-500/5",
          border: "border-amber-500/20",
          icon: "text-amber-600 dark:text-amber-400",
          iconBg: "bg-amber-500/10",
          value: "text-amber-600 dark:text-amber-400",
        },
      },
      {
        label: "Contributors",
        value: teamSummary.totalContributors,
        sub: "Unique people with KR activity",
        colorKey: "sky",
        Icon: Users,
        colors: {
          bg: "bg-sky-500/5",
          border: "border-sky-500/20",
          icon: "text-sky-600 dark:text-sky-400",
          iconBg: "bg-sky-500/10",
          value: "text-sky-600 dark:text-sky-400",
        },
      },
      {
        label: "On Track",
        value: teamSummary.onTrackCount,
        sub: `Out of ${teamSummary.totalObjectives} total objectives`,
        colorKey: "rose",
        Icon: CheckCircle2,
        colors: {
          bg: "bg-rose-500/5",
          border: "border-rose-500/20",
          icon: "text-rose-600 dark:text-rose-400",
          iconBg: "bg-rose-500/10",
          value: "text-rose-600 dark:text-rose-400",
        },
      },
    ];
  }, [teamSummary]);

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
                  A redesigned command center for your team&apos;s execution
                  rhythm. Monitor outcomes, compare momentum, and surface
                  coaching opportunities.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:max-w-lg sm:gap-4">
                {heroMetrics.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col justify-center rounded-2xl border border-border/40 bg-background/40 px-4 py-3.5 shadow-sm backdrop-blur-md transition-colors hover:bg-background/60"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={fetchDashboard}
                  disabled={loading}
                  className="rounded-full px-6 py-5 text-sm font-medium shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Refresh Dashboard
                </Button>

                {/* Trigger Drawer for AI Summary */}
                <Drawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button className="rounded-full px-6 py-5 text-sm font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 gap-2">
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
                          Deep dive into strategic insights, team performance
                          patterns, and actionable recommendations.
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

                <p className="text-xs font-medium text-muted-foreground/70 sm:text-sm">
                  Live sync from latest check-ins.
                </p>
              </div>
            </div>

            <div className="relative h-[320px] sm:h-[420px] flex items-center justify-end w-full">
              {overviewCardsData.length > 0 ? (
                <div className="absolute -right-6 sm:-right-10 lg:-right-12 flex items-center justify-end scale-75 sm:scale-90 lg:scale-100 origin-right [&_.card-swap-container]:relative! [&_.card-swap-container]:transform-none! [&_.card-swap-container]:bottom-auto! [&_.card-swap-container]:right-auto!">
                  <CardSwap
                    pauseOnHover={true}
                    cardDistance={50}
                    verticalDistance={50}
                    skewAmount={4}
                    width={400}
                    height={250}
                  >
                    {overviewCardsData.map((stat, i) => {
                      const { Icon, colors } = stat;
                      const glowBg = colors.iconBg.split("/")[0]; // Extract base background color for glow

                      return (
                        <Card
                          key={i}
                          className="group relative overflow-hidden w-[400px] h-[250px] p-8 flex flex-col justify-between rounded-4xl border border-white/10 bg-zinc-950/80 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-3xl"
                        >
                          {/* Subtle Grid Background */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                          {/* Ambient Glows */}
                          <div
                            className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[80px] opacity-30 ${glowBg} pointer-events-none transition-opacity duration-500 group-hover:opacity-50`}
                          />
                          <div
                            className={`absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 ${glowBg} pointer-events-none transition-opacity duration-500 group-hover:opacity-40`}
                          />

                          {/* Inner Border Refinement */}
                          <div className="absolute inset-0 rounded-4xl border border-white/5 pointer-events-none mix-blend-overlay" />

                          {/* Card Content */}
                          <div className="relative z-10 flex items-start justify-between">
                            <span className="text-lg font-bold text-white/80 uppercase tracking-widest drop-shadow-sm">
                              {stat.label}
                            </span>
                            <div
                              className={`relative w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] ${colors.iconBg} ${colors.icon} backdrop-blur-md overflow-hidden transition-transform duration-300 group-hover:scale-110`}
                            >
                              <div
                                className={`absolute inset-0 opacity-20 ${glowBg}`}
                              />
                              <Icon className="w-7 h-7 relative z-10 drop-shadow-md" />
                            </div>
                          </div>

                          <div className="relative z-10">
                            <div
                              className={`text-7xl font-black leading-none tracking-tighter mb-4 ${colors.value} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                            >
                              {stat.value}
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-2 h-2 rounded-full ${glowBg} shadow-[0_0_8px_currentColor] animate-pulse`}
                              />
                              <p className="text-base text-white/60 font-medium leading-snug tracking-wide">
                                {stat.sub}
                              </p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </CardSwap>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                  <p className="text-sm font-medium">Loading metrics...</p>
                </div>
              )}
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
              <p className="text-muted-foreground font-medium">
                Loading objective data...
              </p>
            </div>
          </div>
        ) : (
          <main className="mt-8 px-4 sm:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto">
            {/* Header & Global Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  Team Execution
                </h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Monitor momentum and surface coaching opportunities.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-4 flex-wrap">
                <FilterBar
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                />
              </div>
            </div>

            {/* ── Overview Metrics Strip ── */}
            <section className="mb-20">
              <OverviewCards
                summary={teamSummary}
                participantDetails={participantDetails}
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
                    : [];

                if (topContributors.length === 0) return null;

                return (
                  <section className="relative">
                    <div className="mb-10 flex flex-col items-center text-center">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        <h3 className="text-xl md:text-2xl font-bold text-foreground">
                          Top Performers
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm max-w-2xl">
                        Recognizing the outstanding execution and consistent
                        momentum of our leading contributors.
                      </p>

                      {topPerformersSummary?.teamSummary && (
                        <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4 max-w-3xl backdrop-blur-sm">
                          <p className="text-foreground/90 text-sm font-medium">
                            {topPerformersSummary.teamSummary}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto px-4 md:items-end">
                      {(() => {
                        const badges = [
                          <div key="gold" className="flex items-center gap-1 font-sans font-bold text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            <Crown className="w-4 h-4 text-amber-300 drop-shadow" /> Gold Tier
                          </div>,
                          <div key="silver" className="flex items-center gap-1 font-sans font-bold text-slate-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            <Medal className="w-4 h-4 text-slate-200 drop-shadow" /> Silver Tier
                          </div>,
                          <div key="bronze" className="flex items-center gap-1 font-sans font-bold text-orange-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            <Award className="w-4 h-4 text-orange-300 drop-shadow" /> Bronze Tier
                          </div>,
                        ];
                        const colors = ["#fbbf24", "#94a3b8", "#b45309"];
                        // Podium order: 2nd left, 1st center, 3rd right
                        return [1, 0, 2].map((origIndex) => {
                          const p = topContributors[origIndex];
                          if (!p) return null;
                          const isFirst = origIndex === 0;
                          const aiPersonSummary = topPerformersSummary?.rankings?.[origIndex]?.summary;
                          return (
                            <div
                              key={p.employeeId || origIndex}
                              className={
                                origIndex === 0
                                  // Gold: mobile=1st, desktop=center(2nd)
                                  ? "order-1 md:order-2 flex flex-col items-center md:scale-[1.1] md:z-10 relative"
                                  : origIndex === 1
                                  // Silver: mobile=2nd, desktop=left(1st)
                                  ? "order-2 md:order-1 flex flex-col items-center md:mt-10 md:opacity-90"
                                  // Bronze: mobile=3rd, desktop=right(3rd)
                                  : "order-3 md:order-3 flex flex-col items-center md:mt-10 md:opacity-90"
                              }
                            >
                              {isFirst && (
                                <div className="mb-2 text-amber-400 font-bold text-sm tracking-widest uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                                  ★ #1 Champion ★
                                </div>
                              )}
                              <ToonifiedHoloCard
                                person={p}
                                rank={p.seq}
                                color={colors[origIndex]}
                                badge={badges[origIndex]}
                                defaultImage={p.pictureMediumURL || p.pictureURL}
                                aiSummary={aiPersonSummary}
                              />
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
                <div className="bg-background/20 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-lg transition-all hover:bg-background/40 hover:border-border/50">
                  <NeedsAttentionSection contributors={contributors} />
                </div>
                <div className="bg-background/20 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-lg transition-all hover:bg-background/40 hover:border-border/50">
                  <AtRiskSection atRiskObjectives={atRiskObjectives} />
                </div>
              </section>

              {/* ── Period Comparison ── */}
              <section className="relative bg-background/20 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-lg max-w-7xl mx-auto w-full">
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
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-xl font-bold text-foreground">
                    All Objectives
                  </h3>
                </div>
                <ObjectivesSection objectives={objectives} />
              </section>
            </div>
          </main>
        )}
      </div>
    </ClickSpark>
  );
}
