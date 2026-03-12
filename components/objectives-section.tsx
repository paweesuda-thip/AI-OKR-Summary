"use client";

import { useState } from 'react';
import { Target, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Objective, KrDetail } from "@/lib/types/okr";

const statusConfig: Record<string, { color: string; bg: string; dot: string; barColor: string }> = {
    'On Track': { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400', barColor: 'bg-emerald-500' },
    'At Risk':  { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/25',     dot: 'bg-amber-400',   barColor: 'bg-amber-500'   },
    'Behind':   { color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/25',       dot: 'bg-rose-400',    barColor: 'bg-rose-500'    },
};

const ContributorCard = ({ d, rank, rankType }: { d: KrDetail, rank: number, rankType: 'top' | 'bottom' }) => {
    const rankColors = {
        top:    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', badge: 'bg-emerald-500/15 text-emerald-300', bar: 'bg-emerald-500' },
        bottom: { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    badge: 'bg-rose-500/15 text-rose-400',       bar: 'bg-rose-500'    },
    };
    const rc = rankColors[rankType];

    return (
        <div className={`rounded-xl border ${rc.bg} ${rc.border} p-4`}>
            <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-8 h-8 rounded-full border border-slate-700/50">
                    <AvatarImage src={d.pictureURL} alt={d.fullName} />
                    <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">{d.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-semibold text-slate-200 truncate">{d.fullName}</span>
                <Badge variant="outline" className={`border-none ${rc.badge}`}>
                    #{rank}
                </Badge>
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

const ObjectiveRow = ({ obj, rank }: { obj: Objective, rank: number }) => {
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
        <Collapsible 
            open={expanded} 
            onOpenChange={setExpanded}
            className={`rounded-2xl border ${st.bg} overflow-hidden`}
        >
            <CollapsibleTrigger className="w-full text-left p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-slate-800/30 transition-colors group">
                <span className="text-sm text-slate-600 font-mono tabular-nums w-5 shrink-0 hidden sm:inline-block">#{rank}</span>
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${st.dot}`} />

                <span className="flex-1 text-base sm:text-lg text-slate-200 font-medium leading-snug truncate">
                    {obj.objectiveName}
                </span>

                {obj.ownerTeam && (
                    <Badge variant="secondary" className="hidden md:inline-flex bg-slate-700/40 text-slate-400 border-slate-600/50 hover:bg-slate-700/40">
                        {obj.ownerTeam}
                    </Badge>
                )}

                <span className={`hidden sm:inline-block text-sm font-semibold shrink-0 ${st.color} w-20`}>{obj.status}</span>

                <div className="w-24 sm:w-40 shrink-0 flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 h-2.5 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                        <div
                            className={`h-full ${st.barColor} rounded-full transition-all`}
                            style={{ width: `${Math.min(obj.progress, 100)}%` }}
                        />
                    </div>
                    <span className="text-sm sm:text-base text-slate-400 w-10 sm:w-12 text-right tabular-nums font-semibold">
                        {obj.progress?.toFixed(0)}%
                    </span>
                </div>

                <div className="text-slate-500 group-hover:text-slate-300 transition-colors shrink-0">
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="px-4 sm:px-5 pb-5">
                {totalCount === 0 ? (
                    <p className="text-sm text-slate-500 mt-2">No contributor details available</p>
                ) : (
                    <div className="mt-2 flex flex-col gap-5 border-t border-slate-700/50 pt-4">
                        {/* Overview bar */}
                        <div className="bg-slate-800/50 rounded-xl px-4 py-4 border border-slate-700/30">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Objective Overview</span>
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    </div>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
};

const INITIAL_SHOW = 4;

export default function ObjectivesSection({ objectives }: { objectives: Objective[] }) {
    const [filter, setFilter] = useState('All');
    const [showAll, setShowAll] = useState(false);
    const filters = ['All', 'On Track', 'At Risk', 'Behind'];

    const handleFilter = (f: string) => { setFilter(f); setShowAll(false); };

    // Sort by progress DESC before filtering
    const sorted = [...(objectives || [])].sort((a, b) => b.progress - a.progress);
    const filtered = filter === 'All' ? sorted : sorted.filter(o => o.status === filter);
    const visible = showAll ? filtered : filtered.slice(0, INITIAL_SHOW);
    const hiddenCount = filtered.length - INITIAL_SHOW;

    const counts: Record<string, number> = {
        'On Track': (objectives || []).filter(o => o.status === 'On Track').length,
        'At Risk':  (objectives || []).filter(o => o.status === 'At Risk').length,
        'Behind':   (objectives || []).filter(o => o.status === 'Behind').length,
    };

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden h-full mt-8">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/50 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                        <Target className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-white">Objectives</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">Sorted by progress — highest first</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {filters.map(f => {
                        const count = f === 'All' ? (objectives || []).length : counts[f];
                        return (
                            <Button
                                key={f}
                                variant={filter === f ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => handleFilter(f)}
                                className={`rounded-xl ${
                                    filter === f
                                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/30 hover:text-indigo-200'
                                        : 'border-slate-700 bg-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                {f}
                                {f !== 'All' && count > 0 && (
                                    <span className="ml-2 text-xs opacity-70 bg-slate-800/50 px-1.5 py-0.5 rounded-md">{count}</span>
                                )}
                            </Button>
                        );
                    })}
                </div>
            </CardHeader>

            <div className="px-6 py-3 bg-slate-800/30 border-b border-slate-800 flex flex-wrap items-center gap-4 sm:gap-6 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-400">On Track: <span className="font-semibold text-emerald-400">{counts['On Track']}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-400">At Risk: <span className="font-semibold text-amber-400">{counts['At Risk']}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="text-slate-400">Behind: <span className="font-semibold text-rose-400">{counts['Behind']}</span></span>
                </div>
            </div>

            <CardContent className="p-6">
                {filtered.length === 0 ? (
                    <div className="flex items-center justify-center py-16 text-slate-500 text-base flex-col gap-3">
                        <Target className="w-10 h-10 opacity-20" />
                        <p>No objectives found in this category</p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="flex flex-col gap-3">
                            {visible.map((obj, idx) => (
                                <ObjectiveRow key={obj.objectiveId} obj={obj} rank={idx + 1} />
                            ))}
                        </div>

                        {!showAll && hiddenCount > 0 && (
                            <div className="relative mt-[-40px] pt-4">
                                <div className="absolute top-[-60px] left-0 right-0 h-20 bg-linear-to-t from-slate-900 to-transparent pointer-events-none" />
                                <div className="relative z-10">
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 rounded-xl border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-slate-100"
                                        onClick={() => setShowAll(true)}
                                    >
                                        <ChevronDown className="mr-2 w-5 h-5" />
                                        Show {hiddenCount} more objective{hiddenCount > 1 ? 's' : ''}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {showAll && filtered.length > INITIAL_SHOW && (
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200"
                                    onClick={() => setShowAll(false)}
                                >
                                    <ChevronUp className="mr-2 w-5 h-5" />
                                    Show less
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
