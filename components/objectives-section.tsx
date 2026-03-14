"use client";

import { useState } from 'react';
import { Target, ChevronDown, ChevronUp, Users, Target as TargetIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Objective } from "@/lib/types/okr";
import SpotlightCard from "@/components/react-bits/SpotlightCard";

const statusConfig: Record<string, { color: string; bg: string; dot: string; barColor: string; hoverBorder: string; badgeBg: string }> = {
    'On Track': { color: 'text-emerald-500', bg: 'bg-emerald-500/5', dot: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]', barColor: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]', hoverBorder: 'hover:border-emerald-500/50', badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    'At Risk':  { color: 'text-amber-500',   bg: 'bg-amber-500/5',     dot: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]',   barColor: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]',   hoverBorder: 'hover:border-amber-500/50', badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20'   },
    'Behind':   { color: 'text-rose-500',    bg: 'bg-rose-500/5',       dot: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]',    barColor: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]',    hoverBorder: 'hover:border-rose-500/50', badgeBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20'    },
};

const ObjectiveCard = ({ obj, rank }: { obj: Objective, rank: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const st = statusConfig[obj.status] || statusConfig['On Track'];

    // Sort details by krProgress DESC
    const sortedDetails = [...(obj.details || [])].sort((a, b) => b.krProgress - a.krProgress);
    const totalCount = sortedDetails.length;
    const doneCount = sortedDetails.filter(d => d.isDone).length;
    
    // Get unique contributors
    const contributors = Array.from(new Map(sortedDetails.map(d => [d.fullName, d])).values());

    return (
        <SpotlightCard 
            className={`w-full rounded-3xl border border-border/30 bg-card/40 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl flex flex-col overflow-hidden cursor-pointer ${isExpanded ? 'shadow-xl bg-background/60' : ''}`}
            spotlightColor="rgba(255, 255, 255, 0.05)"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="p-6 md:p-8 flex flex-col relative z-10">
                {/* Header Section */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground/50 tracking-widest">#{rank}</span>
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                            <Badge variant="outline" className={`px-3 py-1 font-bold tracking-wider uppercase text-[10px] ${st.badgeBg}`}>
                                {obj.status}
                            </Badge>
                        </div>
                    </div>
                    {obj.ownerTeam && (
                        <Badge variant="secondary" className="px-3 py-1 bg-background/50 text-muted-foreground border-border/50 text-xs shrink-0 max-w-[140px] truncate">
                            {obj.ownerTeam}
                        </Badge>
                    )}
                </div>
                
                <h3 className={`text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight mb-8 transition-all duration-300 min-h-14 line-clamp-2 ${isExpanded ? 'text-transparent bg-clip-text bg-linear-to-r from-foreground to-muted-foreground' : ''}`}>
                    {obj.objectiveName}
                </h3>

                {/* Main Progress Block */}
                <div className="mt-auto mb-8">
                    <div className="flex items-end justify-between mb-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Overall Progress</p>
                        <div className="flex items-baseline gap-0.5">
                            <span className={`text-4xl font-bold tracking-tighter tabular-nums ${st.color}`}>
                                {obj.progress?.toFixed(0)}
                            </span>
                            <span className="text-lg text-muted-foreground/60 font-bold">%</span>
                        </div>
                    </div>
                    
                    <div className="h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner relative">
                        <div className={`absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 z-10 ${isExpanded ? 'translate-x-full' : '-translate-x-full'}`} />
                        <div
                            className={`h-full ${st.barColor} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${Math.min(obj.progress || 0, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/30 shrink-0">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TargetIcon className="w-4 h-4 text-primary/70" />
                            <p className="text-xs font-bold uppercase tracking-widest">Key Results</p>
                        </div>
                        <p className="text-lg font-bold text-foreground pl-6">
                            <span className="text-emerald-500">{doneCount}</span> / {totalCount} Done
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4 text-primary/70" />
                            <p className="text-xs font-bold uppercase tracking-widest">Team</p>
                        </div>
                        <div className="flex -space-x-2 pl-6">
                            {contributors.slice(0, 3).map((c, i) => (
                                <Avatar key={i} className="w-8 h-8 border-2 border-background shadow-sm">
                                    <AvatarImage src={c.pictureURL} alt={c.fullName} />
                                    <AvatarFallback className="bg-muted text-xs font-bold">{c.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            ))}
                            {contributors.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow-sm text-xs font-bold text-muted-foreground">
                                    +{contributors.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expandable Area (Key Results) */}
                <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] mt-6' : 'grid-rows-[0fr] mt-0'}`}>
                    <div className={`overflow-hidden min-h-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100 delay-200' : 'opacity-0 delay-0'}`}>
                        <div className="pt-6 border-t border-border/30">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Key Results Breakdown</p>
                                <Button variant="ghost" size="sm" className="h-6 text-xs px-2 rounded-full font-semibold hover:bg-background/80 transition-all pointer-events-none">
                                    {isExpanded ? 'Hide' : 'View'} Details <ChevronUp className={`w-3 h-3 ml-1 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`} />
                                </Button>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                {sortedDetails.slice(0, 3).map((kr, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-3 rounded-2xl bg-background/40 border border-border/30 hover:bg-background/80 transition-colors">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                <Avatar className="w-6 h-6 border shrink-0 shadow-sm">
                                                    <AvatarImage src={kr.pictureURL} />
                                                    <AvatarFallback className="text-[10px]">{kr.fullName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <p className="text-sm font-medium text-foreground/90 truncate">{kr.krTitle}</p>
                                            </div>
                                            <span className="text-xs font-bold tabular-nums shrink-0 bg-background/50 px-2 py-1 rounded-md border border-border/40">
                                                {kr.isDone ? 'Done' : `${kr.krProgress}%`}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-1">
                                            <div 
                                                className={`h-full rounded-full transition-all ${kr.isDone ? 'bg-emerald-500' : kr.krProgress < 40 ? 'bg-rose-500' : 'bg-amber-500'}`}
                                                style={{ width: `${Math.min(kr.krProgress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {sortedDetails.length > 3 && (
                                    <div className="text-center pt-2 pb-1">
                                        <p className="text-xs font-semibold text-muted-foreground/70 hover:text-foreground cursor-pointer transition-colors inline-flex items-center gap-1">
                                            See {sortedDetails.length - 3} more key results <ChevronDown className="w-3 h-3" />
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </SpotlightCard>
    );
};

const INITIAL_SHOW = 4;

const mockObjectives: Objective[] = [
    {
        objectiveId: 1,
        objectiveName: "Launch Next-Gen AI Product Features",
        objectiveName_EN: "Launch Next-Gen AI Product Features",
        ownerName: "Alice Smith",
        status: "On Track",
        progress: 78,
        ownerTeam: "Product & Engineering",
        details: [
            { krTitle: "Integrate LLM API", krProgress: 90, isDone: false, pointCurrent: 9, pointOKR: 10, fullName: "Alice Smith", pictureURL: "https://i.pravatar.cc/150?u=a" },
            { krTitle: "Build new UI components", krProgress: 100, isDone: true, pointCurrent: 5, pointOKR: 5, fullName: "Bob Johnson", pictureURL: "https://i.pravatar.cc/150?u=b" },
            { krTitle: "Write documentation", krProgress: 40, isDone: false, pointCurrent: 2, pointOKR: 5, fullName: "Charlie Davis", pictureURL: "https://i.pravatar.cc/150?u=c" }
        ]
    },
    {
        objectiveId: 2,
        objectiveName: "Expand Market Share in APAC Region",
        objectiveName_EN: "Expand Market Share in APAC Region",
        ownerName: "David Lee",
        status: "At Risk",
        progress: 45,
        ownerTeam: "Sales & Marketing",
        details: [
            { krTitle: "Hire 5 new sales reps", krProgress: 20, isDone: false, pointCurrent: 1, pointOKR: 5, fullName: "David Lee", pictureURL: "https://i.pravatar.cc/150?u=d" },
            { krTitle: "Launch marketing campaign in Japan", krProgress: 60, isDone: false, pointCurrent: 3, pointOKR: 5, fullName: "Eva Chen", pictureURL: "https://i.pravatar.cc/150?u=e" }
        ]
    },
    {
        objectiveId: 3,
        objectiveName: "Improve System Reliability & Performance",
        objectiveName_EN: "Improve System Reliability & Performance",
        ownerName: "Frank Wright",
        status: "Behind",
        progress: 25,
        ownerTeam: "Infrastructure",
        details: [
            { krTitle: "Reduce latency by 20%", krProgress: 10, isDone: false, pointCurrent: 1, pointOKR: 10, fullName: "Frank Wright", pictureURL: "https://i.pravatar.cc/150?u=f" },
            { krTitle: "Migrate database to new cluster", krProgress: 30, isDone: false, pointCurrent: 3, pointOKR: 10, fullName: "Grace Kim", pictureURL: "https://i.pravatar.cc/150?u=g" }
        ]
    }
];

export default function ObjectivesSection({ objectives }: { objectives: Objective[] }) {
    // Use mock data if objectives is empty for testing UI
    const displayObjectives = objectives && objectives.length > 0 ? objectives : mockObjectives;

    const [filter, setFilter] = useState('All');
    const [showAll, setShowAll] = useState(false);
    const filters = ['All', 'On Track', 'At Risk', 'Behind'];

    const handleFilter = (f: string) => { setFilter(f); setShowAll(false); };

    // Sort by progress DESC before filtering
    const sorted = [...(displayObjectives || [])].sort((a, b) => b.progress - a.progress);
    const filtered = filter === 'All' ? sorted : sorted.filter(o => o.status === filter);
    const visible = showAll ? filtered : filtered.slice(0, INITIAL_SHOW);
    const hiddenCount = filtered.length - INITIAL_SHOW;

    const counts: Record<string, number> = {
        'On Track': (displayObjectives || []).filter(o => o.status === 'On Track').length,
        'At Risk':  (displayObjectives || []).filter(o => o.status === 'At Risk').length,
        'Behind':   (displayObjectives || []).filter(o => o.status === 'Behind').length,
    };

    return (
        <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/30 pb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <Target className="w-8 h-8 text-primary" />
                        Objectives
                    </h2>
                    <p className="text-lg text-muted-foreground mt-2">Sorted by progress — highest first</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {filters.map(f => {
                        const count = f === 'All' ? (displayObjectives || []).length : counts[f];
                        return (
                            <Button
                                key={f}
                                variant={filter === f ? "default" : "outline"}
                                onClick={() => handleFilter(f)}
                                className={`rounded-full px-6 py-5 text-sm font-bold tracking-wide transition-all ${
                                    filter === f
                                        ? 'shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                        : 'bg-background/40 hover:bg-background/60 border-border/50'
                                }`}
                            >
                                {f}
                                {f !== 'All' && count > 0 && (
                                    <span className="ml-2 bg-background/50 px-2 py-0.5 rounded-md text-xs">{count}</span>
                                )}
                            </Button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 px-4 py-2 bg-muted/20 rounded-2xl border border-border/30 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">On Track: <span className="text-emerald-500">{counts['On Track']}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">At Risk: <span className="text-amber-500">{counts['At Risk']}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Behind: <span className="text-rose-500">{counts['Behind']}</span></span>
                </div>
            </div>

            <div className="w-full">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                            <Target className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground tracking-tight mb-2">No objectives found</h3>
                        <p className="text-muted-foreground">Try selecting a different filter category.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                            {visible.map((obj, idx) => (
                                <ObjectiveCard key={obj.objectiveId} obj={obj} rank={idx + 1} />
                            ))}
                        </div>

                        {!showAll && hiddenCount > 0 && (
                            <div className="mt-8 flex justify-center">
                                <Button
                                    variant="outline"
                                    className="h-14 px-10 rounded-full border-border/50 bg-background/40 backdrop-blur-md shadow-sm hover:bg-muted/50 text-foreground font-semibold text-base transition-all hover:scale-105"
                                    onClick={() => setShowAll(true)}
                                >
                                    <ChevronDown className="mr-2 w-5 h-5" />
                                    Load {hiddenCount} more objective{hiddenCount > 1 ? 's' : ''}
                                </Button>
                            </div>
                        )}
                        {showAll && filtered.length > INITIAL_SHOW && (
                            <div className="mt-8 flex justify-center">
                                <Button
                                    variant="outline"
                                    className="h-14 px-10 rounded-full border-border/50 bg-background/40 backdrop-blur-md shadow-sm hover:bg-muted/50 text-muted-foreground font-semibold text-base transition-all hover:scale-105"
                                    onClick={() => setShowAll(false)}
                                >
                                    <ChevronUp className="mr-2 w-5 h-5" />
                                    Show less
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
