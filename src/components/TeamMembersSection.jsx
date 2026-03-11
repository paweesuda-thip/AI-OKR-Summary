import { useState } from 'react';

const TeamMembersSection = ({ teamMembers = [] }) => {
    const [expanded, setExpanded] = useState(false);

    if (!teamMembers || teamMembers.length === 0) return null;

    const activeCount   = teamMembers.filter(m => m.employeeStatus === 1).length;
    const inactiveCount = teamMembers.filter(m => m.employeeStatus === 2).length;
    const resignedCount = teamMembers.filter(m => m.employeeStatus === 3).length;

    return (
        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl">
            {/* Compact header bar */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors rounded-2xl"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h2 className="text-base font-bold text-white">Team Members</h2>
                    <span className="text-sm text-slate-500 font-medium">{teamMembers.length} members</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Stacked avatars */}
                    <div className="flex -space-x-2">
                        {teamMembers.slice(0, 8).map((m, i) => (
                            <img
                                key={m.employeeId}
                                src={m.picture}
                                alt={m.employeeName}
                                title={m.employeeName}
                                className="w-8 h-8 rounded-full object-cover bg-slate-700 border-2 border-slate-900"
                                style={{ zIndex: 8 - i }}
                                onError={(e) => {
                                    e.target.src =
                                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/%3E%3Ccircle cx="12" cy="7" r="4"/%3E%3C/svg%3E';
                                }}
                            />
                        ))}
                        {teamMembers.length > 8 && (
                            <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400 font-medium">
                                +{teamMembers.length - 8}
                            </div>
                        )}
                    </div>

                    {/* Status dots */}
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            {activeCount}
                        </span>
                        {inactiveCount > 0 && (
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                {inactiveCount}
                            </span>
                        )}
                        {resignedCount > 0 && (
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-400" />
                                {resignedCount}
                            </span>
                        )}
                    </div>

                    <svg
                        className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Expandable member list */}
            {expanded && (
                <div className="px-6 pb-5 border-t border-slate-700/50">
                    <div className="pt-4 flex flex-wrap gap-3">
                        {teamMembers.map((member) => (
                            <div
                                key={member.employeeId}
                                className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 hover:border-slate-600 transition-colors"
                            >
                                <img
                                    src={member.picture}
                                    alt={member.employeeName}
                                    className="w-8 h-8 rounded-full object-cover bg-slate-700"
                                    onError={(e) => {
                                        e.target.src =
                                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"%3E%3Cpath d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/%3E%3Ccircle cx="12" cy="7" r="4"/%3E%3C/svg%3E';
                                    }}
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate max-w-[140px]">{member.employeeName}</p>
                                    <p className="text-xs text-slate-500 truncate max-w-[140px]">{member.positionName}</p>
                                </div>
                                <span className={`w-2 h-2 rounded-full shrink-0 ${
                                    member.employeeStatus === 1 ? 'bg-emerald-400' :
                                    member.employeeStatus === 2 ? 'bg-amber-400' : 'bg-rose-400'
                                }`} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamMembersSection;
