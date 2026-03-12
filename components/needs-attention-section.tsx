import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, PartyPopper } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContributorSum, ContributorSumObj } from "@/lib/types/okr";

const statusDot: Record<string, string> = {
    'On Track': 'bg-emerald-500',
    'At Risk':  'bg-amber-500',
    'Behind':   'bg-rose-500',
};

const INITIAL_SHOW = 6;

export default function NeedsAttentionSection({ contributors }: { contributors: ContributorSum[] }) {
    const [showAll, setShowAll] = useState(false);

    // Show employees who have checked in but have low avgObjectiveProgress (< 70%)
    // Sorted by avgObjectiveProgress ASC (lowest first)
    const atRiskContributors = [...(contributors || [])]
        .filter((c: ContributorSum) => c.checkInCount > 0 && c.avgObjectiveProgress < 70)
        .sort((a, b) => a.avgObjectiveProgress - b.avgObjectiveProgress);

    const visible = showAll ? atRiskContributors : atRiskContributors.slice(0, INITIAL_SHOW);
    const hiddenCount = atRiskContributors.length - INITIAL_SHOW;

    return (
        <Card className="border-border/40 shadow-sm overflow-hidden h-full mt-8 bg-card/40 backdrop-blur-xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 bg-muted/20 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner">
                        <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-foreground tracking-tight">Needs Attention</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Employees with low objective progress — sorted lowest first</p>
                    </div>
                </div>
                {atRiskContributors.length > 0 && (
                    <Badge variant="outline" className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 px-3 py-1 text-sm shadow-sm backdrop-blur-md">
                        {atRiskContributors.length} employee{atRiskContributors.length !== 1 ? 's' : ''}
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="p-0 flex flex-col min-h-[300px] bg-transparent">
                {atRiskContributors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 bg-transparent">
                        <PartyPopper className="w-12 h-12 text-emerald-600 dark:text-emerald-400 opacity-80" />
                        <div className="space-y-1 text-center">
                            <p className="text-xl text-emerald-600 dark:text-emerald-400 font-bold">Everyone is On Track</p>
                            <p className="text-base text-muted-foreground font-medium">No employees need attention right now</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-background/40 backdrop-blur-md px-6 py-3 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">
                                Showing employees below <span className="text-rose-600 dark:text-rose-400 font-bold">70%</span> objective progress who have checked in
                            </span>
                        </div>

                        <div className="relative">
                            <div className="p-6 flex flex-col gap-4 bg-transparent">
                                {visible.map((person: ContributorSum, i: number) => {
                                    const isCritical = person.avgObjectiveProgress < 40;
                                    const progressColor = isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400';
                                    const barColor = isCritical ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
                                    const cardBg = isCritical ? 'bg-background/60 backdrop-blur-md border border-rose-500/30 hover:border-rose-500/50 hover:bg-background/80' : 'bg-background/40 backdrop-blur-md border border-amber-500/30 hover:border-amber-500/50 hover:bg-background/60';

                                    return (
                                        <div
                                            key={person.fullName}
                                            className={`border rounded-2xl p-5 flex items-start gap-4 transition-all hover:shadow-md shadow-sm ${cardBg}`}
                                        >
                                            {/* Rank */}
                                            <span className="text-sm text-muted-foreground font-mono tabular-nums w-5 font-bold shrink-0 pt-1">
                                                {i + 1}
                                            </span>

                                            {/* Avatar */}
                                            <Avatar className="w-11 h-11 border border-background shadow-sm">
                                                <AvatarImage src={person.pictureURL} alt={person.fullName} />
                                                <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                                                    {person.fullName?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                                    <p className="text-base font-bold text-foreground truncate">{person.fullName}</p>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className="text-sm text-muted-foreground font-medium">{person.checkInCount} check-in{person.checkInCount !== 1 ? 's' : ''}</span>
                                                        <span className={`text-xl font-bold tabular-nums ${progressColor}`}>
                                                            {person.avgObjectiveProgress}%
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-4 shadow-inner">
                                                    <div
                                                        className={`h-full ${barColor} transition-all`}
                                                        style={{ width: `${Math.min(person.avgObjectiveProgress, 100)}%` }}
                                                    />
                                                </div>

                                                {/* Objectives list */}
                                                {person.objectives && person.objectives.length > 0 && (
                                                    <div className="flex flex-col gap-2.5 mt-2 bg-background/30 backdrop-blur-md p-3 rounded-xl border border-border/40 shadow-inner">
                                                        {person.objectives.slice(0, 2).map((okr: ContributorSumObj, oi: number) => (
                                                            <div key={oi} className="flex items-center gap-3">
                                                                <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${statusDot[okr.status] || 'bg-muted-foreground'}`} />
                                                                <span className="flex-1 text-sm text-foreground font-medium truncate">{okr.objectiveName}</span>
                                                                <span className="text-sm text-muted-foreground shrink-0 tabular-nums font-bold bg-background/50 px-1.5 py-0.5 rounded-md border border-border/50">{okr.progress?.toFixed(0)}%</span>
                                                            </div>
                                                        ))}
                                                        {person.objectives.length > 2 && (
                                                            <p className="text-xs text-muted-foreground font-semibold pl-5 mt-1">+{person.objectives.length - 2} more objectives</p>
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
                                    <div className="h-24 bg-linear-to-t from-background to-transparent pointer-events-none" />
                                    <div className="bg-background pt-2 pb-6 flex justify-center backdrop-blur-sm">
                                        <Button
                                            variant="outline"
                                            className="h-12 px-8 rounded-xl border-border/50 bg-background/60 shadow-sm hover:bg-muted/50 text-foreground font-semibold backdrop-blur-md"
                                            onClick={() => setShowAll(true)}
                                        >
                                            <ChevronDown className="w-4 h-4 mr-2" />
                                            Show {hiddenCount} more
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {showAll && atRiskContributors.length > INITIAL_SHOW && (
                                <div className="px-6 pb-8 bg-transparent flex justify-center">
                                    <Button
                                        variant="outline"
                                        className="h-12 px-8 rounded-xl border-border/50 bg-background/60 shadow-sm hover:bg-muted/50 text-muted-foreground font-semibold backdrop-blur-md"
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
