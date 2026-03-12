import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyCheck, Target, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { TeamSummary } from "@/lib/types/okr";

const colMap: Record<string, { bg: string, border: string, icon: string, iconBg: string, value: string, Icon: React.ElementType }> = {
  indigo:  { bg: 'bg-primary/5',  border: 'border-primary/20',  icon: 'text-primary',  iconBg: 'bg-primary/10',  value: 'text-primary', Icon: Target  },
  emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', icon: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-500/10', value: 'text-emerald-600 dark:text-emerald-400', Icon: CopyCheck },
  amber:   { bg: 'bg-amber-500/5',   border: 'border-amber-500/20',   icon: 'text-amber-600 dark:text-amber-400',   iconBg: 'bg-amber-500/10',   value: 'text-amber-600 dark:text-amber-400', Icon: TrendingUp   },
  sky:     { bg: 'bg-sky-500/5',     border: 'border-sky-500/20',     icon: 'text-sky-600 dark:text-sky-400',     iconBg: 'bg-sky-500/10',     value: 'text-sky-600 dark:text-sky-400', Icon: Users     },
  rose:    { bg: 'bg-rose-500/5',    border: 'border-rose-500/20',    icon: 'text-rose-600 dark:text-rose-400',    iconBg: 'bg-rose-500/10',    value: 'text-rose-600 dark:text-rose-400', Icon: CheckCircle2    },
};

const StatCard = ({ label, value, sub, colorKey }: { label: string, value: string | number, sub: string, colorKey: string }) => {
    const c = colMap[colorKey] || colMap.indigo;
    const Icon = c.Icon;

    return (
        <Card className={`border ${c.border} ${c.bg} shadow-sm transition-all hover:shadow-md bg-card/60 backdrop-blur-md`}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</CardTitle>
                <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center ${c.icon}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className={`text-4xl font-bold leading-none ${c.value} mb-2 tracking-tight`}>{value}</div>
                {sub && <p className="text-sm text-muted-foreground font-medium leading-snug">{sub}</p>}
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
        <Card className="shadow-sm border-border overflow-hidden bg-card/40 backdrop-blur-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-border/40 gap-4 bg-muted/20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                        <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">Overview</h2>
                        <p className="text-sm text-muted-foreground mt-0.5 font-medium">OKR Progress Summary</p>
                    </div>
                </div>
                
                <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="bg-background/50 border border-border/40 backdrop-blur-md p-1 h-auto">
                        <TabsTrigger value="current" className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md py-1.5 px-4 rounded-md transition-all">
                            Current Cycle
                        </TabsTrigger>
                        <TabsTrigger value="all" className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md py-1.5 px-4 rounded-md transition-all">
                            All Quarters
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6 bg-transparent">
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
            <div className="px-6 pb-6 bg-transparent">
                <div className="bg-background/40 backdrop-blur-md rounded-xl px-6 py-5 border border-border/50 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                    <span className="text-sm font-semibold text-muted-foreground shrink-0 uppercase tracking-wide">
                        {activeTab === 'current' ? 'Current Cycle' : 'All Quarters'} — overall progress
                    </span>
                    <div className="flex-1 w-full flex items-center gap-4">
                        <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden flex shadow-inner border border-border/30">
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
                        <span className="text-lg font-bold text-foreground tabular-nums shrink-0">{avgObjectiveProgress?.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-5 text-sm shrink-0">
                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" /><span className="text-muted-foreground font-medium">On Track <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">{onTrackCount}</span></span></span>
                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm" /><span className="text-muted-foreground font-medium">At Risk <span className="text-amber-600 dark:text-amber-400 font-bold ml-1">{summary.atRiskCount}</span></span></span>
                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm" /><span className="text-muted-foreground font-medium">Behind <span className="text-rose-600 dark:text-rose-400 font-bold ml-1">{summary.behindCount}</span></span></span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
