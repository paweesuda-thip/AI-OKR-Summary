"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import OverviewCards from "./overview-cards";
import ObjectivesSection from "./objectives-section";
import TopPerformersSection from "./top-performers-section";
import NeedsAttentionSection from "./needs-attention-section";
import NoCheckInSection from "./no-checkin-section";
import AISummaryPanel from "./ai-summary-panel";
import FilterBar, { FilterOption } from "./filter-bar";
import AtRiskSection from "./at-risk-section";
import PeriodComparisonSection from "./period-comparison-section";
import TeamMembersSection from "./team-members-section";

import apiService from "@/lib/services/api-service";
import { Objective, ContributorSum, TeamSummary } from "@/lib/types/okr";

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
  const [topPerformersSummary, setTopPerformersSummary] = useState<string | null>(null);

  // Filter state
  const [selectedSet, setSelectedSet] = useState<FilterOption | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<FilterOption | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

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
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
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

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      {/* ── Header ── */}
      <header className="bg-slate-900 border-b border-slate-700/50 px-6 sm:px-10 py-5 flex items-center gap-4 sticky top-0 z-20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide leading-tight">
              Stratio
            </h1>
            <p className="text-sm text-slate-400 leading-tight mt-0.5">
              OKR Team Dashboard
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <Button
          onClick={fetchDashboard}
          disabled={loading}
          variant="secondary"
          className="rounded-xl flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Refresh
        </Button>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mx-6 sm:mx-10 mt-8 px-6 py-5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-4 text-base text-rose-300">
            <AlertCircle className="w-6 h-6 shrink-0" />
            {error}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setError("")}
            className="text-rose-400 hover:text-rose-200 hover:bg-rose-500/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center h-[80vh] animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            <p className="text-slate-400 text-lg">Loading data...</p>
          </div>
        </div>
      ) : (
        <main className="px-6 sm:px-10 mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Main Dashboard Grid Structure */}
          {/* Filter Bar */}
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column (2/3 width) - Charts & Lists */}
            <div className="xl:col-span-2 space-y-8">
                {/* 1. Overview */}
                <OverviewCards summary={teamSummary} />

                {/* Period Comparison */}
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

                {/* 2. Top Performers */}
                <TopPerformersSection 
                    contributors={contributors} 
                    aiSummary={topPerformersSummary} 
                    aiLoading={false} 
                />

                {/* 3. Needs Attention */}
                <NeedsAttentionSection contributors={contributors} />

                {/* 4. No Check-in */}
                <NoCheckInSection noCheckInEmployees={noCheckInEmployees} />

                {/* At Risk Section */}
                <AtRiskSection atRiskObjectives={atRiskObjectives} />

                {/* 5. Objectives */}
                <ObjectivesSection objectives={objectives} />
            </div>

            {/* Right Column (1/3 width) - AI & Team Members */}
            <div className="space-y-8">
                {/* AI Summary */}
                <div className="sticky top-28">
                    <AISummaryPanel 
                        dashboardData={dashboardData} 
                        onTopPerformersSummary={setTopPerformersSummary} 
                    />
                    
                    <div className="mt-8">
                        <TeamMembersSection teamMembers={contributors.map((c: ContributorSum) => ({
                            employeeId: c.fullName,
                            employeeName: c.fullName,
                            picture: c.pictureURL,
                            employeeStatus: 1,
                            positionName: 'Contributor'
                        }))} />
                    </div>
                </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
