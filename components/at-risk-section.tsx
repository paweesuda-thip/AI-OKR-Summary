"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown, ChevronUp, Lightbulb, Activity, CheckCircle2 } from "lucide-react";
import { Objective, KrDetail } from "@/lib/types/okr";

const INITIAL_SHOW = 4;

const severityConfig: Record<string, { bg: string; border: string; badge: string; bar: string; label: string; icon: React.ReactNode }> = {
    'Behind': {
        bg: 'bg-rose-500/10 hover:bg-rose-500/20',
        border: 'border-rose-500/20',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        bar: 'bg-rose-500',
        label: 'Critical',
        icon: <Activity className="w-4 h-4 text-rose-400" />
    },
    'At Risk': {
        bg: 'bg-amber-500/10 hover:bg-amber-500/20',
        border: 'border-amber-500/20',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        bar: 'bg-amber-500',
        label: 'Warning',
        icon: <AlertCircle className="w-4 h-4 text-amber-400" />
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

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden h-full mt-8">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/50 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-white">Needs Attention</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">Objectives at risk of missing targets</p>
                    </div>
                </div>
                {hasRisk && (
                    <div className="flex flex-wrap items-center gap-2">
                        {critical.length > 0 && (
                            <Badge variant="outline" className="text-sm px-3 py-1 bg-rose-500/15 text-rose-300 border-rose-500/25">
                                {critical.length} critical
                            </Badge>
                        )}
                        {warning.length > 0 && (
                            <Badge variant="outline" className="text-sm px-3 py-1 bg-amber-500/15 text-amber-300 border-amber-500/25">
                                {warning.length} warning
                            </Badge>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-0 flex flex-col min-h-[300px]">
                {!hasRisk ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-16 gap-4">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500/50" />
                        <div className="text-center space-y-1">
                            <p className="text-xl text-emerald-400 font-bold">All On Track</p>
                            <p className="text-sm text-slate-500">No objectives need attention right now</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Insight Bar */}
                        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-800 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Avg progress:</span>
                                <span className={`font-bold text-lg ${avgProgress < 40 ? 'text-rose-400' : 'text-amber-400'}`}>{avgProgress}%</span>
                            </div>
                            <div className="h-6 w-px bg-slate-700/50" />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">KRs done:</span>
                                <span className="font-bold text-lg text-slate-300">{completedKRs}/{totalKRs}</span>
                            </div>
                        </div>

                        <div className="p-6">
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
                                            className={`rounded-2xl border ${cfg.bg} ${cfg.border} transition-colors overflow-hidden`}
                                        >
                                            <CollapsibleTrigger className="w-full text-left p-4 sm:p-5 group">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            {cfg.icon}
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${cfg.badge} uppercase tracking-wider`}>
                                                                {cfg.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-base sm:text-lg font-semibold text-slate-100 leading-snug truncate">
                                                            {obj.objectiveName}
                                                        </p>
                                                        {obj.ownerTeam && (
                                                            <p className="text-sm text-slate-500 mt-1">{obj.ownerTeam}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:shrink-0">
                                                        <div className="text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                                                            <span className={`text-2xl sm:text-xl font-bold tabular-nums ${obj.progress < 40 ? 'text-rose-400' : 'text-amber-400'}`}>
                                                                {obj.progress?.toFixed(0)}%
                                                            </span>
                                                            <span className="text-xs text-rose-400/80 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                                                need +{gap > 0 ? gap.toFixed(0) : 0}%
                                                            </span>
                                                        </div>
                                                        <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
                                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 h-2 bg-slate-900/50 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${cfg.bar} rounded-full transition-all`}
                                                        style={{ width: `${Math.min(obj.progress || 0, 100)}%` }}
                                                    />
                                                </div>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent className="px-5 pb-5 pt-2 border-t border-slate-700/30">
                                                <div className="flex flex-wrap gap-3 mb-6">
                                                    {gap > 30 && (
                                                        <Badge variant="outline" className="text-sm px-3 py-1.5 bg-rose-500/10 text-rose-300 border-rose-500/20 rounded-xl">
                                                            <Activity className="w-3.5 h-3.5 mr-1.5 inline-block" /> 
                                                            {gap.toFixed(0)}% gap to On Track
                                                        </Badge>
                                                    )}
                                                    {doneDetails.length > 0 && (
                                                        <Badge variant="outline" className="text-sm px-3 py-1.5 bg-emerald-500/10 text-emerald-300 border-emerald-500/20 rounded-xl">
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 inline-block" />
                                                            {doneDetails.length}/{details.length} KRs completed
                                                        </Badge>
                                                    )}
                                                </div>

                                                {details.length > 0 && (
                                                    <div className="flex flex-col gap-4 mb-6">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Results Status</p>
                                                        {details.map((d: KrDetail, i: number) => (
                                                            <div key={i} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <Avatar className="w-8 h-8 border border-slate-700/50">
                                                                        <AvatarImage src={d.pictureURL} alt={d.fullName} />
                                                                        <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">
                                                                            {d.fullName?.charAt(0)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm text-slate-300 font-medium flex-1 truncate">{d.fullName}</span>
                                                                    <span className={`text-sm font-bold tabular-nums shrink-0 ${
                                                                        d.isDone ? 'text-emerald-400' : d.krProgress < 40 ? 'text-rose-400' : 'text-amber-400'
                                                                    }`}>
                                                                        {d.isDone ? '✓ Done' : `${d.krProgress}%`}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-slate-300 font-medium leading-snug mb-3 line-clamp-2">{d.krTitle}</p>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all ${
                                                                                d.isDone ? 'bg-emerald-400' : d.krProgress < 40 ? 'bg-rose-500' : 'bg-amber-500'
                                                                            }`}
                                                                            style={{ width: `${Math.min(d.krProgress, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-slate-500 shrink-0 tabular-nums">
                                                                        {d.pointCurrent} / {d.pointOKR} pts
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-5 py-4 flex items-start gap-4">
                                                    <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0 mt-0.5">
                                                        <Lightbulb className="w-5 h-5 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-indigo-300 mb-1">Suggested Action</p>
                                                        <p className="text-sm text-slate-300 leading-relaxed">
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

                            {showAll && allRisk.length > INITIAL_SHOW && (
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
                    </>
                )}
            </CardContent>
        </Card>
    );
}
