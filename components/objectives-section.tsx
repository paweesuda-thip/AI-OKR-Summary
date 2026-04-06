"use client";

import { useState } from 'react';
import { Target, ChevronDown, ChevronUp, Users, Target as TargetIcon, ArrowRight, Activity, Percent, TrendingUp } from "lucide-react";
import { AvatarInfoTooltip, AvatarOverflowTooltip } from "@/components/ui/avatar-tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Objective } from "@/lib/types/okr";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const statusConfig: Record<string, { color: string; bg: string; dot: string; barColor: string; hoverBorder: string; badgeBg: string }> = {
    'On Track': { color: 'text-emerald-500', bg: 'bg-emerald-500/5', dot: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]', barColor: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]', hoverBorder: 'hover:border-emerald-500/50', badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    'At Risk':  { color: 'text-amber-500',   bg: 'bg-amber-500/5',     dot: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]',   barColor: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]',   hoverBorder: 'hover:border-amber-500/50', badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20'   },
    'Behind':   { color: 'text-rose-500',    bg: 'bg-rose-500/5',       dot: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]',    barColor: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]',    hoverBorder: 'hover:border-rose-500/50', badgeBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20'    },
};

const ObjectiveCard = ({ obj, rank }: { obj: Objective, rank: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const st = statusConfig[obj.status] || statusConfig['On Track'];

    // All details flattened to get total count
    const allDetails = obj.subObjectives?.flatMap(s => s.details) || obj.details || [];
    const totalCount = allDetails.length;
    const doneCount = allDetails.filter(d => d.isDone).length;
    
    // Get unique contributors
    const contributors = Array.from(new Map(allDetails.map(d => [d.fullName, d])).values());

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={<div className="h-full" />} nativeButton={false}>
                <SpotlightCard 
                    className="w-full h-full rounded-3xl border border-border/30 bg-card/40 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl flex flex-col overflow-hidden cursor-pointer hover:-translate-y-1 hover:border-primary/30"
                    spotlightColor="rgba(255, 255, 255, 0.05)"
                >
                        <div className="p-6 md:p-8 flex flex-col relative z-10 h-full">
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
                            
                            <h3 className={`text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight mb-8 transition-all duration-300 min-h-14 line-clamp-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-foreground group-hover:to-muted-foreground`}>
                                {obj.objectiveName}
                            </h3>

                            {/* Main Progress Block */}
                            <div className="mt-auto mb-8">
                                <div className="flex items-end justify-between mb-3">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Overall Quarter</p>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className={`text-4xl font-bold tracking-tighter tabular-nums ${st.color}`}>
                                            {obj.progress?.toFixed(0)}
                                        </span>
                                        <span className="text-lg text-muted-foreground/60 font-bold">%</span>
                                    </div>
                                </div>
                                
                                <div className="h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner relative">
                                    <div className={`absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 z-10 -translate-x-full group-hover:translate-x-full`} />
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
                                    <span className="text-emerald-500">{doneCount}</span> / {totalCount}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="w-4 h-4 text-primary/70" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Team</p>
                                </div>
                                    <div className="flex -space-x-2 pl-6">
                                        {contributors.slice(0, 3).map((c, i) => (
                                            <AvatarInfoTooltip
                                                key={i}
                                                fullName={c.fullName}
                                                pictureURL={c.pictureURL}
                                                avatarClassName="w-8 h-8 border-2 border-background shadow-sm"
                                                fallbackClassName="bg-muted text-xs font-bold"
                                                style={{ zIndex: 3 - i }}
                                            />
                                        ))}
                                        {contributors.length > 3 && (
                                            <AvatarOverflowTooltip
                                                members={contributors.map(c => ({
                                                    fullName: c.fullName,
                                                    pictureURL: c.pictureURL
                                                }))}
                                                hiddenCount={contributors.length - 3}
                                                label="Team members"
                                                triggerClassName="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-background shadow-sm text-xs font-bold text-muted-foreground z-0 cursor-help"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                View Details <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </SpotlightCard>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[95vw] md:max-w-5xl lg:max-w-7xl h-[90vh] bg-card/95 backdrop-blur-3xl border-border/50 shadow-2xl flex flex-col overflow-hidden rounded-4xl p-0">
                <div className="flex flex-col lg:flex-row h-full">
                    {/* Left Column - Header & Overall Progress */}
                    <div className="flex flex-col w-full lg:w-1/3 bg-background/50 border-r border-border/30 p-6 shrink-0 lg:overflow-y-auto">
                        <DialogHeader className="pb-6 mb-6 border-b border-border/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${st.bg} ${st.color}`}>
                                    <TargetIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <Badge variant="outline" className={`px-3 py-1 font-bold tracking-wider uppercase text-[10px] mb-1 ${st.badgeBg}`}>
                                        {obj.status}
                                    </Badge>
                                </div>
                            </div>
                            <DialogTitle className="text-2xl font-bold text-foreground leading-tight tracking-tight text-left">
                                {obj.objectiveName}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground flex flex-col gap-3 mt-6 text-left">
                                <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4" /> {contributors.length} Participants
                                </span>
                                <span className="flex items-center gap-2">
                                    <TargetIcon className="w-4 h-4" /> {totalCount} Key Results
                                </span>
                                <span className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> {(obj.subObjectives || []).length} Sub-Objectives
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        {/* Overall Progress inside modal */}
                        <div className="bg-background/80 border border-border/40 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Percent className="w-5 h-5 text-primary" /> Overall Quarter
                                </h4>
                                <span className={`text-3xl font-black tabular-nums ${st.color}`}>
                                    {obj.progress?.toFixed(0)}%
                                </span>
                            </div>
                            <div className="h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={`h-full ${st.barColor} rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${Math.min(obj.progress || 0, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sub-Objectives List */}
                    <ScrollArea className="flex-1 p-6 h-full bg-background/20">
                        <div className="space-y-6">
                            <h4 className="text-xl font-bold text-foreground mb-6 sticky top-0 bg-card/95 backdrop-blur-sm z-10 py-2">Sub-Objectives Breakdown</h4>
                            
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {(obj.subObjectives || []).map((sub, idx) => {
                                    const subSt = statusConfig[sub.status] || statusConfig['On Track'];

                                    return (
                                        <div key={sub.objectiveId || idx} className="bg-card/50 border border-border/40 rounded-3xl p-5 flex flex-col gap-4 shadow-sm hover:border-primary/20 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`w-2 h-2 rounded-full ${subSt.dot}`} />
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${subSt.color}`}>{sub.status}</span>
                                                        {sub.objectiveOwnerType === 2 && (
                                                            <Badge variant="outline" className="text-[10px] ml-2 py-0 h-4">Personal</Badge>
                                                        )}
                                                    </div>
                                                    <h5 className="text-sm font-bold text-foreground leading-snug line-clamp-2" title={sub.title}>{sub.title}</h5>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-xl font-black tabular-nums text-foreground">{sub.progress?.toFixed(0)}%</div>
                                                    {sub.progressUpdate > 0 && (
                                                        <div className="text-[10px] font-semibold text-emerald-500 flex items-center justify-end gap-1">
                                                            <TrendingUp className="w-3 h-3" /> +{sub.progressUpdate?.toFixed(1)}%
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden w-full">
                                                <div
                                                    className={`h-full ${subSt.barColor} rounded-full`}
                                                    style={{ width: `${Math.min(sub.progress || 0, 100)}%` }}
                                                />
                                            </div>

                                            {sub.details && sub.details.length > 0 && (
                                                <div className="mt-2 pt-3 border-t border-border/20">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                        <Users className="w-3 h-3" /> KRs ({sub.details.length})
                                                    </p>
                                                    <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                                                        {sub.details.map((kr, i) => (
                                                            <div key={i} className="flex items-center gap-2 bg-background/50 p-2 rounded-xl border border-border/30">
                                                                <AvatarInfoTooltip
                                                                    fullName={kr.fullName}
                                                                    pictureURL={kr.pictureURL}
                                                                    avatarClassName="w-6 h-6 border shadow-sm shrink-0"
                                                                    fallbackClassName="text-[8px]"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[11px] font-bold text-foreground truncate">{kr.fullName}</p>
                                                                    <p className="text-[9px] text-muted-foreground truncate">{kr.krTitle}</p>
                                                                </div>
                                                                <div className="shrink-0 text-right">
                                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${kr.isDone ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted border-border/50 text-foreground'}`}>
                                                                        {kr.isDone ? 'Done' : `${kr.krProgress}%`}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {(!obj.subObjectives || obj.subObjectives.length === 0) && obj.details && obj.details.length > 0 && (
                                <div className="bg-card/50 border border-border/40 rounded-4xl p-6 shadow-sm">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Direct Key Results</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {obj.details.map((kr, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-background/50 p-3 rounded-xl border border-border/30">
                                                <AvatarInfoTooltip
                                                    fullName={kr.fullName}
                                                    pictureURL={kr.pictureURL}
                                                    avatarClassName="w-8 h-8 border shadow-sm shrink-0"
                                                    fallbackClassName="text-[10px]"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{kr.fullName}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{kr.krTitle}</p>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${kr.isDone ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted border-border/50 text-foreground'}`}>
                                                        {kr.isDone ? 'Done' : `${kr.krProgress}%`}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const INITIAL_SHOW = 4;

export default function ObjectivesSection({ objectives = [] }: { objectives?: Objective[] }) {
    const displayObjectives = objectives || [];

    const [filter, setFilter] = useState('All');
    const [showAll, setShowAll] = useState(false);
    const filters = ['All', 'On Track', 'At Risk', 'Behind'];

    const handleFilter = (f: string) => { setFilter(f); setShowAll(false); };

    // Sort by progress DESC before filtering
    const sorted = [...displayObjectives].sort((a, b) => (b.progress || 0) - (a.progress || 0));
    const filtered = filter === 'All' ? sorted : sorted.filter(o => o.status === filter);
    const visible = showAll ? filtered : filtered.slice(0, INITIAL_SHOW);
    const hiddenCount = filtered.length - INITIAL_SHOW;

    const counts: Record<string, number> = {
        'On Track': displayObjectives.filter(o => o.status === 'On Track').length,
        'At Risk':  displayObjectives.filter(o => o.status === 'At Risk').length,
        'Behind':   displayObjectives.filter(o => o.status === 'Behind').length,
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
                                className={`rounded-full px-6 py-5 text-sm font-bold tracking-wide transition-all cursor-pointer ${
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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
