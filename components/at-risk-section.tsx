"use client";

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown, ChevronUp, Lightbulb, Activity, CheckCircle2, Check } from "lucide-react";
import { Objective, KrDetail } from "@/lib/types/okr";

const INITIAL_SHOW = 4;

const severityConfig: Record<string, { bg: string; border: string; badge: string; bar: string; label: string; icon: React.ReactNode }> = {
    'Behind': {
        bg: 'bg-rose-500/5 hover:bg-rose-500/10',
        border: 'border-rose-500/30 hover:border-rose-500/50',
        badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        bar: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]',
        label: 'Critical',
        icon: <Activity className="w-5 h-5 text-rose-500" />
    },
    'At Risk': {
        bg: 'bg-amber-500/5 hover:bg-amber-500/10',
        border: 'border-amber-500/30 hover:border-amber-500/50',
        badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        bar: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
        label: 'Warning',
        icon: <AlertCircle className="w-5 h-5 text-amber-500" />
    },
};

export default function AtRiskSection({ atRiskObjectives }: { atRiskObjectives: Objective[] }) {
    const [expandedObj, setExpandedObj] = useState<number | null>(null);
    const [showAll, setShowAll] = useState(false);
    
    // Fallback to empty array if undefined
    const objectivesList = atRiskObjectives || [];
    const hasRisk = objectivesList.length > 0;

    const critical = objectivesList.filter(o => o.status === 'Behind');
    const warning  = objectivesList.filter(o => o.status === 'At Risk');
    const allRisk  = [...critical, ...warning];
    const visible  = showAll ? allRisk : allRisk.slice(0, INITIAL_SHOW);
    const hiddenCount = allRisk.length - INITIAL_SHOW;

    const avgProgress = hasRisk
        ? Math.round(objectivesList.reduce((s, o) => s + (o.progress || 0), 0) / objectivesList.length)
        : 0;

    const allDetails = hasRisk ? objectivesList.flatMap(o => o.details || []) : [];
    const totalKRs = allDetails.length;
    const completedKRs = allDetails.filter(d => d.isDone).length;

    const toggleExpand = (id: number, isOpen: boolean) => setExpandedObj(isOpen ? id : null);

    if (!hasRisk) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-bold text-foreground tracking-tight mb-3">All Clear</h3>
                <p className="text-muted-foreground text-lg">No objectives are currently at risk.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border/30 pb-6">
                <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <Activity className="w-8 h-8 text-rose-500" />
                        Objectives At Risk
                    </h3>
                    <p className="text-muted-foreground text-lg mt-2">Goals needing immediate intervention</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {critical.length > 0 && (
                        <Badge variant="outline" className="text-base px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 border-rose-500/20 font-semibold backdrop-blur-md">
                            {critical.length} Critical
                        </Badge>
                    )}
                    {warning.length > 0 && (
                        <Badge variant="outline" className="text-base px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border-amber-500/20 font-semibold backdrop-blur-md">
                            {warning.length} Warning
                        </Badge>
                    )}
                </div>
            </div>

            {/* Insight Overview */}
            <div className="flex flex-wrap items-center gap-8 mb-8 p-6 bg-muted/20 rounded-3xl border border-border/30">
                <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Average Progress</p>
                    <p className={`text-4xl font-bold tracking-tighter ${avgProgress < 40 ? 'text-rose-500' : 'text-amber-500'}`}>
                        {avgProgress}%
                    </p>
                </div>
                <div className="w-px h-12 bg-border/50 hidden md:block" />
                <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">KRs Completed</p>
                    <p className="text-4xl font-bold tracking-tighter text-foreground">
                        {completedKRs}<span className="text-2xl text-muted-foreground/50">/{totalKRs}</span>
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {visible.map((obj) => {
                    const cfg = severityConfig[obj.status] || severityConfig['At Risk'];
                    const isExpanded = expandedObj === obj.objectiveId;
                    const gap = 70 - (obj.progress || 0);
                    const details = obj.details || [];
                    const doneDetails = details.filter((d: KrDetail) => d.isDone);

                    return (
                        <Collapsible 
                            key={obj.objectiveId}
                            open={isExpanded} 
                            onOpenChange={(isOpen) => toggleExpand(obj.objectiveId, isOpen)}
                            className={`rounded-3xl border ${cfg.bg} ${cfg.border} transition-all duration-300 overflow-hidden backdrop-blur-sm group`}
                        >
                            <CollapsibleTrigger className="w-full text-left p-6 sm:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            {cfg.icon}
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.badge} uppercase tracking-widest`}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <h4 className="text-xl sm:text-2xl font-bold text-foreground leading-snug truncate">
                                            {obj.objectiveName}
                                        </h4>
                                        {obj.ownerTeam && (
                                            <p className="text-base text-muted-foreground mt-2 font-medium">{obj.ownerTeam}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-8 md:shrink-0">
                                        <div className="flex flex-col items-start md:items-end gap-2">
                                            <span className={`text-4xl font-bold tracking-tighter tabular-nums ${obj.progress < 40 ? 'text-rose-500' : 'text-amber-500'}`}>
                                                {obj.progress?.toFixed(0)}%
                                            </span>
                                            <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                                                Gap: +{gap > 0 ? gap.toFixed(0) : 0}%
                                            </span>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-background/50 flex items-center justify-center border border-border/30 group-hover:bg-background transition-colors">
                                            {isExpanded ? <ChevronUp className="w-6 h-6 text-foreground" /> : <ChevronDown className="w-6 h-6 text-muted-foreground" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 h-3 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${cfg.bar}`}
                                        style={{ width: `${Math.min(obj.progress || 0, 100)}%` }}
                                    />
                                </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="px-6 sm:px-8 pb-8 pt-2">
                                <div className="w-full h-px bg-border/30 mb-6" />
                                
                                <div className="flex flex-wrap gap-3 mb-8">
                                    {gap > 30 && (
                                        <Badge variant="outline" className="text-sm px-4 py-2 bg-rose-500/10 text-rose-500 border-rose-500/20 rounded-full font-semibold">
                                            <Activity className="w-4 h-4 mr-2" /> 
                                            Critical gap to target
                                        </Badge>
                                    )}
                                    {doneDetails.length > 0 && (
                                        <Badge variant="outline" className="text-sm px-4 py-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full font-semibold">
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            {doneDetails.length}/{details.length} KRs done
                                        </Badge>
                                    )}
                                </div>

                                {details.length > 0 && (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
                                        {details.map((d: KrDetail, i: number) => (
                                            <div key={i} className="bg-background/40 border border-border/40 rounded-2xl p-5 hover:bg-background/60 transition-colors">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <Avatar className="w-10 h-10 border shadow-sm">
                                                        <AvatarImage src={d.pictureURL} alt={d.fullName} />
                                                        <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                                                            {d.fullName?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-base text-foreground font-semibold flex-1 truncate">{d.fullName}</span>
                                                    <span className={`text-base font-bold tabular-nums shrink-0 px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                                                        d.isDone ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 
                                                        d.krProgress < 40 ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 
                                                        'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                                    }`}>
                                                        {d.isDone ? <><Check className="w-4 h-4" /> Done</> : `${d.krProgress}%`}
                                                    </span>
                                                </div>
                                                <p className="text-base text-muted-foreground font-medium leading-relaxed mb-4">{d.krTitle}</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                                d.isDone ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                                                d.krProgress < 40 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 
                                                                'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                                            }`}
                                                            style={{ width: `${Math.min(d.krProgress, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-muted-foreground shrink-0 tabular-nums font-bold">
                                                        {d.pointCurrent} / {d.pointOKR} pts
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-primary/20">
                                        <Lightbulb className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary mb-2 uppercase tracking-widest">AI Suggested Action</p>
                                        <p className="text-lg text-foreground/90 font-medium leading-relaxed">
                                            {gap > 40
                                                ? `This objective is ${gap.toFixed(0)}% behind the On Track threshold. Consider re-scoping targets or reallocating resources immediately.`
                                                : details.length > 0 && details.every((d: KrDetail) => d.krProgress < 30)
                                                ? `All key results are below 30% progress. Review blockers with each contributor and prioritize the highest-impact KR first.`
                                                : `Review key results with contributors and identify bottlenecks preventing further progress.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </div>

            {!showAll && hiddenCount > 0 && (
                <div className="mt-8 flex justify-center">
                    <Button
                        variant="ghost"
                        className="rounded-full px-8 py-6 text-base font-semibold hover:bg-muted/50 transition-colors"
                        onClick={() => setShowAll(true)}
                    >
                        <ChevronDown className="w-5 h-5 mr-2" />
                        View {hiddenCount} more objective{hiddenCount !== 1 ? 's' : ''}
                    </Button>
                </div>
            )}

            {showAll && allRisk.length > INITIAL_SHOW && (
                <div className="mt-8 flex justify-center">
                    <Button
                        variant="ghost"
                        className="rounded-full px-8 py-6 text-base font-semibold hover:bg-muted/50 transition-colors"
                        onClick={() => setShowAll(false)}
                    >
                        <ChevronUp className="w-5 h-5 mr-2" />
                        Show less
                    </Button>
                </div>
            )}
        </div>
    );
}
