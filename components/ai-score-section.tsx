import { useState } from "react";
import { Loader2, Sparkles, AlertCircle, RefreshCw, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TeamSummary, Objective, ContributorSum } from "@/lib/types/okr";

interface AIScoreSectionProps {
  teamSummary: TeamSummary | null;
  dashboardData: {
    summary: TeamSummary | null;
    objectives: Objective[];
    contributors: ContributorSum[];
    atRisk: Objective[];
  };
}

export function AIScoreSection({ teamSummary, dashboardData }: AIScoreSectionProps) {
  const [isGeneratingScore, setIsGeneratingScore] = useState(false);
  const [aiScoreResult, setAiScoreResult] = useState<{ score: number; review: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetAIScore = async () => {
    if (!teamSummary) return;
    
    setIsGeneratingScore(true);
    setError(null);
    try {
      const response = await fetch('/api/ai-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboardData })
      });
      
      if (!response.ok) throw new Error('Failed to generate score');
      
      const data = await response.json();
      setAiScoreResult(data);
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถสร้างคะแนนประเมินได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
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
    <section className="w-full max-w-7xl mx-auto mb-10">
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm transition-all duration-500 overflow-hidden">
        
        {/* Uninitialized State */}
        {!aiScoreResult && !isGeneratingScore && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  AI Performance Insight
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  ให้ AI ช่วยวิเคราะห์ผลงานและให้คำแนะนำแบบเจาะลึกเพื่อขับเคลื่อนทีมของคุณ
                </p>
              </div>
            </div>
            <Button 
              onClick={handleGetAIScore}
              disabled={!teamSummary}
              className="w-full sm:w-auto bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-full px-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insight
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isGeneratingScore && (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mb-4" />
            <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-1">Analyzing Data</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">กำลังวิเคราะห์ข้อมูลผลงานของทีม...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isGeneratingScore && (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <AlertCircle className="w-8 h-8 text-destructive mb-3" />
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={handleGetAIScore} className="mt-4 rounded-full">
              Try Again
            </Button>
          </div>
        )}

        {/* Result State */}
        {aiScoreResult && !isGeneratingScore && (
          <div className="flex flex-col animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/20">
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">AI Analysis Complete</span>
              </div>
              <Button 
                onClick={handleGetAIScore}
                variant="ghost"
                size="sm"
                className="h-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Re-analyze
              </Button>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row">
              {/* Score Column */}
              <div className="md:w-[280px] shrink-0 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
                <div className="text-[5rem] leading-none font-semibold tracking-tighter text-zinc-900 dark:text-white mb-3">
                  {aiScoreResult.score}<span className="text-3xl text-zinc-300 dark:text-zinc-700 font-normal">/10</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${getScoreStyle(aiScoreResult.score)}`}>
                  {getScoreLabel(aiScoreResult.score)}
                </div>
              </div>

              {/* Markdown Column */}
              <div className="flex-1 p-6 md:p-8 bg-zinc-50/30 dark:bg-zinc-900/10">
                <div className="prose prose-zinc dark:prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-li:text-zinc-600 dark:prose-li:text-zinc-400">
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
