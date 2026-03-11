import { useState } from 'react';

const INITIAL_SHOW = 4;

const severityConfig = {
    'Behind': {
        bg: 'bg-rose-500/8',
        border: 'border-rose-500/20',
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
        bar: 'bg-rose-500',
        label: 'Critical',
    },
    'At Risk': {
        bg: 'bg-amber-500/8',
        border: 'border-amber-500/20',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
        bar: 'bg-amber-500',
        label: 'Warning',
    },
};

const AtRiskSection = ({ atRiskObjectives }) => {
    const [expandedObj, setExpandedObj] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const hasRisk = atRiskObjectives && atRiskObjectives.length > 0;

    const critical = (atRiskObjectives || []).filter(o => o.status === 'Behind');
    const warning  = (atRiskObjectives || []).filter(o => o.status === 'At Risk');
    const allRisk  = [...critical, ...warning];
    const visible  = showAll ? allRisk : allRisk.slice(0, INITIAL_SHOW);
    const hiddenCount = allRisk.length - INITIAL_SHOW;

    const avgProgress = hasRisk
        ? Math.round(atRiskObjectives.reduce((s, o) => s + (o.progress || 0), 0) / atRiskObjectives.length)
        : 0;

    const allDetails = hasRisk ? atRiskObjectives.flatMap(o => o.details || []) : [];
    const totalKRs = allDetails.length;
    const completedKRs = allDetails.filter(d => d.isDone).length;

    const toggleExpand = (id) => setExpandedObj(prev => prev === id ? null : id);

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
                        <p className="text-base text-slate-500 mt-1">Objectives at risk of missing targets</p>
                    </div>
                </div>
                {hasRisk && (
                    <div className="flex items-center gap-3">
                        {critical.length > 0 && (
                            <span className="text-base px-4 py-2 bg-rose-500/15 text-rose-300 border border-rose-500/25 rounded-full font-semibold">
                                {critical.length} critical
                            </span>
                        )}
                        {warning.length > 0 && (
                            <span className="text-base px-4 py-2 bg-amber-500/15 text-amber-300 border border-amber-500/25 rounded-full font-semibold">
                                {warning.length} warning
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col">
                {!hasRisk ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-16 gap-4">
                        <span className="text-5xl">✅</span>
                        <p className="text-xl text-emerald-400 font-bold">All On Track</p>
                        <p className="text-base text-slate-500">No objectives need attention right now</p>
                    </div>
                ) : (
                    <>
                        <div className="section-insight-bar">
                            <div className="flex items-center gap-2.5">
                                <span className="text-slate-500">Avg progress</span>
                                <span className={`font-bold text-lg ${avgProgress < 40 ? 'text-rose-400' : 'text-amber-400'}`}>{avgProgress}%</span>
                            </div>
                            <div className="h-5 w-px bg-slate-700" />
                            <div className="flex items-center gap-2.5">
                                <span className="text-slate-500">KRs done</span>
                                <span className="font-bold text-lg text-slate-300">{completedKRs}/{totalKRs}</span>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="risk-list">
                            {visible.map((obj) => {
                                const cfg = severityConfig[obj.status] || severityConfig['At Risk'];
                                const isExpanded = expandedObj === obj.objectiveId;
                                const gap = 70 - (obj.progress || 0);
                                const details = obj.details || [];
                                const doneDetails = details.filter(d => d.isDone);

                                return (
                                    <div key={obj.objectiveId} className={`rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                                        <button onClick={() => toggleExpand(obj.objectiveId)} className="risk-row">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-semibold text-slate-100 leading-snug truncate">
                                                    {obj.objectiveName}
                                                </p>
                                                {obj.ownerTeam && (
                                                    <p className="text-sm text-slate-500 mt-1.5">{obj.ownerTeam}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                                <div className="text-right">
                                                    <span className={`text-xl font-bold tabular-nums ${obj.progress < 40 ? 'text-rose-400' : 'text-amber-400'}`}>
                                                        {obj.progress?.toFixed(0)}%
                                                    </span>
                                                    <p className="text-xs text-slate-500 mt-0.5">need +{gap > 0 ? gap.toFixed(0) : 0}%</p>
                                                </div>
                                                <span className={`text-sm px-3 py-1.5 rounded-lg border font-semibold ${cfg.badge}`}>
                                                    {cfg.label}
                                                </span>
                                                <svg
                                                    className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </button>

                                        <div className="risk-bar-wrap">
                                            <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${cfg.bar} rounded-full transition-all`}
                                                    style={{ width: `${obj.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="risk-expanded">
                                                <div className="flex flex-wrap gap-3">
                                                    {gap > 30 && (
                                                        <span className="text-base px-4 py-2.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-xl">
                                                            📉 {gap.toFixed(0)}% gap to On Track
                                                        </span>
                                                    )}
                                                    {doneDetails.length > 0 && (
                                                        <span className="text-base px-4 py-2.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl">
                                                            ✓ {doneDetails.length}/{details.length} KRs completed
                                                        </span>
                                                    )}
                                                </div>

                                                {details.length > 0 && (
                                                    <div className="flex flex-col gap-4">
                                                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Key Results</p>
                                                        {details.map((d, i) => (
                                                            <div key={i} className="risk-kr-card">
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    {d.pictureURL && (
                                                                        <img
                                                                            src={d.pictureURL}
                                                                            alt={d.fullName}
                                                                            className="w-8 h-8 rounded-full object-cover bg-slate-700 shrink-0"
                                                                            onError={e => { e.target.style.display = 'none'; }}
                                                                        />
                                                                    )}
                                                                    <span className="text-sm text-slate-400 font-medium">{d.fullName}</span>
                                                                    <span className={`ml-auto text-base font-bold tabular-nums shrink-0 ${
                                                                        d.isDone ? 'text-emerald-400' : d.krProgress < 40 ? 'text-rose-400' : 'text-amber-400'
                                                                    }`}>
                                                                        {d.isDone ? '✓ Done' : `${d.krProgress}%`}
                                                                    </span>
                                                                </div>
                                                                <p className="text-base text-slate-300 font-medium leading-snug mb-3">{d.krTitle}</p>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all ${
                                                                                d.isDone ? 'bg-emerald-400' : d.krProgress < 40 ? 'bg-rose-500' : 'bg-amber-500'
                                                                            }`}
                                                                            style={{ width: `${Math.min(d.krProgress, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-sm text-slate-500 shrink-0 tabular-nums">
                                                                        {d.pointCurrent} / {d.pointOKR} pts
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl px-6 py-5">
                                                    <p className="text-base font-semibold text-indigo-400 mb-2">💡 Suggested Action</p>
                                                    <p className="text-base text-slate-300 leading-relaxed">
                                                        {gap > 40
                                                            ? `This objective is ${gap.toFixed(0)}% behind the On Track threshold. Consider re-scoping targets or reallocating resources to close the gap.`
                                                            : details.length > 0 && details.every(d => d.krProgress < 30)
                                                            ? `All key results are below 30% progress. Review blockers with each contributor and prioritize the highest-impact KR first.`
                                                            : `Review key results with contributors and identify blockers preventing further progress.`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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

                            {showAll && allRisk.length > INITIAL_SHOW && (
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
                    </>
                )}
            </div>
        </div>
    );
};

export default AtRiskSection;
