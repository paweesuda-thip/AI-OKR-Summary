import { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { CopyCheck, Target, Users, CheckCircle2, Activity, UserX, ArrowUpRight } from "lucide-react";
import { TeamSummary, ParticipantDetailRaw, Objective, KrDetail } from "@/lib/types/okr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ShinyText from "@/components/react-bits/ShinyText";

interface OverviewCardsProps {
    summary: TeamSummary | null;
    participantDetails?: ParticipantDetailRaw[];
    objectives?: Objective[];
}

interface TopMember {
    fullName: string;
    pictureURL: string;
    checkIns: number;
    totalProgress: number;
}

interface SubObjectiveStat {
    title: string;
    participantsCount: number;
    checkInCount: number;
    progress: number;
    status: string;
    details?: KrDetail[]; // To keep TS happy since we map from KrDetail[]
}

interface TopObjective extends Objective {
    participantsCount: number;
    checkInCount: number;
    subStats: SubObjectiveStat[];
    topMembers: TopMember[];
}

const TopObjectiveCard = ({ obj, rank }: { obj: TopObjective, rank: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger nativeButton={false} render={
                <Card className="group relative flex flex-col justify-between h-[220px] p-6 bg-background/50 hover:bg-muted/30 border border-border/40 hover:border-foreground/20 backdrop-blur-md transition-all duration-300 cursor-pointer overflow-hidden rounded-2xl shadow-sm">
                    {/* Background glow on hover */}
                    <div className="absolute inset-0 bg-linear-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Rank Number */}
                    <div className="absolute top-4 right-6 font-mono text-5xl font-black text-muted-foreground/10 group-hover:text-muted-foreground/20 transition-colors pointer-events-none select-none tracking-tighter">
                        #{rank}
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        {/* Header */}
                        <div className="mb-4 pr-16">
                            <h4 className="text-base font-semibold text-foreground/90 leading-snug line-clamp-3 group-hover:text-foreground transition-colors">
                                {obj.objectiveName || obj.objectiveName_EN}
                            </h4>
                        </div>
                        
                        <div className="mt-auto space-y-5">
                            {/* Stats */}
                            <div className="flex items-center gap-5 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span className="font-medium text-foreground">{obj.participantsCount}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="font-medium text-foreground">{obj.checkInCount}</span>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="w-full">
                                <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
                                    <span>Progress</span>
                                    <span className={obj.progress >= 100 ? "text-emerald-500" : "text-foreground"}>{obj.progress?.toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-700 ${
                                            obj.progress >= 100 ? 'bg-emerald-500' : 
                                            obj.progress >= 70 ? 'bg-foreground' : 
                                            obj.progress >= 30 ? 'bg-muted-foreground' : 'bg-muted-foreground/50'
                                        }`}
                                        style={{ width: `${Math.min(100, Math.max(0, obj.progress || 0))}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                </Card>
            } />

            <DialogContent className="sm:max-w-[90vw] lg:max-w-[1000px] w-full bg-background/95 backdrop-blur-3xl border-border/20 shadow-2xl h-[85vh] max-h-[700px] flex flex-col overflow-hidden rounded-3xl p-0 gap-0">
                {/* Header - Glassy Apple style */}
                <div className="px-8 pt-8 pb-6 border-b border-border/10 bg-background/50 backdrop-blur-md z-10 shrink-0">
                    <Badge variant="secondary" className="mb-3 bg-muted/50 text-muted-foreground hover:bg-muted/50 border-none px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase shadow-none">
                        Rank #{rank} • Top Objective
                    </Badge>
                    <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground leading-snug max-w-4xl">
                        {obj.objectiveName || obj.objectiveName_EN}
                    </DialogTitle>
                </div>

                {/* Two-column layout area */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
                    
                    {/* Left Column - Stats & Contributors */}
                    <ScrollArea className="w-full md:w-[30%] shrink-0 bg-background/30 border-r border-border/10">
                        <div className="p-5 space-y-5">
                            
                            {/* Top Stats Combined */}
                            <div className="flex items-center justify-between bg-muted/30 backdrop-blur-md rounded-xl p-4 border border-border/30 shadow-sm">
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" /> Users
                                    </span>
                                    <span className="text-xl font-bold tracking-tight">{obj.participantsCount}</span>
                                </div>
                                <div className="w-px h-8 bg-border/40" />
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Checks
                                    </span>
                                    <span className="text-xl font-bold tracking-tight">{obj.checkInCount}</span>
                                </div>
                            </div>

                            {/* Overall Progress */}
                            <div className="bg-muted/30 backdrop-blur-md rounded-xl p-4 border border-border/30 shadow-sm">
                                <div className="flex justify-between items-end mb-3">
                                    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Progress</h3>
                                    <span className="text-base font-bold leading-none">{obj.progress?.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${
                                            obj.progress >= 100 ? 'bg-emerald-500' : 
                                            obj.progress >= 70 ? 'bg-foreground' : 
                                            obj.progress >= 30 ? 'bg-muted-foreground' : 'bg-muted-foreground/50'
                                        }`}
                                        style={{ width: `${Math.min(100, Math.max(0, obj.progress || 0))}%` }}
                                    />
                                </div>
                            </div>

                            {/* Top Contributors Grid */}
                            {obj.topMembers.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-[11px] font-semibold text-muted-foreground px-1 uppercase tracking-widest">Top Contributors</h3>
                                    <div className="flex flex-col gap-2">
                                        {obj.topMembers.map((member: TopMember, i: number) => (
                                            <div key={i} className="bg-muted/20 hover:bg-muted/50 backdrop-blur-md rounded-xl p-2.5 border border-border/20 shadow-sm flex items-center gap-3 transition-colors">
                                                <div className="relative">
                                                    <Avatar className="w-8 h-8 border border-border/20 shadow-sm">
                                                        <AvatarImage src={member.pictureURL} />
                                                        <AvatarFallback className="text-[10px] bg-muted font-medium">{member.fullName?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background flex items-center justify-center border border-border/20 shadow-sm text-[8px] font-bold text-muted-foreground">
                                                        {i+1}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-medium text-foreground truncate">{member.fullName}</div>
                                                    <div className="text-[10px] text-muted-foreground mt-0.5">{member.checkIns} check-ins</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Right Column - Sub-objectives */}
                    <ScrollArea className="w-full md:w-[70%] shrink-0 bg-muted/5">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Sub-Objectives</h3>
                                <Badge variant="outline" className="bg-background/50 border-border/30 text-[10px]">
                                    <Target className="w-3 h-3 mr-1.5 text-foreground" />
                                    {obj.subStats.length} Total
                                </Badge>
                            </div>
                            
                            <div className="bg-background/60 backdrop-blur-md rounded-2xl border border-border/30 shadow-sm overflow-hidden flex flex-col divide-y divide-border/20">
                                {obj.subStats.map((sub: SubObjectiveStat, i: number) => {
                                    // Extract unique members from details for this sub-objective
                                    const subMembers = Array.from(new Map((sub.details || []).filter((d: KrDetail) => d.fullName).map((d: KrDetail) => [d.fullName, d])).values());
                                    
                                    return (
                                    <div key={i} className="flex flex-col gap-3 p-5 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-foreground leading-snug">{sub.title}</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'On Track' ? 'bg-emerald-500' : sub.status === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                                    <span className="text-xs text-muted-foreground font-medium">{sub.status}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-base font-bold text-foreground">{sub.progress?.toFixed(0)}%</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/10">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">{sub.participantsCount}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">{sub.checkInCount}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Avatar Group for Sub-objective */}
                                            {subMembers.length > 0 && (
                                                <div className="flex -space-x-2 rtl:space-x-reverse">
                                                    {subMembers.slice(0, 4).map((member: KrDetail, idx: number) => (
                                                        <Avatar key={idx} className="w-6 h-6 border-2 border-background ring-1 ring-border/50">
                                                            <AvatarImage src={member.pictureURL} alt={member.fullName} />
                                                            <AvatarFallback className="text-[8px] bg-muted">{member.fullName.substring(0, 2)}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                    {subMembers.length > 4 && (
                                                        <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-background bg-muted text-[9px] font-medium z-10 ring-1 ring-border/50">
                                                            +{subMembers.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )})}
                                {obj.subStats.length === 0 && (
                                    <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                                        <Target className="w-8 h-8 mb-3 opacity-20" />
                                        <h4 className="text-sm font-medium">No Sub-Objectives Found</h4>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function OverviewCards({ summary, participantDetails = [], objectives = [] }: OverviewCardsProps) {
    const topObjectives = useMemo(() => {
        if (!objectives || objectives.length === 0) return [];
        
        const objWithStats = objectives.map(obj => {
            const subStats = (obj.subObjectives || []).map(sub => {
                const subDetails = sub.details || [];
                const subContributors = new Set(subDetails.map(d => d.fullName).filter(Boolean));
                const subCheckIns = subDetails.filter(d => d.pointCurrent > 0).length;
                return {
                    ...sub,
                    participantsCount: subContributors.size,
                    checkInCount: subCheckIns
                };
            }).sort((a, b) => b.participantsCount - a.participantsCount || b.checkInCount - a.checkInCount);

            const allDetails = obj.subObjectives?.flatMap(sub => sub.details) || obj.details || [];
            const checkInCount = allDetails.filter(d => d.pointCurrent > 0).length;
            
            const memberMap = new Map<string, { fullName: string, pictureURL: string, checkIns: number, totalProgress: number }>();
            allDetails.forEach(d => {
                if (!d.fullName) return;
                const existing = memberMap.get(d.fullName) || { fullName: d.fullName, pictureURL: d.pictureURL, checkIns: 0, totalProgress: 0 };
                if (d.pointCurrent > 0) existing.checkIns++;
                existing.totalProgress += d.krProgress;
                memberMap.set(d.fullName, existing);
            });
            const topMembers = Array.from(memberMap.values()).sort((a, b) => b.checkIns - a.checkIns || b.totalProgress - a.totalProgress).slice(0, 3);
            
            const participantsCount = memberMap.size;
            
            return {
                ...obj,
                participantsCount,
                checkInCount,
                subStats,
                topMembers
            } as TopObjective;
        });

        // Sort by participantsCount DESC, then checkInCount DESC
        return [...objWithStats].sort((a, b) => b.participantsCount - a.participantsCount || b.checkInCount - a.checkInCount).slice(0, 10);
    }, [objectives]);

    const subObjectives = useMemo(() => {
        return objectives?.flatMap(o => o.subObjectives || []) || [];
    }, [objectives]);

    // Calculate total and missed check-ins using the new API data
    const totalCheckIns = participantDetails.reduce((acc, curr) => acc + curr.totalCheckIn, 0);
    const missingCheckInEmployees = participantDetails.filter(p => p.totalMissCheckIn > 0);

    const totalSubObjectives = subObjectives.length;
    const completedSubObjectives = subObjectives.filter(sub => sub.progress >= 100).length;
    const subObjectiveCompletionRate = totalSubObjectives > 0 ? (completedSubObjectives / totalSubObjectives) * 100 : 0;

    const totalKRs = summary?.totalKRs || 0;
    const completedKRs = summary?.completedKRs || 0;
    const krCompletionRate = summary?.krCompletionRate || 0;
    const avgObjectiveProgress = summary?.avgObjectiveProgress || 0;
    const onTrackCount = summary?.onTrackCount || 0;
    const totalObjectives = summary?.totalObjectives || 0;
    const atRiskCount = summary?.atRiskCount || 0;
    const behindCount = summary?.behindCount || 0;

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 w-full">
                {/* 1. Overall Progress (Spans 2 columns) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col p-6 rounded-2xl border border-blue-500/20 bg-linear-to-br from-blue-500/10 via-background to-background shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <Activity className="w-32 h-32 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500">
                                <Activity className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">Cycle Health</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">Overall Progress</Badge>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-end mt-2 relative z-10">
                        <div className="flex items-baseline gap-2 mb-3">
                            <div className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400 drop-shadow-sm">
                                {avgObjectiveProgress.toFixed(1)}<span className="text-xl font-medium opacity-70 ml-0.5">%</span>
                            </div>
                        </div>
                        
                        <div className="space-y-3 mt-1">
                            <div className="h-2 w-full bg-blue-950/10 dark:bg-blue-950/30 rounded-full overflow-hidden flex shadow-inner">
                                <div className="bg-emerald-500 transition-all duration-1000" style={{ width: `${totalObjectives > 0 ? (onTrackCount / totalObjectives) * 100 : 0}%` }} />
                                <div className="bg-amber-500 transition-all duration-1000" style={{ width: `${totalObjectives > 0 ? (atRiskCount / totalObjectives) * 100 : 0}%` }} />
                                <div className="bg-rose-500 transition-all duration-1000" style={{ width: `${totalObjectives > 0 ? (behindCount / totalObjectives) * 100 : 0}%` }} />
                            </div>
                            
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span>On Track <span className="font-bold text-foreground ml-1">{onTrackCount}</span></span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                    <span>At Risk <span className="font-bold text-foreground ml-1">{atRiskCount}</span></span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                    <span>Behind <span className="font-bold text-foreground ml-1">{behindCount}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Objectives */}
                <div className="flex flex-col p-6 rounded-2xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/10 via-background to-background shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <Target className="w-24 h-24 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-2.5 mb-4 relative z-10">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-500">
                            <Target className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Objectives</span>
                    </div>
                    <div className="mt-auto relative z-10">
                        <div className="text-4xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 drop-shadow-sm">
                            {completedSubObjectives}
                            <span className="text-lg font-medium opacity-60 ml-1">/ {totalSubObjectives}</span>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground mt-2 bg-background/50 inline-block px-2 py-1 rounded-md backdrop-blur-sm">
                            {subObjectiveCompletionRate.toFixed(1)}% completed
                        </div>
                    </div>
                </div>

                {/* 3. Key Results */}
                <div className="flex flex-col p-6 rounded-2xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-background to-background shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <CopyCheck className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-2.5 mb-4 relative z-10">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500">
                            <CopyCheck className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Key Results</span>
                    </div>
                    <div className="mt-auto relative z-10">
                        <div className="text-4xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 drop-shadow-sm">
                            {completedKRs}
                            <span className="text-lg font-medium opacity-60 ml-1">/ {totalKRs}</span>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground mt-2 bg-background/50 inline-block px-2 py-1 rounded-md backdrop-blur-sm">
                            {krCompletionRate.toFixed(1)}% completed
                        </div>
                    </div>
                </div>

                {/* 4. Team / Contributors */}
                <div className="flex flex-col p-6 rounded-2xl border border-purple-500/20 bg-linear-to-br from-purple-500/10 via-background to-background shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <Users className="w-24 h-24 text-purple-500" />
                    </div>
                    <div className="flex items-center gap-2.5 mb-4 relative z-10">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20 text-purple-500">
                            <Users className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Team</span>
                    </div>
                    <div className="mt-auto relative z-10">
                        <div className="text-4xl font-bold tracking-tight text-purple-600 dark:text-purple-400 drop-shadow-sm mb-3">
                            {participantDetails.length}
                        </div>
                        <div className="flex items-center">
                            <div className="flex -space-x-2 rtl:space-x-reverse bg-background/50 p-1 rounded-full backdrop-blur-sm">
                                {participantDetails.slice(0, 5).map((member, i) => (
                                    <Avatar key={member.employeeId || i} className="w-8 h-8 border-2 border-background shadow-sm">
                                        <AvatarImage src={member.pictureMediumURL || member.pictureURL} alt={member.fullName} />
                                        <AvatarFallback className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-medium">{member.fullName?.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {participantDetails.length > 5 && (
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-[10px] font-bold z-10 shadow-sm">
                                        +{participantDetails.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Check-ins */}
                <div className="flex flex-col p-6 rounded-2xl border border-amber-500/20 bg-linear-to-br from-amber-500/10 via-background to-background shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                        <CheckCircle2 className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-2.5 mb-4 relative z-10">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Check-ins</span>
                    </div>
                    <div className="mt-auto relative z-10">
                        <div className="text-4xl font-bold tracking-tight text-amber-600 dark:text-amber-400 drop-shadow-sm mb-3">
                            {totalCheckIns}
                        </div>
                        <div className="flex items-center">
                            {missingCheckInEmployees.length === 0 ? (
                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-background/50 px-2 py-1.5 rounded-md backdrop-blur-sm">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-xs font-bold">All clear</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-background/50 px-2 py-1.5 rounded-md backdrop-blur-sm">
                                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                                        <UserX className="w-4 h-4" />
                                        <span className="text-xs font-bold">{missingCheckInEmployees.length} missed</span>
                                    </div>
                                    <div className="flex -space-x-1.5 rtl:space-x-reverse ml-1 border-l border-border/50 pl-2">
                                        {missingCheckInEmployees.slice(0, 3).map((member, i) => (
                                            <Avatar key={member.employeeId || i} className="w-6 h-6 border-2 border-background shadow-sm">
                                                <AvatarImage src={member.pictureMediumURL || member.pictureURL} alt={member.fullName} />
                                                <AvatarFallback className="text-[8px] bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300 font-medium">{member.fullName?.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
