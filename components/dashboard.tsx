"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { AIScoreResult, AIScoreSection } from "./ai-score-section";
import FilterBar from "./filter-bar";
import MagicRings from "@/components/react-bits/MagicRings";
import ClickSpark from "@/components/react-bits/ClickSpark";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import apiService from "@/lib/services/api-service";
import {
  Objective,
  ContributorSum,
  TeamSummary,
  ParticipantDetailRaw,
  TeamFilterMode,
} from "@/lib/types/okr";
import { FloatingAiChat } from "./floating-ai-chat";

import { IconShield, IconLightning } from "@/components/icons";
import TeamToggle from "./team-toggle";
import CommandCenter from "./command-center";
import TeamArena from "./team-arena";
import HallOfFame from "./hall-of-fame";
import ObjectiveContributions from "./objective-contributions";
import MomentumSection from "./momentum-section";
import ChartsSection from "./charts-section";
import { generateSuggestions } from "@/lib/mock/suggestions";

const TEAM_ACCENT_MAP: Record<string, { color: string; rgb: string; glow: string }> = {
  overall:          { color: "#8b5cf6", rgb: "139,92,246",  glow: "#7c3aed" },
  spartan:          { color: "#ef4444", rgb: "239,68,68",   glow: "#dc2626" },
  pegasus:          { color: "#3b82f6", rgb: "59,130,246",  glow: "#2563eb" },
  unicorn:          { color: "#a855f7", rgb: "168,85,247",  glow: "#9333ea" },
  "product-owner":  { color: "#f59e0b", rgb: "245,158,11",  glow: "#d97706" },
};

export default function Dashboard() {
  const ASSESSMENT_SET_ID = 185467;
  const ORGANIZATION_ID = 18477;

  const [teamSummary, setTeamSummary] = useState<TeamSummary | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [contributors, setContributors] = useState<ContributorSum[]>([]);
  const [atRiskObjectives, setAtRiskObjectives] = useState<Objective[]>([]);
  const [participantDetails, setParticipantDetails] = useState<ParticipantDetailRaw[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2026, 1, 12),
    to: new Date(2026, 2, 15),
  });
  const [isOverall, setIsOverall] = useState(false);
  const [teamFilter, setTeamFilter] = useState<TeamFilterMode>("overall");
  const [aiScoreResult, setAiScoreResult] = useState<AIScoreResult | null>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const dashboardData = {
    summary: teamSummary,
    objectives,
    contributors,
    atRisk: atRiskObjectives,
  };

  const suggestions = generateSuggestions(teamSummary, objectives);
  const teamAccent = TEAM_ACCENT_MAP[teamFilter] || TEAM_ACCENT_MAP.overall;

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    setAiScoreResult(null);

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
      sparkColor={teamAccent.color}
      sparkSize={8}
      sparkRadius={12}
      sparkCount={6}
      duration={400}
    >
      <div
        className="w-full pb-16 min-h-screen transition-colors duration-500"
        style={{
          "--team-accent": teamAccent.color,
          "--team-accent-subtle": `rgba(${teamAccent.rgb}, 0.08)`,
          "--team-accent-glow": teamAccent.glow,
        } as React.CSSProperties}
      >
        {/* ── Fixed Header ── */}
        <header className="fixed inset-x-0 top-0 z-50 bg-black/70 backdrop-blur-2xl transition-all duration-500" style={{ borderBottom: `1px solid rgba(${teamAccent.rgb}, 0.15)` }}>
          <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 h-16 max-w-[1600px] mx-auto gap-4">
            {/* Left: Branding */}
            <div className="flex items-center gap-3 shrink-0">
              <IconShield size={24} style={{ color: teamAccent.color }} />
              <div className="flex flex-col">
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  Statio <span style={{ color: teamAccent.color }}>OKR</span>
                </h1>
                <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1.5 uppercase tracking-[0.2em]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: teamAccent.color }}></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: teamAccent.color }}></span>
                  </span>
                  Command Center
                </span>
              </div>
            </div>

            {/* Center: Team Toggle */}
            <div className="hidden lg:block">
              <TeamToggle value={teamFilter} onChange={setTeamFilter} />
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
              <div className="hidden xl:block">
                <FilterBar
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  isOverall={isOverall}
                  setIsOverall={setIsOverall}
                />
              </div>

              <div className="hidden xl:block h-6 w-px bg-border/30" />

              <Drawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button
                    className="rounded-lg cursor-pointer px-3 py-2 text-xs font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] gap-1.5"
                    style={{ backgroundColor: `rgba(${teamAccent.rgb}, 0.1)`, color: teamAccent.color, borderColor: `rgba(${teamAccent.rgb}, 0.2)`, borderWidth: 1 }}
                  >
                    <IconLightning size={14} />
                    <span className="hidden sm:inline">AI Insight</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[90vh] bg-background/95 backdrop-blur-3xl border-primary/10">
                  <div className="mx-auto w-full max-w-7xl h-full flex flex-col p-4">
                    <DrawerHeader className="shrink-0 text-center sm:text-left">
                      <DrawerTitle className="text-2xl flex items-center justify-center sm:justify-start gap-2">
                        <IconLightning size={24} className="text-primary" />
                        AI OKR Intelligence
                      </DrawerTitle>
                      <DrawerDescription>
                        Strategic insights, performance patterns, and actionable recommendations.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 overflow-y-auto mt-4 pr-2 relative">
                      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 blur-xl">
                        <MagicRings
                          color="#dc2626"
                          colorTwo="#f59e0b"
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
            </div>
          </div>
        </header>

        {/* Mobile Team Toggle */}
        <div className="lg:hidden fixed top-16 inset-x-0 z-40 bg-black/60 backdrop-blur-xl border-b border-border/20 px-4 py-2 flex justify-center">
          <TeamToggle value={teamFilter} onChange={setTeamFilter} />
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 sm:mx-8 mt-24 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between animate-in fade-in duration-300 max-w-[1600px] xl:mx-auto">
            <span className="text-sm text-destructive font-medium">{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError("")} className="text-destructive hover:bg-destructive/20 text-xs">
              Dismiss
            </Button>
          </div>
        )}

        {/* ── Main Content ── */}
        <main className={`relative pt-24 lg:pt-20 px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto ${loading ? "opacity-50 pointer-events-none" : ""} transition-opacity duration-300`}>

          {/* Section A: Command Center — Suggestion-driven KPIs */}
          <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CommandCenter summary={teamSummary} suggestions={suggestions} participantDetails={participantDetails} />
          </section>

          <div className="flex flex-col gap-12">

            {/* Section B: Team Arena */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <TeamArena teamFilter={teamFilter} teamSummary={teamSummary} contributors={contributors} />
            </section>

            {/* Section C: Hall of Fame */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <HallOfFame teamFilter={teamFilter} contributors={contributors} participantDetails={participantDetails} />
            </section>

            {/* Section D: Analytics Charts */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <ChartsSection teamFilter={teamFilter} teamSummary={teamSummary} objectives={objectives} contributors={contributors} participantDetails={participantDetails} />
            </section>

            {/* Section E: Momentum */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[400ms]">
              <MomentumSection objectives={objectives} />
            </section>

            {/* Section F: Objective Contributions */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
              <ObjectiveContributions objectives={objectives} />
            </section>

          </div>

          {/* Floating AI Chat */}
          <FloatingAiChat dashboardData={dashboardData} />
        </main>
      </div>
    </ClickSpark>
  );
}
