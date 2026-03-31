import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TeamSummary, Objective, ContributorSum } from "@/lib/types/okr";

export interface AIScoreResult {
  score: number;
  review: string;
}

interface AIScoreSectionProps {
  teamSummary: TeamSummary | null;
  dashboardData: {
    summary: TeamSummary | null;
    objectives: Objective[];
    contributors: ContributorSum[];
    atRisk: Objective[];
  };
  aiScoreResult: AIScoreResult | null;
  onAiScoreResultChange: (result: AIScoreResult | null) => void;
}

// ── Inline SVGs ──────────────────────────────────────────
const SparkleIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);

const LoaderIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

const AlertIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const RefreshIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ChartIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);


const normalizeAIScoreResult = (payload: unknown): AIScoreResult | null => {
  if (!payload || typeof payload !== "object") return null;

  const raw = payload as { score?: unknown; review?: unknown };
  const parsedScore = typeof raw.score === "string" ? Number(raw.score) : raw.score;
  const parsedReview = typeof raw.review === "string" ? raw.review.trim() : "";

  if (typeof parsedScore !== "number" || !Number.isFinite(parsedScore) || !parsedReview) {
    return null;
  }

  return {
    score: Math.min(10, Math.max(1, Math.round(parsedScore))),
    review: parsedReview,
  };
};

export function AIScoreSection({
  teamSummary,
  dashboardData,
  aiScoreResult,
  onAiScoreResultChange,
}: AIScoreSectionProps) {
  const [isGeneratingScore, setIsGeneratingScore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetAIScore = async () => {
    if (!teamSummary) return;
    
    setIsGeneratingScore(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);

    try {
      const response = await fetch('/api/ai-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboardData }),
        signal: controller.signal,
      });
      
      if (!response.ok) throw new Error('Failed to generate score');
      
      const data = await response.json();
      const normalized = normalizeAIScoreResult(data);
      if (!normalized) throw new Error("Invalid AI score response");

      onAiScoreResultChange(normalized);
    } catch (err) {
      console.error(err);
      const isTimeout = err instanceof DOMException && err.name === 'AbortError';
      setError(
        isTimeout
          ? 'การวิเคราะห์ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง'
          : 'ไม่สามารถสร้างคะแนนประเมินได้ กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      clearTimeout(timeout);
      setIsGeneratingScore(false);
    }
  };

  const getScoreStyle = (score: number) => {
    if (score >= 8) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (score >= 5) return "text-[#F7931A] bg-[#F7931A]/10 border-[#F7931A]/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 5) return "On Track";
    return "Needs Attention";
  };

  return (
    <section className="w-full h-full flex flex-col font-sans text-white">
      <div className="flex-1 flex flex-col transition-all duration-500 overflow-hidden">
        
        {/* Uninitialized State */}
        {!aiScoreResult && !isGeneratingScore && !error && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/[0.02] rounded-2xl border border-white/[0.06] backdrop-blur-md">
            <div className="h-16 w-16 rounded-2xl bg-[#F7931A]/10 border border-[#F7931A]/20 flex items-center justify-center mb-6 glow-orange-subtle">
              <SparkleIcon className="h-8 w-8 text-[#F7931A]" />
            </div>
            <h3 className="font-heading text-2xl font-bold tracking-tight text-white mb-2">
              Generate AI Insight
            </h3>
            <p className="text-[#94A3B8] font-body max-w-sm mx-auto mb-8">
              Let Spartan AI analyze your team's OKR progress and provide tactical recommendations.
            </p>
            <button 
              onClick={handleGetAIScore}
              disabled={!teamSummary}
              className="group flex items-center gap-2 rounded-full px-8 py-4 text-sm font-mono font-bold tracking-widest uppercase transition-all bg-[#F7931A] text-[#030304] hover:bg-[#FFD600] glow-orange disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SparkleIcon className="w-5 h-5 group-hover:animate-pulse" />
              Analyze Data
            </button>
          </div>
        )}

        {/* Loading State */}
        {isGeneratingScore && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white/[0.02] rounded-2xl border border-white/[0.06] backdrop-blur-md">
            <LoaderIcon className="w-10 h-10 text-[#F7931A] animate-spin mb-6" />
            <h3 className="font-heading text-xl font-bold text-white mb-2">Analyzing Data</h3>
            <p className="font-mono text-[10px] text-[#94A3B8] tracking-widest uppercase mt-2">
              Processing OKR Metrics...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isGeneratingScore && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center bg-red-500/5 rounded-2xl border border-red-500/20 backdrop-blur-md">
            <AlertIcon className="w-10 h-10 text-red-500 mb-4" />
            <p className="text-red-400 font-medium text-sm mb-6 max-w-sm">{error}</p>
            <button 
              onClick={handleGetAIScore} 
              className="rounded-full px-6 py-2.5 text-xs font-mono font-bold tracking-widest uppercase bg-transparent border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Result State */}
        {aiScoreResult && !isGeneratingScore && (
          <div className="flex flex-col flex-1 animate-in fade-in zoom-in-95 duration-500 spartan-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 bg-black/20">
              <div className="flex items-center gap-2.5">
                <ChartIcon className="text-[#F7931A]" />
                <span className="font-mono text-[10px] font-bold text-white tracking-[0.2em] uppercase">
                  Analysis Complete
                </span>
              </div>
              <button 
                onClick={handleGetAIScore}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase items-center text-[#94A3B8] hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <RefreshIcon />
                Re-analyze
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0 bg-[#0F1115]">
              {/* Score Column */}
              <div className="md:w-[280px] shrink-0 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/[0.06] relative overflow-hidden">
                {/* Subtle glow behind score */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div className={`w-32 h-32 blur-3xl rounded-full ${
                    aiScoreResult.score >= 8 ? 'bg-emerald-500' : 
                    aiScoreResult.score >= 5 ? 'bg-[#F7931A]' : 'bg-red-500'
                  }`} />
                </div>
                
                <div className="text-7xl font-heading font-black tracking-tighter text-white mb-3 drop-shadow-sm relative z-10 flex items-baseline">
                  {aiScoreResult.score}
                  <span className="text-2xl text-white/30 font-medium ml-1">/10</span>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border relative z-10 ${getScoreStyle(aiScoreResult.score)}`}>
                  {getScoreLabel(aiScoreResult.score)}
                </div>
              </div>

              {/* Markdown Column */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="prose prose-invert max-w-none 
                  prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight 
                  prose-p:font-body prose-p:text-[#94A3B8] prose-p:leading-relaxed prose-p:text-sm
                  prose-li:text-[#94A3B8] prose-li:text-sm
                  prose-strong:text-white
                  prose-a:text-[#F7931A] hover:prose-a:text-[#FFD600]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiScoreResult.review}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
