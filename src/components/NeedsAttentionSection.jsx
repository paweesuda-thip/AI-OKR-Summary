import { useState } from 'react';

const statusDot = {
    'On Track': 'bg-emerald-400',
    'At Risk':  'bg-amber-400',
    'Behind':   'bg-rose-400',
};

const INITIAL_SHOW = 6;

const NeedsAttentionSection = ({ contributors }) => {
    const [showAll, setShowAll] = useState(false);

    // Show employees who have checked in but have low avgObjectiveProgress (< 70%)
    // Sorted by avgObjectiveProgress ASC (lowest first)
    const atRiskContributors = [...(contributors || [])]
        .filter(c => c.checkInCount > 0 && c.avgObjectiveProgress < 70)
        .sort((a, b) => a.avgObjectiveProgress - b.avgObjectiveProgress);

    const visible = showAll ? atRiskContributors : atRiskContributors.slice(0, INITIAL_SHOW);
    const hiddenCount = atRiskContributors.length - INITIAL_SHOW;

    return (
        <div className="section-panel h-full">
            <div className="section-header">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Needs Attention</h2>
                        <p className="text-base text-slate-500 mt-1">Employees with low objective progress — sorted lowest first</p>
                    </div>
                </div>
                {atRiskContributors.length > 0 && (
                    <span className="text-base px-4 py-2 bg-rose-500/15 text-rose-300 border border-rose-500/25 rounded-full font-semibold">
                        {atRiskContributors.length} employee{atRiskContributors.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="flex-1 flex flex-col">
                {atRiskContributors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-16 gap-4">
                        <span className="text-5xl">🎉</span>
                        <p className="text-xl text-emerald-400 font-bold">Everyone is On Track</p>
                        <p className="text-base text-slate-500">No employees need attention right now</p>
                    </div>
                ) : (
                    <>
                        <div className="section-insight-bar">
                            <span className="text-slate-500">
                                Showing employees below <span className="text-rose-400 font-semibold">70%</span> objective progress who have checked in
                            </span>
                        </div>

                        <div className="relative">
                            <div className="p-6 flex flex-col gap-4">
                                {visible.map((person, i) => {
                                    const progressColor = person.avgObjectiveProgress < 40
                                        ? 'text-rose-400'
                                        : 'text-amber-400';
                                    const barColor = person.avgObjectiveProgress < 40
                                        ? 'bg-rose-500'
                                        : 'bg-amber-500';

                                    return (
                                        <div
                                            key={person.fullName}
                                            className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 flex items-start gap-5"
                                        >
                                            {/* Rank */}
                                            <span className="text-sm text-slate-600 font-mono tabular-nums w-5 shrink-0 pt-1">{i + 1}</span>

                                            {/* Avatar */}
                                            {person.pictureURL ? (
                                                <img
                                                    src={person.pictureURL}
                                                    alt={person.fullName}
                                                    className="w-11 h-11 rounded-full object-cover bg-slate-700 shrink-0"
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-11 h-11 rounded-full bg-slate-700 shrink-0 flex items-center justify-center text-slate-400 font-bold">
                                                    {person.fullName.charAt(0)}
                                                </div>
                                            )}

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-base font-semibold text-slate-200 truncate">{person.fullName}</p>
                                                    <div className="flex items-center gap-3 shrink-0 ml-4">
                                                        <span className="text-sm text-slate-500">{person.checkInCount} check-in{person.checkInCount !== 1 ? 's' : ''}</span>
                                                        <span className={`text-xl font-bold tabular-nums ${progressColor}`}>
                                                            {person.avgObjectiveProgress}%
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden mb-3">
                                                    <div
                                                        className={`h-full ${barColor} rounded-full transition-all`}
                                                        style={{ width: `${Math.min(person.avgObjectiveProgress, 100)}%` }}
                                                    />
                                                </div>

                                                {/* Objectives list */}
                                                {person.objectives && person.objectives.length > 0 && (
                                                    <div className="flex flex-col gap-1.5">
                                                        {person.objectives.slice(0, 2).map((okr, oi) => (
                                                            <div key={oi} className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[okr.status] || 'bg-slate-500'}`} />
                                                                <span className="flex-1 text-sm text-slate-400 truncate">{okr.objectiveName}</span>
                                                                <span className="text-sm text-slate-500 shrink-0 tabular-nums">{okr.progress?.toFixed(0)}%</span>
                                                            </div>
                                                        ))}
                                                        {person.objectives.length > 2 && (
                                                            <p className="text-xs text-slate-600 pl-4">+{person.objectives.length - 2} more objectives</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {!showAll && hiddenCount > 0 && (
                                <div className="relative mt-[-80px] px-6 pb-2">
                                    <div className="h-20 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                                    <div className="bg-slate-900 pt-1 pb-2">
                                        <button
                                            onClick={() => setShowAll(true)}
                                            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-base font-medium transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            Show {hiddenCount} more
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showAll && atRiskContributors.length > INITIAL_SHOW && (
                                <div className="px-6 pb-6">
                                    <button
                                        onClick={() => setShowAll(false)}
                                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-base font-medium transition-all"
                                    >
                                        <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                        Show less
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NeedsAttentionSection;
