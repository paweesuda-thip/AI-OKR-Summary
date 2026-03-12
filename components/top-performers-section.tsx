import { Trophy, Loader2, Sparkles, Medal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ContributorSum, ContributorSumObj } from "@/lib/types/okr";

const medalColors = [
    { border: 'border-amber-400/40 dark:border-amber-500/30',  bg: 'bg-amber-50 dark:bg-gradient-to-b dark:from-amber-500/10 dark:to-amber-600/5',   scoreColor: 'text-amber-600 dark:text-amber-300',  barColor: 'bg-amber-400',  rankBg: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',  ringColor: 'ring-amber-200 dark:ring-amber-400/30',  headerBg: 'bg-amber-100/50 dark:bg-amber-500/10', medalColor: 'text-amber-500'  },
    { border: 'border-muted-foreground/20 dark:border-muted-foreground/30',  bg: 'bg-muted/30 dark:bg-gradient-to-b dark:from-muted/10 dark:to-muted/5',    scoreColor: 'text-foreground dark:text-foreground',  barColor: 'bg-muted-foreground/40',  rankBg: 'bg-muted text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground',  ringColor: 'ring-muted dark:ring-muted/20',  headerBg: 'bg-muted/40 dark:bg-muted/10', medalColor: 'text-slate-400'   },
    { border: 'border-orange-300 dark:border-orange-500/35', bg: 'bg-orange-50 dark:bg-gradient-to-b dark:from-orange-600/10 dark:to-orange-700/5', scoreColor: 'text-orange-600 dark:text-orange-300', barColor: 'bg-orange-500', rankBg: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300', ringColor: 'ring-orange-200 dark:ring-orange-500/25', headerBg: 'bg-orange-100/50 dark:bg-orange-500/10', medalColor: 'text-orange-500' },
];

const statusDot: Record<string, string> = {
    'On Track': 'bg-emerald-500',
    'At Risk':  'bg-amber-500',
    'Behind':   'bg-rose-500',
};

const EmptyState = () => (
    <Card className="border-border shadow-sm overflow-hidden mt-8">
        <CardHeader className="flex flex-row items-center gap-4 border-b border-border/60 bg-muted/10 py-5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
                <CardTitle className="text-xl text-foreground tracking-tight">Top Performers</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16 text-muted-foreground text-base font-medium">
            No contributor data available
        </CardContent>
    </Card>
);

export default function TopPerformersSection({ contributors, aiSummary = null, aiLoading = false }: { contributors: ContributorSum[], aiSummary?: any, aiLoading?: boolean }) {
    const top3 = (contributors || []).slice(0, 3);
    const rest = (contributors || []).slice(3);

    if (!top3 || top3.length === 0) return <EmptyState />;

    return (
        <Card className="border-border shadow-sm overflow-hidden mt-8">
            <CardHeader className="flex flex-row items-center gap-4 border-b border-border/60 bg-muted/10 py-5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-sm">
                    <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-xl text-foreground tracking-tight">Top Performers</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">Ranked by objective progress · highest check-ins as tiebreaker</p>
                </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-8 bg-muted/5">
                {/* Top 3 — horizontal 3-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {top3.map((person: ContributorSum, i: number) => {
                        const colors = medalColors[i];
                        const aiPersonSummary = aiSummary?.rankings?.[i];

                        return (
                            <div
                                key={person.fullName}
                                className={`rounded-2xl border ${colors.border} ${colors.bg} ring-1 ${colors.ringColor} flex flex-col shadow-sm`}
                            >
                                {/* Card header */}
                                <div className={`p-6 ${colors.headerBg} rounded-t-2xl border-b ${colors.border}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-full bg-background/50 shadow-sm border ${colors.border}`}>
                                            <Medal className={`w-8 h-8 ${colors.medalColor}`} />
                                        </div>
                                        <Avatar className="w-12 h-12 ring-2 ring-background shadow-sm">
                                            <AvatarImage src={person.pictureURL} alt={person.fullName} />
                                            <AvatarFallback className="bg-muted text-muted-foreground">{person.fullName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className={`text-sm px-3 py-1 rounded-full font-bold ml-auto shadow-sm ${colors.rankBg}`}>
                                            #{i + 1}
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-foreground leading-tight truncate mb-1">
                                        {person.fullName}
                                    </p>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {person.krCount} KR{person.krCount !== 1 ? 's' : ''} · {person.checkInCount} check-in{person.checkInCount !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                {/* Objective Progress */}
                                <div className="p-6 pb-2 border-b border-border/50">
                                    <div className="flex items-end justify-between mb-3">
                                        <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">Avg Objective Progress</span>
                                        <span className={`text-2xl font-bold tabular-nums ${colors.scoreColor}`}>
                                            {person.avgObjectiveProgress}
                                            <span className="text-sm font-semibold ml-0.5 opacity-70">%</span>
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full rounded-full ${colors.barColor} transition-all`}
                                            style={{ width: `${Math.min(person.avgObjectiveProgress, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* OKR contributions */}
                                {person.objectives && person.objectives.length > 0 && (
                                    <div className="p-6 pb-4">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                                            OKR Contributions ({person.objectives.length})
                                        </p>
                                        <div className="flex flex-col gap-2.5">
                                            {person.objectives.slice(0, 3).map((okr: ContributorSumObj, oi: number) => (
                                                <div key={oi} className="flex items-center gap-3">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${statusDot[okr.status] || 'bg-muted-foreground'}`} />
                                                    <span className="flex-1 text-sm text-foreground font-medium truncate leading-snug">
                                                        {okr.objectiveName}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground shrink-0 tabular-nums font-bold bg-background px-1.5 py-0.5 rounded-md border border-border">
                                                        {okr.progress?.toFixed(0)}%
                                                    </span>
                                                </div>
                                            ))}
                                            {person.objectives.length > 3 && (
                                                <p className="text-xs text-muted-foreground font-medium pl-5 mt-1">
                                                    +{person.objectives.length - 3} more
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* AI summary */}
                                <div className="mt-auto p-6 pt-2">
                                    {aiPersonSummary && (
                                        <div className="flex gap-3 bg-primary/5 border border-primary/10 p-4 rounded-xl shadow-sm">
                                            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <p className="text-sm text-foreground font-medium leading-relaxed">
                                                {aiPersonSummary.summary}
                                            </p>
                                        </div>
                                    )}
                                    {!aiPersonSummary && aiLoading && (
                                        <div className="flex items-center justify-center gap-2.5 py-4 bg-muted/30 rounded-xl border border-border/50">
                                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                            <span className="text-sm text-muted-foreground font-medium">AI analyzing...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* AI Team Summary */}
                {aiSummary?.teamSummary && (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-3">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <p className="text-sm font-bold text-primary uppercase tracking-wide">AI Team Overview</p>
                        </div>
                        <p className="text-base text-foreground font-medium leading-relaxed">{aiSummary.teamSummary}</p>
                    </div>
                )}

                {/* Other Members */}
                {rest.length > 0 && (
                    <div className="pt-4">
                        <div className="flex items-center gap-4 mb-6 opacity-80">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Other Members</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rest.map((person: ContributorSum, i: number) => (
                                <div key={person.fullName} className="bg-background border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-muted-foreground/30 transition-colors">
                                    <span className="text-sm text-muted-foreground w-6 text-right font-mono tabular-nums font-semibold">#{i + 4}</span>
                                    <Avatar className="w-8 h-8 rounded-full border border-border">
                                        <AvatarImage src={person.pictureURL} alt={person.fullName} />
                                        <AvatarFallback className="bg-muted text-xs text-muted-foreground">{person.fullName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground truncate font-semibold">{person.fullName}</p>
                                        <p className="text-xs text-muted-foreground font-medium">{person.checkInCount} check-ins</p>
                                    </div>
                                    <div className="text-right pr-2">
                                        <span className="text-sm font-bold text-foreground tabular-nums">
                                            {person.avgObjectiveProgress}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
