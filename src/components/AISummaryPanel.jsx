import { useState, useRef, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
} from "chart.js";
import geminiService from "../services/geminiService";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

/* ═══════════════════════════════════════════════════════════
   VISUAL SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

// ── Health Score Ring ──────────────────────────────────────────────────────────
const HealthScoreRing = ({ score }) => {
  const color =
    score >= 8
      ? "#10b981"
      : score >= 6
        ? "#0ea5e9"
        : score >= 4
          ? "#f59e0b"
          : "#f43f5e";
  const label =
    score >= 8
      ? "Excellent"
      : score >= 6
        ? "Good"
        : score >= 4
          ? "Fair"
          : "At Risk";

  const data = {
    datasets: [
      {
        data: [score, 10 - score],
        backgroundColor: [color, "rgba(51,65,85,0.35)"],
        borderWidth: 0,
        cutout: "78%",
        borderRadius: 6,
      },
    ],
  };
  const opts = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { tooltip: { enabled: false } },
    rotation: -90,
    circumference: 360,
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <Doughnut data={data} options={opts} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-4xl font-extrabold tabular-nums leading-none"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-slate-500 text-sm mt-0.5">/10</span>
        </div>
      </div>
      <span
        className="text-sm font-bold uppercase tracking-widest"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
};

// ── Horizontal Bar Chart for Objectives ───────────────────────────────────────
const ObjectivesBarChart = ({ objectives }) => {
  if (!objectives?.length) return null;

  const chartData = {
    labels: objectives.map((o) =>
      o.objectiveName.length > 38
        ? o.objectiveName.slice(0, 38) + "..."
        : o.objectiveName,
    ),
    datasets: [
      {
        label: "Progress",
        data: objectives.map((o) => o.progress),
        backgroundColor: objectives.map((o) =>
          o.impactLevel === "high"
            ? "rgba(52,211,153,0.8)"
            : "rgba(56,189,248,0.65)",
        ),
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 22,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15,23,42,0.95)",
        borderColor: "rgba(99,102,241,0.3)",
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 13 },
        callbacks: { label: (ctx) => `  Progress: ${ctx.raw}%` },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: {
          color: "#64748b",
          font: { size: 12 },
          callback: (v) => v + "%",
        },
        border: { color: "rgba(255,255,255,0.06)" },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 12 }, padding: 8 },
        border: { display: false },
      },
    },
  };

  return (
    <div style={{ height: `${objectives.length * 52 + 32}px` }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

// ── Section Header Helper ─────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle, color = "text-slate-200" }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-2xl">{icon}</span>
    <div>
      <h3 className={`text-lg font-bold ${color}`}>{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ── Bold text parser — avoids dangerouslySetInnerHTML ─────────────────────────
function renderBold(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-slate-200">{part}</strong>
      : part,
  );
}

// ── Markdown Renderer (Q&A only) ─────────────────────────────────────────────
const renderMarkdown = (text) => {
  if (!text) return null;
  if (typeof text !== "string")
    return (
      <pre className="text-base text-slate-400 whitespace-pre-wrap">
        {JSON.stringify(text, null, 2)}
      </pre>
    );
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### "))
      elements.push(
        <h3 key={i} className="text-base font-bold text-indigo-300 mt-4 mb-2">
          {line.slice(4)}
        </h3>,
      );
    else if (line.startsWith("#### "))
      elements.push(
        <h4
          key={i}
          className="text-base font-semibold text-sky-300 mt-3 mb-1.5"
        >
          {line.slice(5)}
        </h4>,
      );
    else if (line.startsWith("---"))
      elements.push(<hr key={i} className="border-slate-700 my-3" />);
    else if (line.startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const [header, , ...rows] = tableLines;
      const headers = header
        .split("|")
        .filter(Boolean)
        .map((h) => h.trim());
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {headers.map((h, hi) => (
                  <th
                    key={hi}
                    className="text-left px-3 py-2 bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const cells = row
                  .split("|")
                  .filter(Boolean)
                  .map((c) => c.trim());
                return (
                  <tr key={ri} className="border-b border-slate-700/50">
                    {cells.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-2 text-slate-400 border border-slate-700/50"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>,
      );
      continue;
    } else if (line.startsWith("- ") || line.startsWith("* "))
      elements.push(
        <li key={i} className="text-base text-slate-400 ml-5 mb-1 list-disc leading-relaxed">
          {renderBold(line.slice(2))}
        </li>,
      );
    else if (/^\d+\.\s/.test(line))
      elements.push(
        <li key={i} className="text-base text-slate-400 ml-5 mb-1 list-decimal leading-relaxed">
          {renderBold(line.replace(/^\d+\.\s/, ""))}
        </li>,
      );
    else if (line.startsWith("> "))
      elements.push(
        <blockquote
          key={i}
          className="border-l-3 border-indigo-500 pl-4 my-2 text-base text-slate-400 italic"
        >
          {line.slice(2)}
        </blockquote>,
      );
    else if (line.trim() === "") elements.push(<div key={i} className="h-2" />);
    else
      elements.push(
        <p key={i} className="text-base text-slate-400 leading-relaxed">
          {renderBold(line)}
        </p>,
      );
    i++;
  }
  return elements;
};

/* ═══════════════════════════════════════════════════════════
   CACHE
   ═══════════════════════════════════════════════════════════ */
const STORAGE_KEY = "okr-dashboard-ai-cache";
function loadCachedAI() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveCachedAI(patch) {
  try {
    const prev = loadCachedAI();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...prev, ...patch, updatedAt: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

/* ═══════════════════════════════════════════════════════════
   TAB CONFIG
   ═══════════════════════════════════════════════════════════ */
const ALL_TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "objectives", label: "Objectives", icon: "🎯" },
  { id: "actions", label: "Action Plan", icon: "💡" },
];

const ACTION_TYPE_STYLES = {
  accelerate: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  refocus: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  expand: "bg-sky-500/10 text-sky-400 border-sky-500/30",
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const AISummaryPanel = ({ dashboardData, onTopPerformersSummary }) => {
  const cached = loadCachedAI();
  const [open, setOpen] = useState(!!cached.summary);
  const [summary, setSummary] = useState(cached.summary || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState(cached.qaHistory || []);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const bottomRef = useRef(null);

  const isConfigured = geminiService.isConfigured();

  // Restore cached top performers to Dashboard once (in useEffect to avoid setState-during-render)
  const hasRestoredRef = useRef(false);
  useEffect(() => {
    if (!hasRestoredRef.current && cached.topPerformers) {
      onTopPerformersSummary?.(cached.topPerformers);
      hasRestoredRef.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Generate ──────────────────────────────────────────────────────────────
  const generateSummary = async () => {
    if (!isConfigured) {
      setError("Please set VITE_GEMINI_API_KEY in .env");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const top3 = [...(dashboardData.contributors || [])]
        .sort((a, b) => b.contributedWeightScore - a.contributedWeightScore)
        .slice(0, 3);
      const [okrResult, topPerfResult] = await Promise.all([
        geminiService.generateSummary(dashboardData),
        geminiService.generateTopPerformersSummary(
          top3,
          dashboardData.objectives || [],
        ),
      ]);
      setSummary(okrResult);
      onTopPerformersSummary?.(topPerfResult);
      saveCachedAI({ summary: okrResult, topPerformers: topPerfResult });
    } catch (err) {
      setError(err.message || "Error generating summary");
    } finally {
      setLoading(false);
    }
  };

  // ── Q&A ───────────────────────────────────────────────────────────────────
  const handleAskQuestion = async () => {
    if (!question.trim() || !isConfigured) return;
    const q = question.trim();
    setQuestion("");
    setAskingQuestion(true);
    try {
      const answer = await geminiService.askQuestion(dashboardData, q);
      setQaHistory((prev) => {
        const updated = [...prev, { q, a: answer }];
        saveCachedAI({ qaHistory: updated });
        return updated;
      });
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      setQaHistory((prev) => {
        const updated = [...prev, { q, a: `Error: ${err.message}` }];
        saveCachedAI({ qaHistory: updated });
        return updated;
      });
    } finally {
      setAskingQuestion(false);
    }
  };

  // ── Destructure summary ───────────────────────────────────────────────────
  const {
    executiveSummary,
    winningObjectives,
    growthOpportunities,
    actionPlan,
    keyInsights,
  } = summary || {};
  const visibleTabs = ALL_TABS;

  /* ═══════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════ */
  return (
    <div className="ai-panel">
      {/* ── Collapsible Header ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="ai-panel-toggle"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/25 to-violet-500/25 border border-indigo-500/30 flex items-center justify-center text-xl text-indigo-400 shrink-0">
          ✦
        </div>
        <div className="text-left flex-1">
          <h2 className="text-lg font-bold text-white">AI OKR Summary</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Powered by Gemini &middot; Strategic OKR Analysis
          </p>
        </div>
        {!isConfigured && (
          <span className="text-sm px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full shrink-0">
            API Key Required
          </span>
        )}
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* ── Panel Body ── */}
      {open && (
        <div className="ai-panel-body">
          {/* ── Empty State ── */}
          {!summary && (
            <div className="ai-panel-empty">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-indigo-500/20 flex items-center justify-center text-4xl text-indigo-400">
                ✦
              </div>
              <div className="text-center max-w-md">
                <p className="text-xl font-bold text-slate-100 mb-2">
                  Analyze your OKRs with AI
                </p>
                <p className="text-base text-slate-500 leading-relaxed">
                  Get strategic insights, team performance analysis, and
                  actionable recommendations from your OKR data.
                </p>
              </div>
              <button
                onClick={generateSummary}
                disabled={loading || !isConfigured}
                className="flex items-center gap-3 px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-base text-white font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                    Analyzing...
                  </>
                ) : (
                  <>✦ Generate AI Summary</>
                )}
              </button>
              {error && (
                <p className="text-base text-rose-400 text-center max-w-md mt-2">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* ── Main Content ── */}
          {summary && (
            <>
              {/* ── Tab Navigation ── */}
              <div className="ai-tab-nav">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`ai-tab-btn ${
                      activeTab === tab.id
                        ? "text-indigo-300 bg-slate-800/80"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-500 rounded-full" />
                    )}
                  </button>
                ))}
                <div className="ml-auto pb-2.5 pl-4 shrink-0">
                  <button
                    onClick={generateSummary}
                    disabled={loading}
                    className="text-sm px-5 py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 rounded-xl border border-indigo-500/30 hover:border-indigo-500/50 flex items-center gap-2.5 transition-all font-semibold shadow-sm"
                    style={{ padding: "0.25rem 0.7rem" }}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-base">↺</span>
                    )}
                    Regenerate
                  </button>
                </div>
              </div>

              {/* ══════════════════════ TAB CONTENT ══════════════════════ */}
              <div className="ai-tab-content">
                {/* ══ OVERVIEW ══ */}
                {activeTab === "overview" && (
                  <div className="flex flex-col gap-8">
                    {/* Health Score + Executive Summary */}
                    {executiveSummary && (
                      <div className="grid grid-cols-[220px_1fr] gap-0 bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
                        {/* Left — Score Ring */}
                        <div className="flex flex-col items-center justify-center gap-5 p-8 border-r border-slate-700/50 bg-slate-800/30">
                          <HealthScoreRing
                            score={executiveSummary.healthScore}
                          />
                          <div
                            className={`px-4 py-2 rounded-full text-sm font-semibold border text-center ${
                              executiveSummary.alignmentStatus === "on-track"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            }`}
                          >
                            {executiveSummary.alignmentStatus === "on-track"
                              ? "✅ On Track"
                              : "⚠️ Needs Focus"}
                          </div>
                        </div>

                        {/* Right — Analysis */}
                        <div className="flex flex-col gap-5 p-8 justify-center">
                          <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                              Executive Summary
                            </p>
                            <p className="text-base text-slate-300 leading-relaxed">
                              {executiveSummary.healthReason}
                            </p>
                          </div>
                          {executiveSummary.keyAchievement && (
                            <div className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-5 py-4">
                              <span className="text-emerald-400 text-lg shrink-0 mt-0.5">
                                ★
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-emerald-300 mb-1">
                                  Key Achievement
                                </p>
                                <p className="text-base text-emerald-200/80 leading-relaxed">
                                  {executiveSummary.keyAchievement}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Key Insights — 3-column */}
                    {keyInsights && (
                      <div>
                        <SectionHeader
                          icon="✨"
                          title="Key Insights"
                          subtitle="Patterns discovered from your OKR data"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {keyInsights.topPerformancePattern && (
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🏆</span>
                                <p className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                                  Success Pattern
                                </p>
                              </div>
                              <p className="text-base text-slate-300 leading-relaxed">
                                {keyInsights.topPerformancePattern}
                              </p>
                            </div>
                          )}
                          {keyInsights.systemicOpportunity && (
                            <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-6 flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🎯</span>
                                <p className="text-sm font-bold text-sky-400 uppercase tracking-wide">
                                  Systemic Opportunity
                                </p>
                              </div>
                              <p className="text-base text-slate-300 leading-relaxed">
                                {keyInsights.systemicOpportunity}
                              </p>
                            </div>
                          )}
                          {keyInsights.teamStrength && (
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">💪</span>
                                <p className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                                  Team Strength
                                </p>
                              </div>
                              <p className="text-base text-slate-300 leading-relaxed">
                                {keyInsights.teamStrength}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ══ OBJECTIVES ══ */}
                {activeTab === "objectives" && (
                  <div className="flex flex-col gap-8">
                    {/* Winning Objectives */}
                    {winningObjectives?.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <SectionHeader
                            icon="🚀"
                            title="Winning Objectives"
                            subtitle="Top objectives driving team success"
                          />
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded bg-emerald-400/80 inline-block" />
                              High Impact
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded bg-sky-400/65 inline-block" />
                              Medium
                            </span>
                          </div>
                        </div>

                        {/* Bar Chart */}
                        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 mb-6">
                          <ObjectivesBarChart objectives={winningObjectives} />
                        </div>

                        {/* Detail Cards */}
                        <div className="flex flex-col gap-3">
                          {winningObjectives.map((obj, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-4 bg-slate-800/30 border border-slate-700/40 rounded-2xl px-6 py-5 hover:border-slate-600/60 transition-colors"
                            >
                              {/* Progress badge */}
                              <div className="flex flex-col items-center shrink-0 pt-0.5">
                                <span className="text-lg font-extrabold tabular-nums text-emerald-400">
                                  {obj.progress}%
                                </span>
                              </div>
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                  <span className="text-base font-semibold text-white">
                                    {obj.objectiveName}
                                  </span>
                                  {obj.impactLevel === "high" && (
                                    <span className="text-xs px-2 py-1 bg-rose-500/15 text-rose-400 rounded-md border border-rose-500/25 font-semibold shrink-0">
                                      HIGH IMPACT
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed mb-3">
                                  {obj.insight}
                                </p>
                                {obj.contributors?.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {obj.contributors.map((c, ci) => (
                                      <span
                                        key={ci}
                                        className="text-sm px-2.5 py-1 bg-slate-700/50 text-slate-400 rounded-lg border border-slate-600/40"
                                      >
                                        {c}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Growth Opportunities */}
                    {growthOpportunities?.length > 0 && (
                      <div>
                        <SectionHeader
                          icon="🌱"
                          title="Growth Opportunities"
                          subtitle="Areas with high potential for improvement"
                          color="text-amber-300"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {growthOpportunities.map((opp, i) => (
                            <div
                              key={i}
                              className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-base font-semibold text-white leading-snug flex-1">
                                  {opp.objectiveName}
                                </span>
                                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                                  {opp.priority === "high" && (
                                    <span className="text-xs px-2 py-1 bg-amber-500/15 text-amber-400 rounded-md border border-amber-500/25 font-semibold">
                                      HIGH
                                    </span>
                                  )}
                                  <span
                                    className={`text-xs px-2 py-1 rounded-md border font-medium ${
                                      opp.currentStatus === "On Track"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                        : opp.currentStatus === "At Risk"
                                          ? "bg-rose-500/10  text-rose-400  border-rose-500/25"
                                          : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                    }`}
                                  >
                                    {opp.currentStatus}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-slate-400 leading-relaxed">
                                {opp.opportunity}
                              </p>
                              <div className="flex items-start gap-3 bg-slate-700/30 rounded-xl px-4 py-3">
                                <span className="text-base shrink-0 mt-0.5">
                                  🔑
                                </span>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                  {opp.unlock}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ══ ACTION PLAN ══ */}
                {activeTab === "actions" && actionPlan?.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <SectionHeader
                      icon="💡"
                      title="Priority Action Plan"
                      subtitle="Recommended actions ordered by impact"
                    />
                    <div className="flex flex-col gap-4">
                      {actionPlan.map((action, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-5 bg-slate-800/40 border border-slate-700/40 rounded-2xl px-6 py-5 hover:border-indigo-500/30 transition-colors group"
                        >
                          {/* Priority circle */}
                          <div className="w-11 h-11 rounded-full bg-indigo-500/15 border-2 border-indigo-500/30 group-hover:bg-indigo-500/25 flex items-center justify-center text-indigo-400 text-lg font-bold shrink-0 transition-colors">
                            {action.priority}
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="text-base font-semibold text-white">
                                {action.action}
                              </span>
                              <span
                                className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${ACTION_TYPE_STYLES[action.actionType] || ACTION_TYPE_STYLES.expand}`}
                              >
                                {action.actionType}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mb-1.5 flex items-center gap-1.5">
                              <span className="text-slate-600">→</span>{" "}
                              {action.relatedObjective}
                            </p>
                            <p className="text-base text-slate-400 leading-relaxed">
                              {action.expectedImpact}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* ══════════════════════ Q&A SECTION ══════════════════════ */}
              <div className="ai-qa-section">
                {/* Divider label */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-700/50" />
                  <span className="text-sm text-slate-500 font-medium">
                    Ask follow-up questions
                  </span>
                  <div className="flex-1 h-px bg-slate-700/50" />
                </div>

                {/* Chat History */}
                {qaHistory.length > 0 && (
                  <div className="ai-chat-history">
                    {qaHistory.map((item, i) => (
                      <div key={i} className="flex flex-col gap-3">
                        <div className="ai-msg-user">{item.q}</div>
                        <div className="ai-msg-ai">{renderMarkdown(item.a)}</div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AISummaryPanel;
