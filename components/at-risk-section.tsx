"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown, ChevronUp, Lightbulb, Activity, CheckCircle2, Check } from "lucide-react";
import { Objective, KrDetail } from "@/lib/types/okr";

const INITIAL_SHOW = 4;

const severityConfig: Record<string, { bg: string; border: string; badge: string; bar: string; label: string; icon: React.ReactNode }> = {
    'Behind': {
        bg: 'bg-rose-50 dark:bg-rose-500/5 hover:bg-rose-100 dark:hover:bg-rose-500/10 backdrop-blur-md',
        border: 'border-rose-200 dark:border-rose-500/30 hover:border-rose-500/50',
        badge: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
        bar: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
        label: 'Critical',
        icon: <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" />
    },
    'At Risk': {
        bg: 'bg-amber-50 dark:bg-amber-500/5 hover:bg-amber-100 dark:hover:bg-amber-500/10 backdrop-blur-md',
        border: 'border-amber-200 dark:border-amber-500/30 hover:border-amber-500/50',
        badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
        bar: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
        label: 'Warning',
        icon: <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
    },
};

export default function AtRiskSection({ atRiskObjectives }: { atRiskObjectives: Objective[] }) {
    const [expandedObj, setExpandedObj] = useState<number | null>(null);
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

    const toggleExpand = (id: number, isOpen: boolean) => setExpandedObj(isOpen ? id : null);

    if (!hasRisk) {
        return (
            <Card className="border-none bg-transparent shadow-none w-full h-full flex flex-col p-4">
                <CardHeader className="flex flex-row items-center gap-4 py-5 px-0 pb-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner">
                            <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-foreground tracking-tight">Needs Attention</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">Objectives at risk of missing targets</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 px-3 py-1 text-sm shadow-sm backdrop-blur-md">
                        0 objectives
                    </Badge>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center flex-1 py-12 px-0 bg-transparent">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 opacity-80" />
                    <div className="text-center mt-4 space-y-1.5">
                        <h4 className="text-emerald-500 font-bold text-lg">All On Track</h4>
                        <p className="text-muted-foreground text-sm font-medium">No objectives need attention right now</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none bg-transparent shadow-none w-full flex flex-col h-full">
            <CardHeader className="flex flex-row items-center gap-4 border-b border-border/40 bg-muted/20 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner">
                        <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-foreground tracking-tight">Needs Attention</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Objectives at risk of missing targets</p>
                    </div>
                </div>
                {hasRisk && (
                    <div className="flex flex-wrap items-center gap-2">
                        {critical.length > 0 && (
                            <Badge variant="outline" className="text-sm px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 shadow-sm backdrop-blur-md">
                                {critical.length} critical
                            </Badge>
                        )}
                        {warning.length > 0 && (
                            <Badge variant="outline" className="text-sm px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 shadow-sm backdrop-blur-md">
                                {warning.length} warning
                            </Badge>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0 flex flex-col min-h-[300px] bg-transparent">
                {!hasRisk ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-16 gap-4 bg-transparent">
                        <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-500/50 opacity-80" />
                        <div className="text-center space-y-1">
                            <p className="text-xl text-emerald-600 dark:text-emerald-500 font-bold">All On Track</p>
                            <p className="text-sm text-muted-foreground font-medium">No objectives need attention right now</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Insight Bar */}
                        <div className="px-6 py-4 bg-background/40 backdrop-blur-md border-b border-border/50 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Avg progress:</span>
                                <span className={`font-bold text-lg ${avgProgress < 40 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>{avgProgress}%</span>
                            </div>
                            <div className="h-6 w-px bg-border" />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">KRs done:</span>
                                <span className="font-bold text-lg text-foreground">{completedKRs}/{totalKRs}</span>
                            </div>
                        </div>

                        <div className="p-6 bg-transparent">
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
                                            className={`rounded-2xl border ${cfg.bg} ${cfg.border} transition-all overflow-hidden shadow-sm hover:shadow-md`}
                                        >
                                            <CollapsibleTrigger 
                                                render={<button className="w-full text-left p-4 sm:p-5 group" />}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            {cfg.icon}
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${cfg.badge} uppercase tracking-wider backdrop-blur-md`}>
                                                                {cfg.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-base sm:text-lg font-bold text-foreground leading-snug truncate">
                                                            {obj.objectiveName}
                                                        </p>
                                                        {obj.ownerTeam && (
                                                            <p className="text-sm text-muted-foreground mt-1 font-medium">{obj.ownerTeam}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:shrink-0">
                                                        <div className="text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                                                            <span className={`text-2xl sm:text-xl font-bold tabular-nums ${obj.progress < 40 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                                {obj.progress?.toFixed(0)}%
                                                            </span>
                                                            <span className="text-xs text-rose-700 dark:text-rose-400/80 font-bold bg-rose-100 dark:bg-rose-500/10 px-2.5 py-0.5 rounded-md border border-rose-200 dark:border-rose-500/20 shadow-sm">
                                                                need +{gap > 0 ? gap.toFixed(0) : 0}%
                                                            </span>
                                                        </div>
                                                        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 h-2.5 bg-muted/50 rounded-full overflow-hidden shadow-inner border border-border/30">
                                                    <div
                                                        className={`h-full ${cfg.bar} rounded-full transition-all`}
                                                        style={{ width: `${Math.min(obj.progress || 0, 100)}%` }}
                                                    />
                                                </div>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent className="px-5 pb-5 pt-3 border-t border-border/40 bg-background/30 backdrop-blur-md">
                                                <div className="flex flex-wrap gap-3 mb-6">
                                                    {gap > 30 && (
                                                        <Badge variant="outline" className="text-sm px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 rounded-xl shadow-sm font-semibold backdrop-blur-md">
                                                            <Activity className="w-3.5 h-3.5 mr-1.5 inline-block" /> 
                                                            {gap.toFixed(0)}% gap to On Track
                                                        </Badge>
                                                    )}
                                                    {doneDetails.length > 0 && (
                                                        <Badge variant="outline" className="text-sm px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 rounded-xl shadow-sm font-semibold backdrop-blur-md">
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline-block" />
                                                            {doneDetails.length}/{details.length} KRs completed
                                                        </Badge>
                                                    )}
                                                </div>

                                                {details.length > 0 && (
                                                    <div className="flex flex-col gap-4 mb-6">
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Key Results Status</p>
                                                        {details.map((d: KrDetail, i: number) => (
                                                            <div key={i} className="bg-background/40 backdrop-blur-md border border-border/50 shadow-sm rounded-xl p-4 transition-colors hover:bg-background/60">
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <Avatar className="w-8 h-8 border border-border/40 shadow-sm">
                                                                        <AvatarImage src={d.pictureURL} alt={d.fullName} />
                                                                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                                                            {d.fullName?.charAt(0)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm text-foreground font-semibold flex-1 truncate">{d.fullName}</span>
                                                                    <span className={`text-sm font-bold tabular-nums shrink-0 px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-sm backdrop-blur-md ${
                                                                        d.isDone ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : 
                                                                        d.krProgress < 40 ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30' : 
                                                                        'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
                                                                    }`}>
                                                                        {d.isDone ? <><Check className="w-3.5 h-3.5" /> Done</> : `${d.krProgress}%`}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground font-medium leading-snug mb-3 line-clamp-2">{d.krTitle}</p>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden shadow-inner border border-border/30">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all ${
                                                                                d.isDone ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : d.krProgress < 40 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                                                            }`}
                                                                            style={{ width: `${Math.min(d.krProgress, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums font-semibold">
                                                                        {d.pointCurrent} / {d.pointOKR} pts
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-4 flex items-start gap-4 shadow-inner">
                                                    <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-0.5 border border-primary/20 shadow-sm">
                                                        <Lightbulb className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-primary mb-1 uppercase tracking-wide">Suggested Action</p>
                                                        <p className="text-sm text-foreground font-medium leading-relaxed">
                                                            {gap > 40
                                                                ? `This objective is ${gap.toFixed(0)}% behind the On Track threshold. Consider re-scoping targets or reallocating resources to close the gap.`
                                                                : details.length > 0 && details.every((d: KrDetail) => d.krProgress < 30)
                                                                ? `All key results are below 30% progress. Review blockers with each contributor and prioritize the highest-impact KR first.`
                                                                : `Review key results with contributors and identify blockers preventing further progress.`
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
                                <div className="relative mt-[-40px] pt-4">
                                    <div className="absolute top-[-60px] left-0 right-0 h-20 bg-linear-to-t from-background to-transparent pointer-events-none" />
                                    <div className="relative z-10 flex justify-center">
                                        <Button
                                            variant="outline"
                                            className="h-12 px-8 rounded-xl border-border/50 bg-background/60 backdrop-blur-md shadow-sm hover:bg-muted/50 text-foreground font-semibold"
                                            onClick={() => setShowAll(true)}
                                        >
                                            <ChevronDown className="mr-2 w-5 h-5" />
                                            Show {hiddenCount} more objective{hiddenCount > 1 ? 's' : ''}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {showAll && allRisk.length > INITIAL_SHOW && (
                                <div className="mt-6 flex justify-center">
                                    <Button
                                        variant="outline"
                                        className="h-12 px-8 rounded-xl border-border/50 bg-background/60 backdrop-blur-md shadow-sm hover:bg-muted/50 text-muted-foreground font-semibold"
                                        onClick={() => setShowAll(false)}
                                    >
                                        <ChevronUp className="mr-2 w-5 h-5" />
                                        Show less
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
