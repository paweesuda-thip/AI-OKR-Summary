const DeltaRow = ({ label, current, previous, delta, unit = '%', invert = false }) => {
    const isPositive = invert ? delta < 0 : delta > 0;
    const color = isPositive ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-slate-400';
    const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '━';

    return (
        <div className="flex items-center gap-4 py-4 border-b border-slate-700/30 last:border-0">
            <span className="text-base text-slate-400 flex-1">{label}</span>
            <span className="text-base text-slate-500 w-20 text-right tabular-nums">{previous?.toFixed(1)}{unit}</span>
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-base text-white w-20 text-right font-semibold tabular-nums">{current?.toFixed(1)}{unit}</span>
            <span className={`text-base font-bold w-20 text-right tabular-nums ${color}`}>
                {arrow} {Math.abs(delta)?.toFixed(1)}{unit}
            </span>
        </div>
    );
};

const PeriodComparisonSection = ({ comparison }) => {
    if (!comparison) return null;

    const {
        currentCompletionRate, previousCompletionRate, completionRateDelta,
        currentAvgProgress, previousAvgProgress, avgProgressDelta,
        currentCheckInCount, previousCheckInCount, checkInCountDelta,
        progressTrend, engagementTrend,
    } = comparison;

    const overallHealth = avgProgressDelta > 10 ? 'Excellent' : avgProgressDelta > 0 ? 'Improving' : avgProgressDelta === 0 ? 'Stable' : 'Declining';
    const healthColor = overallHealth === 'Excellent' ? 'text-emerald-400' :
        overallHealth === 'Improving' ? 'text-sky-400' :
        overallHealth === 'Stable' ? 'text-amber-400' : 'text-rose-400';
    const healthBg = overallHealth === 'Excellent' ? 'bg-emerald-500/15 border-emerald-500/30' :
        overallHealth === 'Improving' ? 'bg-sky-500/15 border-sky-500/30' :
        overallHealth === 'Stable' ? 'bg-amber-500/15 border-amber-500/30' : 'bg-rose-500/15 border-rose-500/30';

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-700/50 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Period Comparison</h2>
                        <p className="text-base text-slate-500 mt-0.5">vs. previous cycle</p>
                    </div>
                </div>
                <span className={`text-sm font-bold px-4 py-1.5 rounded-xl border ${healthBg} ${healthColor}`}>
                    {overallHealth}
                </span>
            </div>

            <div className="p-8 flex flex-col gap-6">
                {/* Trend badges */}
                <div className="flex gap-4">
                    <div className="flex-1 bg-slate-800/60 rounded-xl px-5 py-4 border border-slate-700/50">
                        <p className="text-sm text-slate-500 uppercase tracking-wide mb-2 font-medium">Velocity</p>
                        <p className="text-base font-semibold text-sky-300">{progressTrend}</p>
                    </div>
                    <div className="flex-1 bg-slate-800/60 rounded-xl px-5 py-4 border border-slate-700/50">
                        <p className="text-sm text-slate-500 uppercase tracking-wide mb-2 font-medium">Engagement</p>
                        <p className="text-base font-semibold text-amber-300">{engagementTrend}</p>
                    </div>
                </div>

                {/* Column headers */}
                <div className="flex items-center gap-4 text-sm text-slate-600 uppercase tracking-wider font-medium px-0">
                    <span className="flex-1">Metric</span>
                    <span className="w-20 text-right">Previous</span>
                    <span className="w-4" />
                    <span className="w-20 text-right text-slate-400">Current</span>
                    <span className="w-20 text-right">Change</span>
                </div>

                {/* Delta rows */}
                <div>
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

                {/* Summary callout */}
                <div className={`rounded-xl px-5 py-4 text-base leading-relaxed ${
                    avgProgressDelta >= 0
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}>
                    {avgProgressDelta >= 0
                        ? `Team improved by ${avgProgressDelta?.toFixed(1)}% compared to the previous cycle`
                        : `Team declined by ${Math.abs(avgProgressDelta)?.toFixed(1)}% from the previous cycle`}
                </div>
            </div>
        </div>
    );
};

export default PeriodComparisonSection;
