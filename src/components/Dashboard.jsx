import { useState, useEffect, useCallback } from "react";
import OverviewCards from "./OverviewCards";
import ObjectivesSection from "./ObjectivesSection";
import TopPerformersSection from "./TopPerformersSection";
import NeedsAttentionSection from "./NeedsAttentionSection";
import NoCheckInSection from "./NoCheckInSection";
import AISummaryPanel from "./AISummaryPanel";
import apiService from "../services/apiService";

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  // ── Fixed Values ──────────────────────────────────────────────────────────
  // const ASSESSMENT_SET_ID = 23980; // dev
  // const ORGANIZATION_ID = 14904;   // dev
  const ASSESSMENT_SET_ID = 185467; // prod
  const ORGANIZATION_ID = 18477; // prod

  // ── Data ──────────────────────────────────────────────────────────────────
  const [teamSummary, setTeamSummary] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [atRiskObjectives, setAtRiskObjectives] = useState([]);
  const [noCheckInEmployees, setNoCheckInEmployees] = useState([]);

  // ── Status ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topPerformersSummary, setTopPerformersSummary] = useState(null);

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
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load data. Please check your connection.",
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Header ── */}
      <header className="bg-slate-900 border-b border-slate-700/50 px-10 py-5 flex items-center gap-4 sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
            S
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide leading-tight">
              Stratio
            </h1>
            <p className="text-sm text-slate-500 leading-tight mt-0.5">
              OKR Team Dashboard
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl text-base text-slate-300 border border-slate-600 flex items-center gap-2.5 transition-colors font-medium"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mx-10 mt-8 px-6 py-5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4 text-base text-rose-300">
            <svg
              className="w-6 h-6 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {error}
          </div>
          <button
            onClick={() => setError("")}
            className="text-rose-400 hover:text-rose-200 text-base font-medium p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-6">
            <div className="w-14 h-14 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-lg">Loading data...</p>
          </div>
        </div>
      ) : (
        <main className="dashboard-main">
          {/* 1. Overview */}
          <OverviewCards summary={teamSummary} />
          {/* AI Summary */}
          <AISummaryPanel
            dashboardData={dashboardData}
            onTopPerformersSummary={setTopPerformersSummary}
          />
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

          {/* 5. Objectives */}
          <ObjectivesSection objectives={objectives} />
        </main>
      )}
    </div>
  );
};

export default Dashboard;
