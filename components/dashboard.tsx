"use client";

import { useState, useEffect, useCallback } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { AIScoreResult, AIScoreSection } from "./ai-score-section";
import FilterBar from "./filter-bar";
import SuggestionsPanel from "./suggestions-panel";
import TeamComparison from "./team-comparison";
import HallOfFame from "./hall-of-fame";
import ContributionMatrix from "./contribution-matrix";
import { FloatingAiChat } from "./floating-ai-chat";

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
} from "@/lib/types/okr";

// ── Inline SVG Icons ──────────────────────────────────────
const SpartanShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z"
      fill="url(#spartan-grad)"
      fillOpacity="0.15"
      stroke="url(#spartan-grad)"
      strokeWidth="1.5"
    />
    <path d="M12 6v6l4 2" stroke="url(#spartan-grad)" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="spartan-grad" x1="3" y1="2" x2="21" y2="22">
        <stop stopColor="#F7931A" />
        <stop offset="1" stopColor="#FFD600" />
      </linearGradient>
    </defs>
  </svg>
);

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);

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
  const [aiScoreResult, setAiScoreResult] = useState<AIScoreResult | null>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  // Active navigation section
  const [activeSection, setActiveSection] = useState("suggestions");

  const dashboardData = {
    summary: teamSummary,
    objectives,
    contributors,
    atRisk: atRiskObjectives,
  };

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
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "Unable to load data. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange, isOverall]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Nav items
  const navItems = [
    { id: "suggestions", label: "Strategic" },
    { id: "teams", label: "Teams" },
    { id: "hall-of-fame", label: "Hall of Fame" },
    { id: "objectives", label: "Objectives" },
  ];

  return (
    <div className="w-full pb-12 min-h-screen">
      {/* ═══ SPARTAN HEADER ═══ */}
      <header className="fixed inset-x-0 top-0 z-50 glass border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 h-16 max-w-[1600px] mx-auto gap-4">

          {/* Left: Spartan Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <SpartanShield />
            <div className="flex flex-col">
              <h1 className="text-lg leading-none font-heading font-bold tracking-tight">
                <span className="text-gradient-spartan">SPARTAN</span>
                <span className="text-white/40 font-normal ml-1.5">OKR</span>
              </h1>
              <span className="text-[10px] font-mono text-[#94A3B8] flex items-center gap-1.5 tracking-widest uppercase mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                LIVE
              </span>
            </div>
          </div>

          {/* Center: Section Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full px-1 py-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  document.getElementById(`section-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`text-xs font-mono font-semibold px-4 py-1.5 rounded-full transition-all ${
                  activeSection === item.id
                    ? "bg-[#F7931A]/10 text-[#F7931A] border border-[#F7931A]/20"
                    : "text-[#94A3B8] hover:text-white border border-transparent"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* AI Insight Button */}
            <Drawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen}>
              <DrawerTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-semibold bg-[#F7931A]/10 text-[#F7931A] border border-[#F7931A]/20 hover:bg-[#F7931A]/15 hover:shadow-[0_0_20px_-5px_rgba(247,147,26,0.4)] transition-all">
                  <SparkleIcon />
                  <span className="hidden sm:inline">AI Insight</span>
                </button>
              </DrawerTrigger>
              <DrawerContent className="h-[90vh] bg-[#0F1115]/95 backdrop-blur-3xl border-white/[0.06]">
                <div className="mx-auto w-full max-w-7xl h-full flex flex-col p-4">
                  <DrawerHeader className="shrink-0 text-center sm:text-left">
                    <DrawerTitle className="text-2xl font-heading text-gradient-spartan flex items-center justify-center sm:justify-start gap-2">
                      <SparkleIcon />
                      AI OKR Intelligence
                    </DrawerTitle>
                    <DrawerDescription className="text-[#94A3B8]">
                      Deep dive into strategic insights, team performance patterns, and actionable recommendations.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="flex-1 overflow-y-auto mt-4 pr-2 relative z-10">
                    <AIScoreSection
                      teamSummary={teamSummary}
                      dashboardData={dashboardData}
                      aiScoreResult={aiScoreResult}
                      onAiScoreResultChange={setAiScoreResult}
                    />
                  </div>
                </div>
              </DrawerContent>
            </Drawer>

            <div className="hidden xl:block h-8 w-px bg-white/[0.06]" />

            {/* Date Filter */}
            <div className="hidden xl:block">
              <FilterBar
                dateRange={dateRange}
                setDateRange={setDateRange}
                isOverall={isOverall}
                setIsOverall={setIsOverall}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ═══ ERROR BANNER ═══ */}
      {error && (
        <div className="mx-6 sm:mx-10 mt-20 px-6 py-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center justify-between max-w-[1600px] xl:mx-auto">
          <div className="flex items-center gap-3 text-sm text-red-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="font-body font-medium">{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-300 transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <main className={`relative mt-24 mb-16 mx-auto px-4 sm:px-8 lg:px-12 max-w-7xl transition-opacity duration-300 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
        
        {/* ── HERO 3D SECTION ── */}
        <section className="relative w-full py-20 flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F7931A]/10 rounded-full blur-[120px] pointer-events-none" />
          
          {/* Left: Headline & Text */}
          <div className="z-10 flex-1 space-y-6">
            <h2 className="text-5xl md:text-7xl font-heading font-bold tracking-tighter leading-none">
              <span className="text-white block">Mission</span>
              <span className="text-gradient-spartan">Command</span>
            </h2>
            <p className="text-[#94A3B8] text-lg font-body max-w-md leading-relaxed">
              Real-time synchronization of objectives, key results, and live team performance telemetry.
            </p>
            <div className="flex gap-4 pt-4">
              <button className="h-12 px-6 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-[#030304] font-mono font-bold uppercase tracking-widest text-xs shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:shadow-[0_0_30px_-5px_rgba(247,147,26,0.6)] hover:scale-105 transition-all duration-300">
                Execute Plan
              </button>
              <button className="h-12 px-6 rounded-full border-2 border-white/20 text-white font-mono font-bold uppercase tracking-widest text-xs hover:border-[#F7931A]/50 hover:bg-[#F7931A]/10 transition-all duration-300">
                View Ledger
              </button>
            </div>
          </div>

          {/* Right: Spinning Orbital Rings & Floating Cards */}
          <div className="relative w-full md:w-[450px] h-[350px] md:h-[450px] flex items-center justify-center shrink-0">
            {/* The Orb */}
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#FFD600] animate-float shadow-[0_0_50px_rgba(247,147,26,0.6)]" />
            
            {/* Outer Ring */}
            <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border border-white/10 border-t-[#F7931A]/60 animate-[spin_10s_linear_infinite]" />
            
            {/* Inner Ring */}
            <div className="absolute w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full border border-white/10 border-b-[#FFD600]/60 animate-[spin_15s_linear_infinite_reverse]" />

            {/* Bouncing Cards */}
            <div className="absolute -top-4 -left-4 glass-light p-4 rounded-xl border-t-[#F7931A]/50 animate-bounce [animation-duration:3s]">
              <p className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest mb-1">Total KRs</p>
              <p className="text-xl font-heading font-bold text-white">{teamSummary?.totalKRs || 0}</p>
            </div>
            
            <div className="absolute -bottom-8 right-8 glass-orange p-4 rounded-xl border-b-[#FFD600]/50 animate-bounce [animation-duration:4s] [animation-delay:1s]">
              <p className="text-[10px] font-mono text-[#F7931A] uppercase tracking-widest mb-1">Avg Progress</p>
              <p className="text-xl font-heading font-bold text-white">{teamSummary?.avgObjectiveProgress?.toFixed(1) || "0.0"}%</p>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-16 relative z-10">

          {/* ── Section 1: Strategic Suggestions ── */}
          <section id="section-suggestions" className="scroll-mt-32">
            <SuggestionsPanel
              summary={teamSummary}
              objectives={objectives}
              participantDetails={participantDetails}
            />
          </section>

          {/* ── Section 2: Team Comparison ── */}
          <section id="section-teams" className="scroll-mt-24">
              <TeamComparison />
          </section>

          {/* ── Section 3: Hall of Fame ── */}
          <section id="section-hall-of-fame" className="scroll-mt-24">
            <HallOfFame participantDetails={participantDetails} />
          </section>

          {/* ── Section 4: Contribution Matrix (Objectives) ── */}
          <section id="section-objectives" className="scroll-mt-24">
              <ContributionMatrix objectives={objectives} />
          </section>
        </div>

        {/* ── Floating AI Chat ── */}
        <FloatingAiChat dashboardData={dashboardData} />
      </main>
    </div>
  );
}
