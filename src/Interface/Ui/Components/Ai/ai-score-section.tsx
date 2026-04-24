import { useState } from "react";
import { Loader2, Sparkles, AlertCircle, RefreshCw, BarChart2 } from "lucide-react";
import { Button } from "@/src/Interface/Ui/Primitives/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TeamSummary, Objective, ContributorSum } from "@/src/Domain/Entities/Okr";

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
    if (score >= 8) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
    if (score >= 5) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
    return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 5) return "On Track";
    return "Needs Attention";
  };

  return (
    <section className="w-full max-w-7xl mx-auto mb-10 h-full flex flex-col">
      <div className="flex-1 flex flex-col transition-all duration-500 overflow-hidden">
        
        {/* Uninitialized State */}
        {!aiScoreResult && !isGeneratingScore && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-sm">
            <div className="h-16 w-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-sm">
              <Sparkles className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
              Generate AI Insight
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
              ให้ AI ช่วยวิเคราะห์ผลงานและให้คำแนะนำแบบเจาะลึกเพื่อขับเคลื่อนทีมของคุณ
            </p>
            <Button 
              onClick={handleGetAIScore}
              disabled={!teamSummary}
              size="lg"
              className="rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Dashboard Data
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isGeneratingScore && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-6" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Analyzing Data</h3>
            <p className="text-zinc-500 dark:text-zinc-400">กำลังวิเคราะห์ข้อมูลผลงานของทีมและสร้างคำแนะนำ...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isGeneratingScore && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center bg-red-50 dark:bg-red-950/10 rounded-2xl border border-red-200 dark:border-red-900/30">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <p className="text-destructive font-medium text-lg mb-6">{error}</p>
            <Button variant="outline" onClick={handleGetAIScore} className="rounded-full px-8 bg-white dark:bg-transparent">
              Try Again
            </Button>
          </div>
        )}

        {/* Result State */}
        {aiScoreResult && !isGeneratingScore && (
          <div className="flex flex-col flex-1 animate-in fade-in zoom-in-95 duration-500 bg-white/60 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/50 px-6 py-4 bg-zinc-50/80 dark:bg-black/20">
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide uppercase text-sm">Analysis Complete</span>
              </div>
              <Button 
                onClick={handleGetAIScore}
                variant="ghost"
                size="sm"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-analyze
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
              {/* Score Column */}
              <div className="md:w-[320px] shrink-0 flex flex-col items-center justify-center p-10 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-black/10 relative overflow-hidden">
                {/* Subtle glow behind score */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 dark:opacity-20 pointer-events-none">
                  <div className={`w-32 h-32 blur-3xl rounded-full ${
                    aiScoreResult.score >= 8 ? 'bg-emerald-500' : 
                    aiScoreResult.score >= 5 ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                </div>
                
                <div className="text-[6rem] leading-none font-black tracking-tighter text-zinc-900 dark:text-white mb-4 drop-shadow-sm relative z-10">
                  {aiScoreResult.score}<span className="text-3xl text-zinc-400 dark:text-zinc-600 font-medium ml-1">/10</span>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold border uppercase tracking-widest shadow-sm relative z-10 ${getScoreStyle(aiScoreResult.score)}`}>
                  {getScoreLabel(aiScoreResult.score)}
                </div>
              </div>

              {/* Markdown Column */}
              <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar bg-zinc-50/50 dark:bg-transparent">
                <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none 
                  prose-headings:font-bold prose-headings:tracking-tight 
                  prose-p:leading-relaxed">
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
