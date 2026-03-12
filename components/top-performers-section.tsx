import { Trophy, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ContributorSum, ContributorSumObj } from "@/lib/types/okr";

const medals = ['🥇', '🥈', '🥉'];

const medalColors = [
    { border: 'border-amber-400/40',  bg: 'bg-gradient-to-b from-amber-500/12 to-amber-600/5',   scoreColor: 'text-amber-300',  barColor: 'bg-amber-400',  rankBg: 'bg-amber-500/15 text-amber-300',  ringColor: 'ring-amber-400/30',  headerBg: 'bg-amber-500/10'  },
    { border: 'border-slate-400/30',  bg: 'bg-gradient-to-b from-slate-400/8 to-slate-500/5',    scoreColor: 'text-slate-200',  barColor: 'bg-slate-400',  rankBg: 'bg-slate-400/15 text-slate-300',  ringColor: 'ring-slate-400/20',  headerBg: 'bg-slate-400/8'   },
    { border: 'border-orange-500/35', bg: 'bg-gradient-to-b from-orange-600/10 to-orange-700/5', scoreColor: 'text-orange-300', barColor: 'bg-orange-500', rankBg: 'bg-orange-500/15 text-orange-300', ringColor: 'ring-orange-500/25', headerBg: 'bg-orange-500/10' },
];

const statusDot: Record<string, string> = {
    'On Track': 'bg-emerald-400',
    'At Risk':  'bg-amber-400',
    'Behind':   'bg-rose-400',
};

const EmptyState = () => (
    <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden mt-8">
        <CardHeader className="flex flex-row items-center gap-4 border-b border-slate-800/80 bg-slate-900/50 py-5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
                <CardTitle className="text-xl text-white">Top Performers</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16 text-slate-500 text-base">
            No contributor data available
        </CardContent>
    </Card>
);

export default function TopPerformersSection({ contributors, aiSummary = null, aiLoading = false }: { contributors: ContributorSum[], aiSummary?: any, aiLoading?: boolean }) {
    const top3 = (contributors || []).slice(0, 3);
    const rest = (contributors || []).slice(3);

    if (!top3 || top3.length === 0) return <EmptyState />;

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden mt-8">
            <CardHeader className="flex flex-row items-center gap-4 border-b border-slate-800/80 bg-slate-900/50 py-5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-xl text-white">Top Performers</CardTitle>
                    <p className="text-sm text-slate-500">Ranked by objective progress · highest check-ins as tiebreaker</p>
                </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-8">
                {/* Top 3 — horizontal 3-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {top3.map((person: ContributorSum, i: number) => {
                        const colors = medalColors[i];
                        const aiPersonSummary = aiSummary?.rankings?.[i];

                        return (
                            <div
                                key={person.fullName}
                                className={`rounded-2xl border ${colors.border} ${colors.bg} ring-1 ${colors.ringColor} flex flex-col`}
                            >
                                {/* Card header */}
                                <div className={`p-6 ${colors.headerBg} rounded-t-2xl`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-4xl leading-none">{medals[i]}</span>
                                        <Avatar className="w-12 h-12 ring-2 ring-slate-600 bg-slate-700">
                                            <AvatarImage src={person.pictureURL} alt={person.fullName} />
                                            <AvatarFallback>{person.fullName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className={`text-sm px-3 py-1 rounded-full font-bold ml-auto ${colors.rankBg}`}>
                                            #{i + 1}
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-white leading-tight truncate mb-1">
                                        {person.fullName}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {person.krCount} KR{person.krCount !== 1 ? 's' : ''} · {person.checkInCount} check-in{person.checkInCount !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                {/* Objective Progress */}
                                <div className="p-6 pb-2 border-b border-white/5">
                                    <div className="flex items-end justify-between mb-3">
                                        <span className="text-sm text-slate-500 font-medium">Avg Objective Progress</span>
                                        <span className={`text-2xl font-bold tabular-nums ${colors.scoreColor}`}>
                                            {person.avgObjectiveProgress}
                                            <span className="text-sm font-normal ml-0.5 text-slate-500">%</span>
                                        </span>
                                    </div>
                                    <div className="h-2.5 bg-slate-700/70 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${colors.barColor} transition-all`}
                                            style={{ width: `${Math.min(person.avgObjectiveProgress, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* OKR contributions */}
                                {person.objectives && person.objectives.length > 0 && (
                                    <div className="p-6 pb-4">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                                            OKR Contributions ({person.objectives.length})
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            {person.objectives.slice(0, 3).map((okr: ContributorSumObj, oi: number) => (
                                                <div key={oi} className="flex items-center gap-2.5">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[okr.status] || 'bg-slate-500'}`} />
                                                    <span className="flex-1 text-sm text-slate-300 truncate leading-snug">
                                                        {okr.objectiveName}
                                                    </span>
                                                    <span className="text-sm text-slate-500 shrink-0 tabular-nums font-medium">
                                                        {okr.progress?.toFixed(0)}%
                                                    </span>
                                                </div>
                                            ))}
                                            {person.objectives.length > 3 && (
                                                <p className="text-xs text-slate-600 pl-4 mt-1">
                                                    +{person.objectives.length - 3} more
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* AI summary */}
                                <div className="mt-auto p-6 pt-2">
                                    {aiPersonSummary && (
                                        <div className="flex gap-2.5 bg-black/20 p-4 rounded-xl">
                                            <span className="text-indigo-400 text-sm shrink-0 mt-0.5">✦</span>
                                            <p className="text-sm text-slate-300 leading-relaxed">
                                                {aiPersonSummary.summary}
                                            </p>
                                        </div>
                                    )}
                                    {!aiPersonSummary && aiLoading && (
                                        <div className="flex items-center justify-center gap-2.5 py-4 bg-black/10 rounded-xl">
                                            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                            <span className="text-sm text-slate-500">AI analyzing...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* AI Team Summary */}
                {aiSummary?.teamSummary && (
                    <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-2xl p-6">
                        <div className="flex items-center gap-2.5 mb-3">
                            <span className="text-indigo-400 text-lg">✦</span>
                            <p className="text-sm font-bold text-indigo-300 uppercase tracking-wide">AI Team Overview</p>
                        </div>
                        <p className="text-base text-slate-300 leading-relaxed">{aiSummary.teamSummary}</p>
                    </div>
                )}

                {/* Other Members */}
                {rest.length > 0 && (
                    <div className="pt-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-slate-700/50" />
                            <span className="text-sm text-slate-600 uppercase tracking-wider font-medium">Other Members</span>
                            <div className="flex-1 h-px bg-slate-700/50" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {rest.map((person: ContributorSum, i: number) => (
                                <div key={person.fullName} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                                    <span className="text-sm text-slate-500 w-6 text-right font-mono tabular-nums">#{i + 4}</span>
                                    <Avatar className="w-8 h-8 rounded-full">
                                        <AvatarImage src={person.pictureURL} alt={person.fullName} />
                                        <AvatarFallback>{person.fullName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-300 truncate font-medium">{person.fullName}</p>
                                        <p className="text-xs text-slate-500">{person.checkInCount} check-ins</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-slate-400 tabular-nums">
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
