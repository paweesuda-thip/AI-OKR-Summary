import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface DeltaRowProps {
    label: string;
    current: number;
    previous: number;
    delta: number;
    unit?: string;
    invert?: boolean;
}

const DeltaRow = ({ label, current, previous, delta, unit = '%', invert = false }: DeltaRowProps) => {
    const isPositive = invert ? delta < 0 : delta > 0;
    const isZero = delta === 0;
    
    const color = isZero ? 'text-slate-400' : isPositive ? 'text-emerald-400' : 'text-rose-400';
    
    return (
        <div className="flex items-center gap-2 sm:gap-4 py-4 border-b border-slate-700/50 last:border-0 hover:bg-slate-800/20 transition-colors px-2 -mx-2 rounded-lg">
            <span className="text-sm sm:text-base text-slate-300 font-medium flex-1">{label}</span>
            <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-sm sm:text-base text-slate-500 w-16 sm:w-20 text-right tabular-nums hidden xs:inline-block">
                    {previous?.toFixed(1)}{unit}
                </span>
                <span className="text-slate-600 hidden xs:inline-block">→</span>
                <span className="text-sm sm:text-base text-white w-16 sm:w-20 text-right font-semibold tabular-nums">
                    {current?.toFixed(1)}{unit}
                </span>
                <div className={`flex items-center justify-end w-20 sm:w-24 gap-1 ${color}`}>
                    {!isZero && (isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />)}
                    {isZero && <Minus className="w-4 h-4 opacity-50" />}
                    <span className="text-sm sm:text-base font-bold tabular-nums">
                        {Math.abs(delta)?.toFixed(1)}{unit}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function PeriodComparisonSection({ comparison }: { comparison: any }) {
    if (!comparison) return null;

    const {
        currentCompletionRate, previousCompletionRate, completionRateDelta,
        currentAvgProgress, previousAvgProgress, avgProgressDelta,
        currentCheckInCount, previousCheckInCount, checkInCountDelta,
        progressTrend, engagementTrend,
    } = comparison;

    const overallHealth = avgProgressDelta > 10 ? 'Excellent' : avgProgressDelta > 0 ? 'Improving' : avgProgressDelta === 0 ? 'Stable' : 'Declining';
    
    const healthStyles: Record<string, string> = {
        'Excellent': 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        'Improving': 'bg-sky-500/15 border-sky-500/30 text-sky-400',
        'Stable': 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        'Declining': 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    };

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 bg-slate-900/50 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-white">Period Comparison</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">vs. previous cycle</p>
                    </div>
                </div>
                <Badge variant="outline" className={`text-sm px-3 py-1 ${healthStyles[overallHealth]}`}>
                    {overallHealth}
                </Badge>
            </CardHeader>

            <CardContent className="p-6 flex flex-col gap-6">
                {/* Trend badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-sky-400" />
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Velocity</p>
                        </div>
                        <p className="text-sm sm:text-base font-medium text-sky-200">{progressTrend}</p>
                    </div>
                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Engagement</p>
                        </div>
                        <p className="text-sm sm:text-base font-medium text-amber-200">{engagementTrend}</p>
                    </div>
                </div>

                <div className="bg-slate-800/20 rounded-xl border border-slate-700/50 p-4 sm:p-5">
                    {/* Column headers */}
                    <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-500 uppercase tracking-wider font-bold mb-2 px-2 pb-2 border-b border-slate-800">
                        <span className="flex-1">Metric</span>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <span className="w-16 sm:w-20 text-right hidden xs:inline-block">Prev</span>
                            <span className="w-4 hidden xs:inline-block" />
                            <span className="w-16 sm:w-20 text-right text-slate-400">Curr</span>
                            <span className="w-20 sm:w-24 text-right">Change</span>
                        </div>
                    </div>

                    {/* Delta rows */}
                    <div className="flex flex-col">
                        <DeltaRow
                            label="Completion Rate"
                            current={currentCompletionRate}
                            previous={previousCompletionRate}
                            delta={completionRateDelta}
                            unit="%"
                        />
                        <DeltaRow
                            label="Avg. Progress"
                            current={currentAvgProgress}
                            previous={previousAvgProgress}
                            delta={avgProgressDelta}
                            unit="%"
                        />
                        <DeltaRow
                            label="Check-ins"
                            current={currentCheckInCount}
                            previous={previousCheckInCount}
                            delta={checkInCountDelta}
                            unit=""
                        />
                    </div>
                </div>

                {/* Summary callout */}
                <div className={`rounded-xl p-4 text-sm sm:text-base leading-relaxed flex items-start gap-3 border ${
                    avgProgressDelta >= 0
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}>
                    <div className={`mt-0.5 shrink-0 ${avgProgressDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {avgProgressDelta >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                    </div>
                    <p>
                        {avgProgressDelta >= 0
                            ? `Team improved by ${avgProgressDelta?.toFixed(1)}% compared to the previous cycle`
                            : `Team declined by ${Math.abs(avgProgressDelta)?.toFixed(1)}% from the previous cycle`}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
