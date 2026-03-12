import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyCheck, Target, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { TeamSummary } from "@/lib/types/okr";

const colMap: Record<string, { bg: string, border: string, icon: string, iconBg: string, value: string, Icon: any }> = {
  indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  icon: 'text-indigo-400',  iconBg: 'bg-indigo-500/15',  value: 'text-indigo-300', Icon: Target  },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-400', iconBg: 'bg-emerald-500/15', value: 'text-emerald-300', Icon: CopyCheck },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   icon: 'text-amber-400',   iconBg: 'bg-amber-500/15',   value: 'text-amber-300', Icon: TrendingUp   },
  sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/30',     icon: 'text-sky-400',     iconBg: 'bg-sky-500/15',     value: 'text-sky-300', Icon: Users     },
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    icon: 'text-rose-400',    iconBg: 'bg-rose-500/15',    value: 'text-rose-300', Icon: CheckCircle2    },
};

const StatCard = ({ label, value, sub, colorKey }: { label: string, value: string | number, sub: string, colorKey: string }) => {
    const c = colMap[colorKey] || colMap.indigo;
    const Icon = c.Icon;

    return (
        <Card className={`border ${c.border} ${c.bg} bg-transparent`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{label}</CardTitle>
                <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center ${c.icon}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className={`text-5xl font-bold leading-none ${c.value} mb-1.5`}>{value}</div>
                {sub && <p className="text-sm text-slate-500 leading-snug">{sub}</p>}
            </CardContent>
        </Card>
    );
};

export default function OverviewCards({ summary }: { summary: TeamSummary | null }) {
    const [activeTab, setActiveTab] = useState('current');

    if (!summary) return null;

    const {
        totalObjectives, completedObjectives, objectiveCompletionRate,
        totalKRs, completedKRs, krCompletionRate,
        avgObjectiveProgress, totalContributors, onTrackCount,
    } = summary;

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-slate-800/80 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                        <Target className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Overview</h2>
                        <p className="text-sm text-slate-500 mt-0.5">OKR Progress Summary</p>
                    </div>
                </div>
                
                <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="bg-slate-800/60 border border-slate-700/50">
                        <TabsTrigger value="current" className="data-[state=active]:bg-indigo-500/25 data-[state=active]:text-indigo-300 data-[state=active]:border-indigo-500/40">
                            Current Cycle
                        </TabsTrigger>
                        <TabsTrigger value="all" className="data-[state=active]:bg-indigo-500/25 data-[state=active]:text-indigo-300 data-[state=active]:border-indigo-500/40">
                            All Quarters
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
                <StatCard
                    label="Objectives"
                    value={`${completedObjectives}/${totalObjectives}`}
                    sub={`Completion rate ${objectiveCompletionRate?.toFixed(1)}%`}
                    colorKey="indigo"
                />
                <StatCard
                    label="Key Results"
                    value={`${completedKRs}/${totalKRs}`}
                    sub={`Completion rate ${krCompletionRate?.toFixed(1)}%`}
                    colorKey="emerald"
                />
                <StatCard
                    label="Avg Progress"
                    value={`${avgObjectiveProgress?.toFixed(1)}%`}
                    sub={activeTab === 'current' ? 'Current cycle average' : 'Average across all quarters'}
                    colorKey="amber"
                />
                <StatCard
                    label="Contributors"
                    value={totalContributors}
                    sub="Unique people with KR activity"
                    colorKey="sky"
                />
                <StatCard
                    label="On Track"
                    value={onTrackCount}
                    sub={`Out of ${totalObjectives} total objectives`}
                    colorKey="rose"
                />
            </div>

            {/* Progress bar overview */}
            <div className="px-6 pb-6">
                <div className="bg-slate-800/40 rounded-xl px-6 py-4 border border-slate-700/30 flex flex-col md:flex-row items-center gap-6">
                    <span className="text-sm text-slate-500 shrink-0">
                        {activeTab === 'current' ? 'Current Cycle' : 'All Quarters'} — overall progress
                    </span>
                    <div className="flex-1 w-full flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-700/60 rounded-full overflow-hidden flex">
                            <div
                                className="h-full bg-emerald-500 transition-all"
                                style={{ width: `${(onTrackCount / Math.max(totalObjectives, 1)) * 100}%` }}
                            />
                            <div
                                className="h-full bg-amber-500 transition-all"
                                style={{ width: `${((totalObjectives - onTrackCount - summary.behindCount) / Math.max(totalObjectives, 1)) * 100}%` }}
                            />
                            <div
                                className="h-full bg-rose-500 transition-all"
                                style={{ width: `${(summary.behindCount / Math.max(totalObjectives, 1)) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-semibold text-slate-300 tabular-nums shrink-0">{avgObjectiveProgress?.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm shrink-0">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /><span className="text-slate-400">On Track <span className="text-emerald-400 font-semibold">{onTrackCount}</span></span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /><span className="text-slate-400">At Risk <span className="text-amber-400 font-semibold">{summary.atRiskCount}</span></span></span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /><span className="text-slate-400">Behind <span className="text-rose-400 font-semibold">{summary.behindCount}</span></span></span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
