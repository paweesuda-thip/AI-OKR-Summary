import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, PartyPopper } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusDot: Record<string, string> = {
    'On Track': 'bg-emerald-400',
    'At Risk':  'bg-amber-400',
    'Behind':   'bg-rose-400',
};

const INITIAL_SHOW = 6;

export default function NeedsAttentionSection({ contributors }: any) {
    const [showAll, setShowAll] = useState(false);

    // Show employees who have checked in but have low avgObjectiveProgress (< 70%)
    // Sorted by avgObjectiveProgress ASC (lowest first)
    const atRiskContributors = [...(contributors || [])]
        .filter((c: any) => c.checkInCount > 0 && c.avgObjectiveProgress < 70)
        .sort((a, b) => a.avgObjectiveProgress - b.avgObjectiveProgress);

    const visible = showAll ? atRiskContributors : atRiskContributors.slice(0, INITIAL_SHOW);
    const hiddenCount = atRiskContributors.length - INITIAL_SHOW;

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden h-full mt-8">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 bg-slate-900/50 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-white">Needs Attention</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">Employees with low objective progress — sorted lowest first</p>
                    </div>
                </div>
                {atRiskContributors.length > 0 && (
                    <Badge variant="outline" className="bg-rose-500/15 text-rose-300 border-rose-500/25 px-3 py-1 text-sm">
                        {atRiskContributors.length} employee{atRiskContributors.length !== 1 ? 's' : ''}
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="p-0 flex flex-col min-h-[300px]">
                {atRiskContributors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <PartyPopper className="w-12 h-12 text-emerald-400" />
                        <div className="space-y-1 text-center">
                            <p className="text-xl text-emerald-400 font-bold">Everyone is On Track</p>
                            <p className="text-base text-slate-500">No employees need attention right now</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-800/30 px-6 py-3 border-b border-slate-800 backdrop-blur-sm">
                            <span className="text-sm text-slate-500">
                                Showing employees below <span className="text-rose-400 font-semibold">70%</span> objective progress who have checked in
                            </span>
                        </div>

                        <div className="relative">
                            <div className="p-6 flex flex-col gap-4">
                                {visible.map((person: any, i: number) => {
                                    const isCritical = person.avgObjectiveProgress < 40;
                                    const progressColor = isCritical ? 'text-rose-400' : 'text-amber-400';
                                    const barColor = isCritical ? 'bg-rose-500' : 'bg-amber-500';

                                    return (
                                        <div
                                            key={person.fullName}
                                            className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 flex items-start gap-4 transition-colors hover:bg-slate-800/60"
                                        >
                                            {/* Rank */}
                                            <span className="text-sm text-slate-600 font-mono tabular-nums w-5 font-semibold shrink-0 pt-1">
                                                {i + 1}
                                            </span>

                                            {/* Avatar */}
                                            <Avatar className="w-11 h-11 border border-slate-700">
                                                <AvatarImage src={person.pictureURL} alt={person.fullName} />
                                                <AvatarFallback className="bg-slate-700 text-slate-400 font-bold">
                                                    {person.fullName?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                                    <p className="text-base font-semibold text-slate-200 truncate">{person.fullName}</p>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className="text-sm text-slate-500">{person.checkInCount} check-in{person.checkInCount !== 1 ? 's' : ''}</span>
                                                        <span className={`text-xl font-bold tabular-nums ${progressColor}`}>
                                                            {person.avgObjectiveProgress}%
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden mb-3">
                                                    <div
                                                        className={`h-full ${barColor} transition-all`}
                                                        style={{ width: `${Math.min(person.avgObjectiveProgress, 100)}%` }}
                                                    />
                                                </div>

                                                {/* Objectives list */}
                                                {person.objectives && person.objectives.length > 0 && (
                                                    <div className="flex flex-col gap-2 mt-4">
                                                        {person.objectives.slice(0, 2).map((okr: any, oi: number) => (
                                                            <div key={oi} className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[okr.status] || 'bg-slate-500'}`} />
                                                                <span className="flex-1 text-sm text-slate-400 truncate">{okr.objectiveName}</span>
                                                                <span className="text-sm text-slate-500 shrink-0 tabular-nums font-medium">{okr.progress?.toFixed(0)}%</span>
                                                            </div>
                                                        ))}
                                                        {person.objectives.length > 2 && (
                                                            <p className="text-xs text-slate-600 pl-4 mt-1">+{person.objectives.length - 2} more objectives</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {!showAll && hiddenCount > 0 && (
                                <div className="relative mt-[-80px] px-6 pb-2">
                                    <div className="h-20 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                                    <div className="bg-slate-900 pt-1 pb-4">
                                        <Button
                                            variant="outline"
                                            className="w-full bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200"
                                            onClick={() => setShowAll(true)}
                                        >
                                            <ChevronDown className="w-4 h-4 mr-2" />
                                            Show {hiddenCount} more
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {showAll && atRiskContributors.length > INITIAL_SHOW && (
                                <div className="px-6 pb-6">
                                    <Button
                                        variant="outline"
                                        className="w-full bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200"
                                        onClick={() => setShowAll(false)}
                                    >
                                        <ChevronUp className="w-4 h-4 mr-2" />
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
