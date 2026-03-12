"use client";

import { useState } from 'react';
import { Target, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Objective, KrDetail } from "@/lib/types/okr";

const statusConfig: Record<string, { color: string; bg: string; dot: string; barColor: string }> = {
    'On Track': { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20', dot: 'bg-emerald-500', barColor: 'bg-emerald-500' },
    'At Risk':  { color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20',     dot: 'bg-amber-500',   barColor: 'bg-amber-500'   },
    'Behind':   { color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20',       dot: 'bg-rose-500',    barColor: 'bg-rose-500'    },
};

const ContributorCard = ({ d, rank, rankType }: { d: KrDetail, rank: number, rankType: 'top' | 'bottom' }) => {
    const rankColors = {
        top:    { bg: 'bg-emerald-50 dark:bg-emerald-500/5', border: 'border-emerald-200 dark:border-emerald-500/20', badge: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-500' },
        bottom: { bg: 'bg-rose-50 dark:bg-rose-500/5',    border: 'border-rose-200 dark:border-rose-500/20',    badge: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400',       bar: 'bg-rose-500'    },
    };
    const rc = rankColors[rankType];

    return (
        <div className={`rounded-xl border ${rc.bg} ${rc.border} p-4 shadow-sm`}>
            <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-8 h-8 rounded-full border border-border">
                    <AvatarImage src={d.pictureURL} alt={d.fullName} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">{d.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-semibold text-foreground truncate">{d.fullName}</span>
                <Badge variant="outline" className={`border-none ${rc.badge}`}>
                    #{rank}
                </Badge>
                <span className={`text-sm font-bold tabular-nums flex items-center gap-1 ${
                    d.isDone ? 'text-emerald-600 dark:text-emerald-400' : d.krProgress < 40 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                    {d.isDone ? <Check className="w-4 h-4" /> : `${d.krProgress}%`}
                </span>
            </div>
            <p className="text-xs text-muted-foreground leading-snug mb-2 pl-11 truncate">{d.krTitle}</p>
            <div className="pl-11 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                    <div
                        className={`h-full rounded-full ${d.isDone ? 'bg-emerald-500' : rc.bar} transition-all`}
                        style={{ width: `${Math.min(d.krProgress, 100)}%` }}
                    />
                </div>
                <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{d.pointCurrent}/{d.pointOKR}pts</span>
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
            className={`rounded-2xl border ${st.bg} overflow-hidden shadow-sm transition-all hover:shadow-md`}
        >
            <CollapsibleTrigger className="w-full text-left p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-muted/30 transition-colors group">
                <span className="text-sm text-muted-foreground font-mono tabular-nums w-5 shrink-0 hidden sm:inline-block">#{rank}</span>
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-sm ${st.dot}`} />

                <span className="flex-1 text-base sm:text-lg text-foreground font-semibold leading-snug truncate">
                    {obj.objectiveName}
                </span>

                {obj.ownerTeam && (
                    <Badge variant="secondary" className="hidden md:inline-flex bg-background text-muted-foreground border-border shadow-sm">
                        {obj.ownerTeam}
                    </Badge>
                )}

                <span className={`hidden sm:inline-block text-sm font-bold shrink-0 ${st.color} w-20`}>{obj.status}</span>

                <div className="w-24 sm:w-40 shrink-0 flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden hidden sm:block shadow-inner">
                        <div
                            className={`h-full ${st.barColor} rounded-full transition-all`}
                            style={{ width: `${Math.min(obj.progress, 100)}%` }}
                        />
                    </div>
                    <span className="text-sm sm:text-base text-muted-foreground w-10 sm:w-12 text-right tabular-nums font-bold">
                        {obj.progress?.toFixed(0)}%
                    </span>
                </div>

                <div className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="px-4 sm:px-5 pb-5 bg-background/50">
                {totalCount === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">No contributor details available</p>
                ) : (
                    <div className="mt-2 flex flex-col gap-5 border-t border-border pt-4">
                        {/* Overview bar */}
                        <div className="bg-background rounded-xl px-4 py-4 border border-border shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Objective Overview</span>
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium">
                                    <span className="text-muted-foreground">Contributors: <span className="text-foreground font-bold">{totalCount}</span></span>
                                    <span className="text-muted-foreground">KRs done: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{doneCount}/{totalCount}</span></span>
                                    <span className="text-muted-foreground">Avg KR progress: <span className="text-foreground font-bold">{avgKrProgress}%</span></span>
                                </div>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden shadow-inner">
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
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Top Performers</span>
                                    <div className="flex-1 h-px bg-emerald-200 dark:bg-emerald-500/20" />
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
                                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Needs Attention</span>
                                        <div className="flex-1 h-px bg-rose-200 dark:bg-rose-500/20" />
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
        <Card className="border-border shadow-sm overflow-hidden h-full mt-8">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 bg-muted/10 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                        <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-foreground tracking-tight">Objectives</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Sorted by progress — highest first</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {filters.map(f => {
                        const count = f === 'All' ? (objectives || []).length : counts[f];
                        return (
                            <Button
                                key={f}
                                variant={filter === f ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleFilter(f)}
                                className={`rounded-lg shadow-sm ${
                                    filter === f
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                {f}
                                {f !== 'All' && count > 0 && (
                                    <span className="ml-2 text-xs font-semibold opacity-90 bg-background/20 text-current px-1.5 py-0.5 rounded-md border border-current/10">{count}</span>
                                )}
                            </Button>
                        );
                    })}
                </div>
            </CardHeader>

            <div className="px-6 py-3 bg-background border-b border-border flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-medium">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-muted-foreground">On Track: <span className="font-bold text-emerald-600 dark:text-emerald-400">{counts['On Track']}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
                    <span className="text-muted-foreground">At Risk: <span className="font-bold text-amber-600 dark:text-amber-400">{counts['At Risk']}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                    <span className="text-muted-foreground">Behind: <span className="font-bold text-rose-600 dark:text-rose-400">{counts['Behind']}</span></span>
                </div>
            </div>

            <CardContent className="p-6 bg-muted/5">
                {filtered.length === 0 ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground text-base flex-col gap-3">
                        <Target className="w-10 h-10 opacity-20" />
                        <p className="font-medium">No objectives found in this category</p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="flex flex-col gap-4">
                            {visible.map((obj, idx) => (
                                <ObjectiveRow key={obj.objectiveId} obj={obj} rank={idx + 1} />
                            ))}
                        </div>

                        {!showAll && hiddenCount > 0 && (
                            <div className="relative mt-[-40px] pt-4">
                                <div className="absolute top-[-60px] left-0 right-0 h-20 bg-linear-to-t from-background to-transparent pointer-events-none" />
                                <div className="relative z-10 flex justify-center">
                                    <Button
                                        variant="outline"
                                        className="h-12 px-8 rounded-xl border-border bg-background shadow-sm hover:bg-muted/50 text-foreground font-semibold"
                                        onClick={() => setShowAll(true)}
                                    >
                                        <ChevronDown className="mr-2 w-5 h-5" />
                                        Show {hiddenCount} more objective{hiddenCount > 1 ? 's' : ''}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {showAll && filtered.length > INITIAL_SHOW && (
                            <div className="mt-6 flex justify-center">
                                <Button
                                    variant="outline"
                                    className="h-12 px-8 rounded-xl border-border bg-background shadow-sm hover:bg-muted/50 text-muted-foreground font-semibold"
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
