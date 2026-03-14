import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyCheck, Target, TrendingUp, Users, CheckCircle2, UserX } from "lucide-react";
import { TeamSummary, ParticipantDetailRaw } from "@/lib/types/okr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OverviewCardsProps {
    summary: TeamSummary | null;
    participantDetails?: ParticipantDetailRaw[];
}

export default function OverviewCards({ summary, participantDetails = [] }: OverviewCardsProps) {
    const [activeTab, setActiveTab] = useState('current');

    if (!summary) return null;

    // Calculate total and missed check-ins using the new API data
    const totalCheckIns = participantDetails.reduce((acc, curr) => acc + curr.totalCheckIn, 0);
    const missingCheckInEmployees = participantDetails.filter(p => p.totalCheckIn === 0);

    const {
        totalObjectives, completedObjectives, objectiveCompletionRate,
        totalKRs, completedKRs, krCompletionRate,
        avgObjectiveProgress, onTrackCount,
    } = summary;

    return (
        <Card className="shadow-sm border-border overflow-hidden bg-card/40 backdrop-blur-lg rounded-3xl">
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
                    <TabsList className="bg-background/50 border border-border/40 backdrop-blur-md p-1 h-auto rounded-xl">
                        <TabsTrigger value="current" className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md py-1.5 px-4 rounded-lg transition-all font-semibold">
                            Current Cycle
                        </TabsTrigger>
                        <TabsTrigger value="all" className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md py-1.5 px-4 rounded-lg transition-all font-semibold text-muted-foreground">
                            All Quarters
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6 bg-transparent w-full">
                {/* 1. Objectives */}
                <div className="bg-background/40 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Objectives</span>
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-indigo-500" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-4xl font-bold text-foreground mb-1 tracking-tight">
                            {completedObjectives}/{totalObjectives}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                            Completion rate {objectiveCompletionRate?.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* 2. Key Results */}
                <div className="bg-background/40 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Key Results</span>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CopyCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-4xl font-bold text-emerald-500 mb-1 tracking-tight">
                            {completedKRs}/{totalKRs}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                            Completion rate {krCompletionRate?.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* 3. Avg Progress */}
                <div className="bg-background/40 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg Progress</span>
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-amber-500" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-4xl font-bold text-amber-500 mb-1 tracking-tight">
                            {avgObjectiveProgress?.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                            Current cycle average
                        </div>
                    </div>
                </div>

                {/* 4. Total Check-in (Replaces Contributors) */}
                <div className="bg-background/40 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Check-in</span>
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-4xl font-bold text-blue-500 mb-1 tracking-tight">
                            {totalCheckIns}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                            Check-ins in selected period
                        </div>
                    </div>
                </div>

                {/* 5. Missing Check-ins */}
                <div className="bg-background/40 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Missed Check-ins</span>
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                            <UserX className="w-4 h-4 text-rose-500" />
                        </div>
                    </div>
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="text-4xl font-bold text-rose-500 mb-1 tracking-tight">
                            {missingCheckInEmployees.length}
                        </div>
                        {missingCheckInEmployees.length > 0 ? (
                            <div className="flex -space-x-3 rtl:space-x-reverse mt-1">
                                {missingCheckInEmployees.slice(0, 5).map((member, i) => (
                                    <Avatar key={member.employeeId || i} className="w-8 h-8 border-2 border-background ring-2 ring-rose-500/20">
                                        <AvatarImage src={member.pictureMediumURL || member.pictureURL} alt={member.fullName} />
                                        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">{member.fullName.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {missingCheckInEmployees.length > 5 && (
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-xs font-medium z-10 ring-2 ring-rose-500/20">
                                        +{missingCheckInEmployees.length - 5}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                Everyone checked in
                            </div>
                        )}
                    </div>
                </div>

                {/* 6. Team Members (Avatar Group) */}
                <div className="bg-background/40 backdrop-blur-xl border border-border/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contributors</span>
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-purple-500" />
                        </div>
                    </div>
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="text-4xl font-bold text-foreground mb-1 tracking-tight">
                            {participantDetails.length}
                        </div>
                        <div className="flex -space-x-3 rtl:space-x-reverse mt-1">
                             {participantDetails.slice(0, 5).map((member, i) => (
                                <Avatar key={member.employeeId || i} className="w-8 h-8 border-2 border-background ring-2 ring-purple-500/20">
                                    <AvatarImage src={member.pictureMediumURL || member.pictureURL} alt={member.fullName} />
                                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">{member.fullName.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                            ))}
                            {participantDetails.length > 5 && (
                                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-xs font-medium z-10 ring-2 ring-purple-500/20">
                                    +{participantDetails.length - 5}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-background/40 border-t border-border/30 px-8 py-6 flex items-center gap-6">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                    Current Cycle — Overall Progress
                </span>
                
                <div className="flex-1 flex items-center gap-4">
                    <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden flex shadow-inner">
                        <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${(onTrackCount / totalObjectives) * 100}%` }} />
                        <div className="h-full bg-amber-500 transition-all duration-1000 ease-out" style={{ width: `${(summary.atRiskCount / totalObjectives) * 100}%` }} />
                        <div className="h-full bg-rose-500 transition-all duration-1000 ease-out" style={{ width: `${(summary.behindCount / totalObjectives) * 100}%` }} />
                    </div>
                    <span className="font-bold text-lg">{summary.avgObjectiveProgress.toFixed(1)}%</span>
                </div>

                <div className="flex items-center gap-4 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <span className="font-medium text-foreground">On Track <span className="font-bold ml-1">{onTrackCount}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                        <span className="font-medium text-foreground">At Risk <span className="font-bold ml-1">{summary.atRiskCount}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                        <span className="font-medium text-foreground">Behind <span className="font-bold ml-1">{summary.behindCount}</span></span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
