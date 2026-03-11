import { useState } from 'react';

const statusConfig = {
    'On Track': { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400', barColor: 'bg-emerald-500' },
    'At Risk':  { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/25',     dot: 'bg-amber-400',   barColor: 'bg-amber-500'   },
    'Behind':   { color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/25',       dot: 'bg-rose-400',    barColor: 'bg-rose-500'    },
};

const ContributorCard = ({ d, rank, rankType }) => {
    const rankColors = {
        top:    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', badge: 'bg-emerald-500/15 text-emerald-300', bar: 'bg-emerald-500' },
        bottom: { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    badge: 'bg-rose-500/15 text-rose-400',       bar: 'bg-rose-500'    },
    };
    const rc = rankColors[rankType];

    return (
        <div className={`rounded-xl border ${rc.bg} ${rc.border} p-4`}>
            <div className="flex items-center gap-3 mb-2">
                {d.pictureURL && (
                    <img
                        src={d.pictureURL}
                        alt={d.fullName}
                        className="w-8 h-8 rounded-full object-cover bg-slate-700 shrink-0"
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                )}
                <span className="flex-1 text-sm font-semibold text-slate-200 truncate">{d.fullName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${rc.badge}`}>
                    #{rank}
                </span>
                <span className={`text-sm font-bold tabular-nums ${
                    d.isDone ? 'text-emerald-400' : d.krProgress < 40 ? 'text-rose-400' : 'text-amber-400'
                }`}>
                    {d.isDone ? '✓' : `${d.krProgress}%`}
                </span>
            </div>
            <p className="text-xs text-slate-500 leading-snug mb-2 pl-11 truncate">{d.krTitle}</p>
            <div className="pl-11 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${d.isDone ? 'bg-emerald-400' : rc.bar} transition-all`}
                        style={{ width: `${Math.min(d.krProgress, 100)}%` }}
                    />
                </div>
                <span className="text-xs text-slate-600 shrink-0 tabular-nums">{d.pointCurrent}/{d.pointOKR}pts</span>
            </div>
        </div>
    );
};

const ObjectiveRow = ({ obj, rank }) => {
    const [expanded, setExpanded] = useState(false);
    const st = statusConfig[obj.status] || statusConfig['On Track'];

    // Sort details by krProgress DESC
    const sortedDetails = [...(obj.details || [])].sort((a, b) => b.krProgress - a.krProgress);
    const totalCount = sortedDetails.length;
    const top3 = sortedDetails.slice(0, Math.min(3, totalCount));
    const bottom3 = totalCount > 3 ? [...sortedDetails.slice(Math.max(3, totalCount - 3))].reverse() : [];

    const avgKrProgress = totalCount > 0
        ? Math.round(sortedDetails.reduce((s, d) => s + d.krProgress, 0) / totalCount)
        : 0;
    const doneCount = sortedDetails.filter(d => d.isDone).length;

    return (
        <div className={`rounded-2xl border ${st.bg} overflow-hidden`}>
            <button onClick={() => setExpanded(e => !e)} className="obj-row">
                <span className="text-sm text-slate-600 font-mono tabular-nums w-5 shrink-0">#{rank}</span>
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${st.dot}`} />

                <span className="flex-1 text-lg text-slate-200 font-medium leading-snug">
                    {obj.objectiveName}
                </span>

                {obj.ownerTeam && (
                    <span className="text-sm px-4 py-1.5 rounded-lg border border-slate-600/50 bg-slate-700/40 text-slate-400 font-medium shrink-0">
                        {obj.ownerTeam}
                    </span>
                )}

                <span className={`text-sm font-semibold shrink-0 ${st.color}`}>{obj.status}</span>

                <div className="w-40 shrink-0 flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${st.barColor} rounded-full transition-all`}
                            style={{ width: `${Math.min(obj.progress, 100)}%` }}
                        />
                    </div>
                    <span className="text-base text-slate-400 w-12 text-right tabular-nums font-semibold">
                        {obj.progress?.toFixed(0)}%
                    </span>
                </div>

                <svg
                    className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {expanded && (
                <div className="obj-expanded">
                    {totalCount === 0 ? (
                        <p className="text-base text-slate-500 mt-4">No contributor details available</p>
                    ) : (
                        <div className="mt-4 flex flex-col gap-5">
                            {/* Overview bar */}
                            <div className="bg-slate-800/50 rounded-xl px-5 py-4 border border-slate-700/30">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Objective Overview</span>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-slate-500">Contributors: <span className="text-slate-300 font-semibold">{totalCount}</span></span>
                                        <span className="text-slate-500">KRs done: <span className="text-emerald-400 font-semibold">{doneCount}/{totalCount}</span></span>
                                        <span className="text-slate-500">Avg KR progress: <span className="text-slate-300 font-semibold">{avgKrProgress}%</span></span>
                                    </div>
                                </div>
                                <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${st.barColor} rounded-full transition-all`}
                                        style={{ width: `${Math.min(obj.progress, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Top 3 */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Top Performers</span>
                                    <div className="flex-1 h-px bg-emerald-500/20" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    {top3.map((d, i) => (
                                        <ContributorCard key={i} d={d} rank={i + 1} rankType="top" />
                                    ))}
                                </div>
                            </div>

                            {/* Bottom 3 */}
                            {bottom3.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">Needs Attention</span>
                                        <div className="flex-1 h-px bg-rose-500/20" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {bottom3.map((d, i) => (
                                            <ContributorCard key={i} d={d} rank={totalCount - i} rankType="bottom" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const INITIAL_SHOW = 4;

const ObjectivesSection = ({ objectives }) => {
    const [filter, setFilter] = useState('All');
    const [showAll, setShowAll] = useState(false);
    const filters = ['All', 'On Track', 'At Risk', 'Behind'];

    const handleFilter = (f) => { setFilter(f); setShowAll(false); };

    // Sort by progress DESC before filtering
    const sorted = [...(objectives || [])].sort((a, b) => b.progress - a.progress);
    const filtered = filter === 'All' ? sorted : sorted.filter(o => o.status === filter);
    const visible = showAll ? filtered : filtered.slice(0, INITIAL_SHOW);
    const hiddenCount = filtered.length - INITIAL_SHOW;

    const counts = {
        'On Track': (objectives || []).filter(o => o.status === 'On Track').length,
        'At Risk':  (objectives || []).filter(o => o.status === 'At Risk').length,
        'Behind':   (objectives || []).filter(o => o.status === 'Behind').length,
    };

    return (
        <div className="section-panel h-full">
            <div className="section-header">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Objectives</h2>
                        <p className="text-base text-slate-500 mt-1">Sorted by progress — highest first</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {filters.map(f => {
                        const count = f === 'All' ? (objectives || []).length : counts[f];
                        return (
                            <button
                                key={f}
                                onClick={() => handleFilter(f)}
                                className={`flex items-center gap-2 text-base px-5 py-2.5 rounded-xl border transition-all ${
                                    filter === f
                                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-semibold'
                                        : 'border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                }`}
                            >
                                {f}
                                {f !== 'All' && count > 0 && (
                                    <span className="text-sm tabular-nums opacity-70">{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="section-insight-bar">
                <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-slate-400">On Track: <span className="font-semibold text-emerald-400">{counts['On Track']}</span></span>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-slate-400">At Risk: <span className="font-semibold text-amber-400">{counts['At Risk']}</span></span>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="text-slate-400">Behind: <span className="font-semibold text-rose-400">{counts['Behind']}</span></span>
                </div>
            </div>

            <div className="obj-list">
                {filtered.length === 0 ? (
                    <div className="flex items-center justify-center h-28 text-slate-500 text-base">
                        No objectives found in this category
                    </div>
                ) : (
                    <div className="relative">
                        <div className="flex flex-col gap-3">
                            {visible.map((obj, idx) => (
                                <ObjectiveRow key={obj.objectiveId} obj={obj} rank={idx + 1} />
                            ))}
                        </div>

                        {!showAll && hiddenCount > 0 && (
                            <div className="relative mt-[-80px]">
                                <div className="h-20 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                                <div className="bg-slate-900 pt-1 pb-2">
                                    <button
                                        onClick={() => setShowAll(true)}
                                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-base font-medium transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                        Show {hiddenCount} more objective{hiddenCount > 1 ? 's' : ''}
                                    </button>
                                </div>
                            </div>
                        )}

                        {showAll && filtered.length > INITIAL_SHOW && (
                            <div className="mt-3">
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
                )}
            </div>
        </div>
    );
};

export default ObjectivesSection;
