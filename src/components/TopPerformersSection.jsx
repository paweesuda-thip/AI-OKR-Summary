const medals = ['🥇', '🥈', '🥉'];

const medalColors = [
    { border: 'border-amber-400/40',  bg: 'bg-gradient-to-b from-amber-500/12 to-amber-600/5',   scoreColor: 'text-amber-300',  barColor: 'bg-amber-400',  rankBg: 'bg-amber-500/15 text-amber-300',  ringColor: 'ring-amber-400/30',  headerBg: 'bg-amber-500/10'  },
    { border: 'border-slate-400/30',  bg: 'bg-gradient-to-b from-slate-400/8 to-slate-500/5',    scoreColor: 'text-slate-200',  barColor: 'bg-slate-400',  rankBg: 'bg-slate-400/15 text-slate-300',  ringColor: 'ring-slate-400/20',  headerBg: 'bg-slate-400/8'   },
    { border: 'border-orange-500/35', bg: 'bg-gradient-to-b from-orange-600/10 to-orange-700/5', scoreColor: 'text-orange-300', barColor: 'bg-orange-500', rankBg: 'bg-orange-500/15 text-orange-300', ringColor: 'ring-orange-500/25', headerBg: 'bg-orange-500/10' },
];

const statusDot = {
    'On Track': 'bg-emerald-400',
    'At Risk':  'bg-amber-400',
    'Behind':   'bg-rose-400',
};

const TopPerformersSection = ({ contributors, aiSummary = null, aiLoading = false }) => {
    const top3 = (contributors || []).slice(0, 3);
    const rest  = (contributors || []).slice(3);

    if (top3.length === 0) {
        return (
            <div className="section-panel">
                <div className="section-header-plain">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Top Performers</h2>
                </div>
                <div className="flex items-center justify-center py-16 text-slate-500 text-base">
                    No contributor data available
                </div>
            </div>
        );
    }

    return (
        <div className="section-panel">
            <div className="section-header-plain">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Top Performers</h2>
                    <p className="text-base text-slate-500 mt-0.5">Ranked by objective progress · highest check-ins as tiebreaker</p>
                </div>
            </div>

            <div className="p-8 flex flex-col gap-8">
                {/* Top 3 — horizontal 3-column grid */}
                <div className="performers-top-grid">
                    {top3.map((person, i) => {
                        const colors = medalColors[i];
                        const aiPersonSummary = aiSummary?.rankings?.[i];

                        return (
                            <div
                                key={person.fullName}
                                className={`rounded-2xl border ${colors.border} ${colors.bg} ring-1 ${colors.ringColor} flex flex-col`}
                            >
                                {/* Card header */}
                                <div className={`performer-card-head ${colors.headerBg}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-4xl leading-none">{medals[i]}</span>
                                        {person.pictureURL && (
                                            <img
                                                src={person.pictureURL}
                                                alt={person.fullName}
                                                className="w-12 h-12 rounded-full object-cover bg-slate-700 ring-2 ring-slate-600 shrink-0"
                                                onError={e => { e.target.style.display = 'none'; }}
                                            />
                                        )}
                                        <span className={`text-sm px-3 py-1 rounded-full font-bold ${colors.rankBg}`}>
                                            #{i + 1}
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-white leading-tight truncate mb-1">
                                        {person.fullName}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {person.krCount} KR{person.krCount !== 1 ? 's' : ''} · {person.checkInCount} check-in{person.checkInCount !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                {/* Objective Progress */}
                                <div className="performer-card-score">
                                    <div className="flex items-end justify-between mb-3">
                                        <span className="text-sm text-slate-500 font-medium">Avg Objective Progress</span>
                                        <span className={`text-2xl font-bold tabular-nums ${colors.scoreColor}`}>
                                            {person.avgObjectiveProgress}
                                            <span className="text-sm font-normal ml-0.5 text-slate-500">%</span>
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-slate-700/70 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${colors.barColor} transition-all`}
                                            style={{ width: `${Math.min(person.avgObjectiveProgress, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* OKR contributions */}
                                {person.objectives && person.objectives.length > 0 && (
                                    <div className="performer-card-okrs">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                                            OKR Contributions ({person.objectives.length})
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            {person.objectives.slice(0, 3).map((okr, oi) => (
                                                <div key={oi} className="flex items-center gap-2.5">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[okr.status] || 'bg-slate-500'}`} />
                                                    <span className="flex-1 text-sm text-slate-300 truncate leading-snug">
                                                        {okr.objectiveName}
                                                    </span>
                                                    <span className="text-sm text-slate-500 shrink-0 tabular-nums font-medium">
                                                        {okr.progress?.toFixed(0)}%
                                                    </span>
                                                </div>
                                            ))}
                                            {person.objectives.length > 3 && (
                                                <p className="text-xs text-slate-600 pl-4">
                                                    +{person.objectives.length - 3} more
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* AI summary */}
                                {aiPersonSummary && (
                                    <div className="performer-card-ai">
                                        <div className="flex gap-2.5">
                                            <span className="text-indigo-400 text-sm shrink-0 mt-0.5">✦</span>
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                {aiPersonSummary.summary}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {!aiPersonSummary && aiLoading && (
                                    <div className="px-6 pb-6 flex items-center gap-2.5">
                                        <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm text-slate-500">AI analyzing...</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* AI Team Summary */}
                {aiSummary?.teamSummary && (
                    <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-2xl p-6">
                        <div className="flex items-center gap-2.5 mb-3">
                            <span className="text-indigo-400 text-lg">✦</span>
                            <p className="text-sm font-bold text-indigo-300 uppercase tracking-wide">AI Team Overview</p>
                        </div>
                        <p className="text-base text-slate-300 leading-relaxed">{aiSummary.teamSummary}</p>
                    </div>
                )}

                {/* Other Members */}
                {rest.length > 0 && (
                    <div>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="flex-1 h-px bg-slate-700/50" />
                            <span className="text-sm text-slate-600 uppercase tracking-wider font-medium">Other Members</span>
                            <div className="flex-1 h-px bg-slate-700/50" />
                        </div>
                        <div className="performers-rest-grid">
                            {rest.map((person, i) => (
                                <div key={person.fullName} className="performer-rest-row">
                                    <span className="text-base text-slate-600 w-6 text-right font-mono tabular-nums">{i + 4}</span>
                                    {person.pictureURL && (
                                        <img
                                            src={person.pictureURL}
                                            alt={person.fullName}
                                            className="w-9 h-9 rounded-full object-cover bg-slate-700 shrink-0"
                                            onError={e => { e.target.style.display = 'none'; }}
                                        />
                                    )}
                                    <span className="flex-1 text-base text-slate-300 truncate font-medium">{person.fullName}</span>
                                    <span className="text-sm text-slate-500">{person.checkInCount} check-ins</span>
                                    <span className="text-base font-semibold text-slate-400 tabular-nums">
                                        {person.avgObjectiveProgress}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopPerformersSection;
