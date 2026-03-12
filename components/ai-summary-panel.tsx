"use client";

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
import geminiService from "@/lib/services/gemini-service";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, ChevronUp, RefreshCw, BarChart3, Target, Lightbulb, PlayCircle, Minimize2, ArrowUpRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

/* ═══════════════════════════════════════════════════════════
   VISUAL SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

// ── Health Score Ring ──────────────────────────────────────────────────────────
const HealthScoreRing = ({ score }: { score: number }) => {
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
      <div className="relative w-36 h-36 drop-shadow-lg">
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
const ObjectivesBarChart = ({ objectives }: { objectives: any[] }) => {
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
    indexAxis: "y" as const,
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
        callbacks: { label: (ctx: any) => `  Progress: ${ctx.raw}%` },
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
          callback: (v: any) => v + "%",
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
const SectionHeader = ({ icon, title, subtitle, color = "text-slate-200" }: { icon: React.ReactNode, title: string, subtitle?: string, color?: string }) => (
  <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-3">
    <span className="text-2xl text-slate-400">{icon}</span>
    <div>
      <h3 className={`text-xl font-bold ${color}`}>{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ── Bold text parser ─────────────────────────
function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-slate-200">{part}</strong>
      : part,
  );
}

// ── Markdown Renderer (Q&A only) ─────────────────────────────────────────────
const renderMarkdown = (text: string) => {
  if (!text) return null;
  if (typeof text !== "string")
    return (
      <pre className="text-base text-slate-400 whitespace-pre-wrap font-mono bg-slate-900 p-4 rounded-xl">
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
        <h3 key={i} className="text-lg font-bold text-indigo-300 mt-5 mb-2 flex items-center gap-2">
          {line.slice(4)}
        </h3>,
      );
    else if (line.startsWith("#### "))
      elements.push(
        <h4
          key={i}
          className="text-base font-semibold text-sky-300 mt-4 mb-2 flex flex-col"
        >
          {line.slice(5)}
          <span className="h-0.5 w-8 bg-sky-500/20 mt-1 rounded-full"></span>
        </h4>,
      );
    else if (line.startsWith("---"))
      elements.push(<hr key={i} className="border-slate-800 my-5" />);
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
        <div key={`table-${i}`} className="overflow-x-auto my-4 rounded-xl border border-slate-700/50 bg-slate-900/50">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800/80">
                {headers.map((h, hi) => (
                  <th
                    key={hi}
                    className="text-left px-4 py-3 text-slate-300 border-b border-slate-700/50 font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {rows.map((row, ri) => {
                const cells = row
                  .split("|")
                  .filter(Boolean)
                  .map((c) => c.trim());
                return (
                  <tr key={ri} className="hover:bg-slate-800/30 transition-colors">
                    {cells.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-4 py-3 text-slate-400"
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
        <li key={i} className="text-base text-slate-400 ml-5 mb-2 flex items-start">
          <span className="text-indigo-400 mr-2 shrink-0">•</span>
          <span className="leading-relaxed">{renderBold(line.slice(2))}</span>
        </li>,
      );
    else if (/^\d+\.\s/.test(line))
      elements.push(
        <li key={i} className="text-base text-slate-400 ml-5 mb-2 list-decimal list-outside leading-relaxed marker:text-indigo-400 marker:font-semibold">
          {renderBold(line.replace(/^\d+\.\s/, ""))}
        </li>,
      );
    else if (line.startsWith("> "))
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-indigo-500 bg-indigo-500/5 pl-4 py-2 pr-2 rounded-r-lg my-4 text-base text-slate-300 italic shadow-sm"
        >
          {line.slice(2)}
        </blockquote>,
      );
    else if (line.trim() === "") elements.push(<div key={i} className="h-3" />);
    else
      elements.push(
        <p key={i} className="text-base text-slate-300 leading-relaxed max-w-none">
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
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveCachedAI(patch: any) {
  if (typeof window === 'undefined') return;
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
const ACTION_TYPE_STYLES: Record<string, string> = {
  accelerate: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  refocus: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  expand: "bg-sky-500/10 text-sky-400 border-sky-500/30",
};

interface AISummaryPanelProps {
    dashboardData: any;
    onTopPerformersSummary?: (summary: any) => void;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function AISummaryPanel({ dashboardData, onTopPerformersSummary }: AISummaryPanelProps) {
  const cached = loadCachedAI();
  const [open, setOpen] = useState(!!cached.summary);
  const [summary, setSummary] = useState(cached.summary || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<any[]>(cached.qaHistory || []);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const bottomRef = useRef<HTMLDivElement>(null);

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
      setError("Please set NEXT_PUBLIC_GEMINI_API_KEY in .env");
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
        geminiService.generateTopPerformersSummary(top3),
      ]);
      setSummary(okrResult);
      onTopPerformersSummary?.(topPerfResult);
      saveCachedAI({ summary: okrResult, topPerformers: topPerfResult });
    } catch (err: any) {
      setError(err.message || "Error generating summary");
    } finally {
      setLoading(false);
    }
  };

  // ── Q&A ───────────────────────────────────────────────────────────────────
  const handleAskQuestion = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
    } catch (err: any) {
      setQaHistory((prev) => {
        const updated = [...prev, { q, a: `Error: ${err.message}` }];
        saveCachedAI({ qaHistory: updated });
        return updated;
      });
    } finally {
      setAskingQuestion(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAskQuestion();
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

  /* ═══════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════ */
  return (
    <Card className={`border-slate-800 shadow-2xl transition-all duration-500 overflow-hidden ${open ? 'bg-slate-900 ring-1 ring-indigo-500/20' : 'bg-slate-900/80'}`}>
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/25 to-violet-500/25 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="text-left flex-1">
                      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AI OKR Summary</h2>
                      <p className="text-sm text-slate-400 font-medium mt-0.5 tracking-wide">
                        Powered by Gemini &middot; Strategic Analysis
                      </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {!isConfigured && (
                      <span className="hidden sm:inline-flex text-xs font-semibold px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full">
                        API Key Required
                      </span>
                    )}
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <CardContent className="px-0 py-0 pb-6 border-t border-slate-800 bg-slate-900">
                    {/* ── Empty State ── */}
                    {!summary && (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-8 shadow-2xl shadow-indigo-500/10">
                                <Sparkles className="w-12 h-12 opacity-80" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight">
                                Deep Dive with AI
                            </h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium leading-relaxed">
                                Unlock strategic insights, team performance patterns, and actionable recommendations derived directly from your OKR data.
                            </p>
                            <Button
                                onClick={generateSummary}
                                disabled={loading || !isConfigured}
                                className="h-14 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all w-full sm:w-auto text-base font-semibold border border-indigo-400/20 group"
                            >
                                {loading ? (
                                    <><RefreshCw className="w-5 h-5 mr-3 animate-spin" /> Analyzing Patterns...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" /> Generate AI Summary</>
                                )}
                            </Button>
                            {error && (
                                <p className="text-rose-400 font-medium mt-4 p-3 bg-rose-500/10 rounded-lg border border-rose-500/20 max-w-md mx-auto">
                                    {error}
                                </p>
                            )}
                        </div>
                    )}

                    {/* ── Main Content ── */}
                    {summary && (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            {/* Tab Navigation */}
                            <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
                                <TabsList className="bg-slate-800/80 border border-slate-700/50 p-1 h-auto rounded-xl shadow-inner">
                                    <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg py-2.5 px-5 font-semibold transition-all">
                                        <BarChart3 className="w-4 h-4 mr-2" /> Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="objectives" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg py-2.5 px-5 font-semibold transition-all">
                                        <Target className="w-4 h-4 mr-2" /> Objectives
                                    </TabsTrigger>
                                    <TabsTrigger value="actions" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg py-2.5 px-5 font-semibold transition-all">
                                        <Lightbulb className="w-4 h-4 mr-2" /> Action Plan
                                    </TabsTrigger>
                                </TabsList>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={generateSummary}
                                    disabled={loading}
                                    className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-indigo-200 h-10 px-4 rounded-xl shrink-0"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Regenerate
                                </Button>
                            </div>

                            <div className="p-6 md:p-8">
                                {/* ══ OVERVIEW ══ */}
                                <TabsContent value="overview" className="mt-0 space-y-10 focus-visible:outline-none focus-visible:ring-0">
                                    {executiveSummary && (
                                        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-0 bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm">
                                            {/* Left — Score Ring */}
                                            <div className="flex flex-col items-center justify-center gap-6 p-8 border-b md:border-b-0 md:border-r border-slate-700/50 bg-slate-900/40 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                                                <HealthScoreRing score={executiveSummary.healthScore} />
                                                <div
                                                    className={`px-5 py-2 rounded-full text-sm font-bold border shadow-sm ${
                                                    executiveSummary.alignmentStatus === "on-track"
                                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                        : "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                                    }`}
                                                >
                                                    {executiveSummary.alignmentStatus === "on-track" ? "✅ On Track" : "⚠️ Needs Focus"}
                                                </div>
                                            </div>

                                            {/* Right — Analysis */}
                                            <div className="flex flex-col gap-6 p-8 justify-center bg-slate-800/20">
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        Executive Summary <div className="h-px bg-slate-700/50 flex-1 ml-2"></div>
                                                    </h4>
                                                    <p className="text-lg text-slate-200 leading-relaxed font-medium">
                                                        {executiveSummary.healthReason}
                                                    </p>
                                                </div>
                                                {executiveSummary.keyAchievement && (
                                                    <div className="flex items-start gap-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 shadow-sm">
                                                        <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400 shrink-0">
                                                            <Sparkles className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-emerald-400 mb-1.5 uppercase tracking-wider">
                                                                Key Achievement
                                                            </p>
                                                            <p className="text-base text-emerald-100/80 leading-relaxed font-medium">
                                                                {executiveSummary.keyAchievement}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Key Insights */}
                                    {keyInsights && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                                            <SectionHeader icon={<Sparkles className="w-6 h-6 text-indigo-400" />} title="Key Insights" subtitle="Patterns discovered from your OKR data" color="text-indigo-400" />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {keyInsights.topPerformancePattern && (
                                                    <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:bg-emerald-950/30 transition-colors">
                                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                                                            <ArrowUpRight className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Success Pattern</p>
                                                            <p className="text-sm text-slate-300 leading-relaxed font-medium">{keyInsights.topPerformancePattern}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {keyInsights.systemicOpportunity && (
                                                    <div className="bg-sky-950/20 border border-sky-900/50 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:bg-sky-950/30 transition-colors">
                                                        <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 mb-2">
                                                            <Target className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-2">Systemic Opportunity</p>
                                                            <p className="text-sm text-slate-300 leading-relaxed font-medium">{keyInsights.systemicOpportunity}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {keyInsights.teamStrength && (
                                                    <div className="bg-amber-950/20 border border-amber-900/50 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:bg-amber-950/30 transition-colors">
                                                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Team Strength</p>
                                                            <p className="text-sm text-slate-300 leading-relaxed font-medium">{keyInsights.teamStrength}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* ══ OBJECTIVES ══ */}
                                <TabsContent value="objectives" className="mt-0 space-y-10 focus-visible:outline-none focus-visible:ring-0">
                                    {winningObjectives?.length > 0 && (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-3">
                                                <div className="flex items-center gap-3 text-emerald-400">
                                                    <Target className="w-6 h-6" />
                                                    <h3 className="text-xl font-bold">Winning Objectives</h3>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm font-medium">
                                                    <span className="flex items-center gap-2 text-slate-300">
                                                        <span className="w-3 h-3 rounded bg-emerald-400/80 ring-2 ring-emerald-400/20" /> High Impact
                                                    </span>
                                                    <span className="flex items-center gap-2 text-slate-300">
                                                        <span className="w-3 h-3 rounded bg-sky-400/65 ring-2 ring-sky-400/20" /> Medium
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 mb-8 shadow-sm">
                                                <ObjectivesBarChart objectives={winningObjectives} />
                                            </div>

                                            <div className="grid gap-4">
                                                {winningObjectives.map((obj: any, i: number) => (
                                                    <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-5 bg-slate-800/20 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-6 transition-all shadow-sm">
                                                        <div className="flex flex-col items-center justify-center shrink-0 w-20 h-20 bg-slate-900/80 rounded-2xl border border-slate-800 drop-shadow-sm">
                                                            <span className="text-2xl font-black text-emerald-400 tracking-tighter">{obj.progress}%</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                                <h4 className="text-lg font-bold text-slate-100">{obj.objectiveName}</h4>
                                                                {obj.impactLevel === "high" && (
                                                                    <span className="text-[10px] px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 font-bold tracking-wider uppercase">
                                                                        High Impact
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">{obj.insight}</p>
                                                            {obj.contributors?.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {obj.contributors.map((c: string, ci: number) => (
                                                                        <span key={ci} className="text-xs font-semibold px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-full flex items-center gap-2">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> {c}
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

                                    {growthOpportunities?.length > 0 && (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-3 mt-12">
                                                <div className="flex items-center gap-3 text-amber-400">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                    <h3 className="text-xl font-bold">Growth Opportunities</h3>
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium">Areas with high potential for improvement</p>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {growthOpportunities.map((opp: any, i: number) => (
                                                    <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col h-full shadow-sm hover:border-slate-600 transition-colors">
                                                        <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                                                            <span className="text-base font-bold text-slate-200 leading-tight pr-4 flex-1">
                                                                {opp.objectiveName}
                                                            </span>
                                                            <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider tabular-nums ${
                                                                opp.currentStatus === "On Track" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                                                                opp.currentStatus === "At Risk" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : 
                                                                "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                            }`}>
                                                                {opp.currentStatus}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-400 leading-relaxed font-medium mb-6 flex-1">
                                                            {opp.opportunity}
                                                        </p>
                                                        <div className="mt-auto bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex items-start gap-4">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                                                <Lightbulb className="w-4 h-4" />
                                                            </div>
                                                            <p className="text-sm text-slate-300 font-medium leading-relaxed py-0.5">
                                                                {opp.unlock}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* ══ ACTION PLAN ══ */}
                                <TabsContent value="actions" className="mt-0 space-y-6 focus-visible:outline-none focus-visible:ring-0">
                                    {actionPlan?.length > 0 && (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <SectionHeader icon={<Lightbulb className="w-6 h-6 text-amber-400" />} title="Priority Action Plan" subtitle="Recommended actions ordered by impact" color="text-amber-400" />
                                            <div className="space-y-4">
                                                {actionPlan.map((action: any, i: number) => (
                                                    <div key={i} className="flex flex-col sm:flex-row items-start gap-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/50 hover:border-slate-600 transition-all shadow-sm group">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl font-black text-slate-300 shadow-inner group-hover:scale-110 transition-transform shrink-0">
                                                            {action.priority}
                                                        </div>
                                                        <div className="flex-1 min-w-0 w-full">
                                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                                                <h4 className="text-lg font-bold text-slate-100 pr-4">{action.action}</h4>
                                                                <span className={`text-[10px] px-3 py-1.5 rounded-full border font-bold uppercase tracking-widest shrink-0 w-fit ${ACTION_TYPE_STYLES[action.actionType] || ACTION_TYPE_STYLES.expand}`}>
                                                                    {action.actionType}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="bg-slate-900/50 rounded-lg p-3 mb-4 inline-flex items-center gap-2 max-w-full">
                                                                <Target className="w-4 h-4 text-indigo-400 shrink-0" />
                                                                <span className="text-xs font-semibold text-slate-300 truncate">{action.relatedObjective}</span>
                                                            </div>
                                                            
                                                            <p className="text-sm text-slate-400 font-medium leading-relaxed bg-slate-800/20 p-4 rounded-xl border border-slate-800 border-l-2 border-l-slate-600">
                                                                {action.expectedImpact}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </div>
                        </Tabs>
                    )}

                    {/* ══════════════════════ Q&A SECTION ══════════════════════ */}
                    {summary && (
                        <div className="px-6 md:px-8 pt-6 pb-2 border-t border-slate-800 bg-slate-900/30">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-slate-700/50 flex-1"></div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Ask Follow-up Questions</span>
                                <div className="h-px bg-gradient-to-l from-transparent via-slate-700/50 to-slate-700/50 flex-1"></div>
                            </div>

                            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex flex-col min-h-[150px] max-h-[500px]">
                                {/* Chat History */}
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                                    {qaHistory.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-4">
                                            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-slate-500 mb-3 border border-slate-800">🤔</div>
                                            <p className="text-slate-400 text-sm font-medium">Ask Gemini for deeper insights into your OKR data.</p>
                                            <p className="text-slate-500 text-xs mt-1">e.g., "Why is Team A behind schedule?"</p>
                                        </div>
                                    ) : (
                                        qaHistory.map((item, i) => (
                                            <div key={i} className="space-y-4">
                                                {/* User Msg */}
                                                <div className="flex justify-end pl-12">
                                                    <div className="bg-indigo-600 text-indigo-50 px-4 py-3 rounded-2xl rounded-tr-sm text-sm font-medium shadow-sm inline-block max-w-full break-words">
                                                        {item.q}
                                                    </div>
                                                </div>
                                                {/* AI Msg */}
                                                <div className="flex items-start gap-4 pr-12">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                                        <Sparkles className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-5 text-sm shadow-sm font-medium flex-1 overflow-hidden">
                                                        {renderMarkdown(item.a)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={bottomRef} className="h-4"></div>
                                </div>

                                {/* Input Area */}
                                <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                                    <form onSubmit={handleAskQuestion} className="relative flex items-center">
                                        <Input
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            placeholder="Ask anything about these results... (Press Enter to send)"
                                            className="bg-slate-950 border-slate-700 focus-visible:ring-indigo-500 text-sm py-6 pr-24 rounded-xl shadow-inner w-full text-slate-200"
                                            disabled={askingQuestion || !isConfigured}
                                            autoComplete="off"
                                        />
                                        <div className="absolute right-2 flex items-center">
                                            <Button 
                                                type="submit" 
                                                size="sm"
                                                disabled={askingQuestion || !question.trim() || !isConfigured}
                                                className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm"
                                            >
                                                {askingQuestion ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <span className="font-semibold px-1">Send</span>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </CollapsibleContent>
        </Collapsible>
    </Card>
  );
}
