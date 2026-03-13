import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import ShinyText from "@/components/react-bits/ShinyText";

interface PeriodComparisonData {
    currentCompletionRate: number;
    previousCompletionRate: number;
    completionRateDelta: number;
    currentAvgProgress: number;
    previousAvgProgress: number;
    avgProgressDelta: number;
    currentCheckInCount: number;
    previousCheckInCount: number;
    checkInCountDelta: number;
    progressTrend: string;
    engagementTrend: string;
}

export default function PeriodComparisonSection({ comparison }: { comparison: PeriodComparisonData | null }) {
    if (!comparison) return null;

    const {
        currentCompletionRate, completionRateDelta,
        currentAvgProgress, avgProgressDelta,
        currentCheckInCount, checkInCountDelta,
        progressTrend, engagementTrend,
    } = comparison;

    const overallHealth = avgProgressDelta > 10 ? 'Excellent' : avgProgressDelta > 0 ? 'Improving' : avgProgressDelta === 0 ? 'Stable' : 'Declining';
    
    const healthStyles: Record<string, string> = {
        'Excellent': 'text-emerald-500',
        'Improving': 'text-sky-500',
        'Stable': 'text-amber-500',
        'Declining': 'text-rose-500',
    };

    return (
        <div className="w-full flex flex-col gap-12">
            {/* ── Summary Callout ── */}
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                <div className={`inline-flex items-center justify-center p-4 rounded-full mb-6 bg-background/50 border border-border/30 shadow-2xl backdrop-blur-xl ${healthStyles[overallHealth]}`}>
                    {avgProgressDelta >= 0 ? <TrendingUp className="w-8 h-8" /> : <TrendingUp className="w-8 h-8 rotate-180" />}
                </div>
                <ShinyText 
                    text={overallHealth.toUpperCase()} 
                    className={`text-sm tracking-[0.3em] font-bold mb-4 ${healthStyles[overallHealth]}`}
                    speed={3} 
                />
                <h3 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
                    {avgProgressDelta >= 0
                        ? `Team improved by ${avgProgressDelta?.toFixed(1)}% compared to the previous cycle`
                        : `Team declined by ${Math.abs(avgProgressDelta)?.toFixed(1)}% from the previous cycle`}
                </h3>
            </div>

            {/* ── Big Numbers Layout ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/40 rounded-3xl overflow-hidden backdrop-blur-sm border border-border/50">
                {/* Metric 1: Completion */}
                <div className="bg-background/40 p-8 md:p-12 flex flex-col items-center text-center hover:bg-background/60 transition-colors">
                    <p className="text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase mb-6">Completion</p>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
                            {currentCompletionRate?.toFixed(1)}<span className="text-3xl md:text-4xl text-muted-foreground/50">%</span>
                        </span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${completionRateDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {completionRateDelta >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        <span className="text-lg">{Math.abs(completionRateDelta)?.toFixed(1)}% vs prev</span>
                    </div>
                </div>

                {/* Metric 2: Avg Progress */}
                <div className="bg-background/40 p-8 md:p-12 flex flex-col items-center text-center hover:bg-background/60 transition-colors">
                    <p className="text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase mb-6">Avg Progress</p>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
                            {currentAvgProgress?.toFixed(1)}<span className="text-3xl md:text-4xl text-muted-foreground/50">%</span>
                        </span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${avgProgressDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {avgProgressDelta >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        <span className="text-lg">{Math.abs(avgProgressDelta)?.toFixed(1)}% vs prev</span>
                    </div>
                </div>

                {/* Metric 3: Check-ins */}
                <div className="bg-background/40 p-8 md:p-12 flex flex-col items-center text-center hover:bg-background/60 transition-colors">
                    <p className="text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase mb-6">Total Check-ins</p>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
                            {currentCheckInCount}
                        </span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${checkInCountDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {checkInCountDelta >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        <span className="text-lg">{Math.abs(checkInCountDelta)} vs prev</span>
                    </div>
                </div>
            </div>

            {/* ── AI Insights Text ── */}
            <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto px-4">
                <div className="flex-1">
                    <h4 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-3 border-l-2 border-sky-500 pl-3">Velocity Insight</h4>
                    <p className="text-lg text-foreground/90 font-medium leading-relaxed">{progressTrend}</p>
                </div>
                <div className="w-px bg-border/50 hidden md:block" />
                <div className="flex-1">
                    <h4 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-3 border-l-2 border-amber-500 pl-3">Engagement Insight</h4>
                    <p className="text-lg text-foreground/90 font-medium leading-relaxed">{engagementTrend}</p>
                </div>
            </div>
        </div>
    );
}
