import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, ArrowRight } from "lucide-react";

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
    
    const color = isZero ? 'text-muted-foreground' : isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
    
    return (
        <div className="flex items-center gap-2 sm:gap-4 py-4 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors px-3 -mx-3 rounded-lg">
            <span className="text-sm sm:text-base text-foreground font-semibold flex-1">{label}</span>
            <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-sm sm:text-base text-muted-foreground w-16 sm:w-20 text-right tabular-nums hidden xs:inline-block font-medium">
                    {previous?.toFixed(1)}{unit}
                </span>
                <span className="text-muted-foreground/50 hidden xs:inline-block">
                    <ArrowRight className="w-4 h-4" />
                </span>
                <span className="text-sm sm:text-base text-foreground w-16 sm:w-20 text-right font-bold tabular-nums">
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
        'Excellent': 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
        'Improving': 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-400',
        'Stable': 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400',
        'Declining': 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400',
    };

    return (
        <Card className="border-border shadow-sm overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/60 bg-muted/10 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-sm">
                        <TrendingUp className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-foreground tracking-tight">Period Comparison</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">vs. previous cycle</p>
                    </div>
                </div>
                <Badge variant="outline" className={`text-sm px-3 py-1 shadow-sm font-semibold ${healthStyles[overallHealth]}`}>
                    {overallHealth}
                </Badge>
            </CardHeader>

            <CardContent className="p-6 flex flex-col gap-6 bg-muted/5">
                {/* Trend badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-background rounded-xl p-5 border border-border flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm" />
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Velocity</p>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-foreground leading-snug">{progressTrend}</p>
                    </div>
                    <div className="bg-background rounded-xl p-5 border border-border flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Engagement</p>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-foreground leading-snug">{engagementTrend}</p>
                    </div>
                </div>

                <div className="bg-background rounded-xl border border-border p-4 sm:p-5 shadow-sm">
                    {/* Column headers */}
                    <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2 px-3 pb-3 border-b border-border">
                        <span className="flex-1">Metric</span>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <span className="w-16 sm:w-20 text-right hidden xs:inline-block">Prev</span>
                            <span className="w-4 hidden xs:inline-block" />
                            <span className="w-16 sm:w-20 text-right">Curr</span>
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
                <div className={`rounded-xl p-5 text-sm sm:text-base leading-relaxed flex items-start gap-4 border shadow-sm ${
                    avgProgressDelta >= 0
                        ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20'
                }`}>
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 border ${
                        avgProgressDelta >= 0 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' 
                            : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                    }`}>
                        {avgProgressDelta >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                    </div>
                    <div className="flex flex-col justify-center min-h-[2.5rem]">
                        <p className={`font-semibold ${avgProgressDelta >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                            {avgProgressDelta >= 0
                                ? `Team improved by ${avgProgressDelta?.toFixed(1)}% compared to the previous cycle`
                                : `Team declined by ${Math.abs(avgProgressDelta)?.toFixed(1)}% from the previous cycle`}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
