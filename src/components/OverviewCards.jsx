import { useState } from 'react';

const StatCard = ({ label, value, sub, icon, color }) => {
    const colorMap = {
        indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  icon: 'text-indigo-400',  iconBg: 'bg-indigo-500/15',  value: 'text-indigo-300'  },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', iconBg: 'bg-emerald-500/15', value: 'text-emerald-300' },
        amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   icon: 'text-amber-400',   iconBg: 'bg-amber-500/15',   value: 'text-amber-300'   },
        sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/30',     icon: 'text-sky-400',     iconBg: 'bg-sky-500/15',     value: 'text-sky-300'     },
        rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    icon: 'text-rose-400',    iconBg: 'bg-rose-500/15',    value: 'text-rose-300'    },
    };
    const c = colorMap[color] || colorMap.indigo;

    return (
        <div className={`stat-card border ${c.border} ${c.bg}`}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center ${c.icon}`}>
                    {icon}
                </div>
            </div>
            <div>
                <span className={`text-5xl font-bold leading-none ${c.value}`}>{value}</span>
            </div>
            {sub && <span className="text-base text-slate-500 leading-snug">{sub}</span>}
        </div>
    );
};

const OverviewCards = ({ summary }) => {
    const [activeTab, setActiveTab] = useState('current');

    if (!summary) return null;

    const {
        totalObjectives, completedObjectives, objectiveCompletionRate,
        totalKRs, completedKRs, krCompletionRate,
        avgObjectiveProgress, totalContributors, onTrackCount,
    } = summary;

    const tabs = [
        { id: 'current', label: 'Current Cycle' },
        { id: 'all', label: 'All Quarters' },
    ];

    return (
        <div className="section-panel">
            {/* Tab header */}
            <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Overview</h2>
                        <p className="text-sm text-slate-500 mt-0.5">OKR Progress Summary</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-slate-700/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40'
                                    : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats grid */}
            <div className="flex gap-5 p-6">
                <StatCard
                    label="Objectives"
                    value={`${completedObjectives}/${totalObjectives}`}
                    sub={`Completion rate ${objectiveCompletionRate?.toFixed(1)}%`}
                    color="indigo"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    }
                />
                <StatCard
                    label="Key Results"
                    value={`${completedKRs}/${totalKRs}`}
                    sub={`Completion rate ${krCompletionRate?.toFixed(1)}%`}
                    color="emerald"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    }
                />
                <StatCard
                    label="Avg Progress"
                    value={`${avgObjectiveProgress?.toFixed(1)}%`}
                    sub={activeTab === 'current' ? 'Current cycle average' : 'Average across all quarters'}
                    color="amber"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    }
                />
                <StatCard
                    label="Contributors"
                    value={totalContributors}
                    sub="Unique people with KR activity"
                    color="sky"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    }
                />
                <StatCard
                    label="On Track"
                    value={onTrackCount}
                    sub={`Out of ${totalObjectives} total objectives`}
                    color="rose"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Progress bar overview */}
            <div className="px-6 pb-6">
                <div className="bg-slate-800/40 rounded-xl px-6 py-4 border border-slate-700/30 flex items-center gap-6">
                    <span className="text-sm text-slate-500 shrink-0">
                        {activeTab === 'current' ? 'Current Cycle' : 'All Quarters'} — overall progress
                    </span>
                    <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-700/60 rounded-full overflow-hidden flex">
                            <div
                                className="h-full bg-emerald-500 rounded-l-full transition-all"
                                style={{ width: `${(onTrackCount / Math.max(totalObjectives, 1)) * 100}%` }}
                            />
                            <div
                                className="h-full bg-amber-500 transition-all"
                                style={{ width: `${((totalObjectives - onTrackCount - summary.behindCount) / Math.max(totalObjectives, 1)) * 100}%` }}
                            />
                            <div
                                className="h-full bg-rose-500 transition-all"
                                style={{ width: `${(summary.behindCount / Math.max(totalObjectives, 1)) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-semibold text-slate-300 tabular-nums shrink-0">{avgObjectiveProgress?.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm shrink-0">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /><span className="text-slate-400">On Track <span className="text-emerald-400 font-semibold">{onTrackCount}</span></span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /><span className="text-slate-400">At Risk <span className="text-amber-400 font-semibold">{summary.atRiskCount}</span></span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /><span className="text-slate-400">Behind <span className="text-rose-400 font-semibold">{summary.behindCount}</span></span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewCards;
