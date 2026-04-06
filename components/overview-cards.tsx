import { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { CopyCheck, Target, Users, CheckCircle2, Activity, UserX, ArrowUpRight, Gauge, Zap, Flag, Timer } from "lucide-react";
import { TeamSummary, ParticipantDetailRaw, Objective, KrDetail } from "@/lib/types/okr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import ShinyText from "@/components/react-bits/ShinyText";

import { AvatarInfoTooltip, AvatarOverflowTooltip } from "@/components/ui/avatar-tooltip";

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
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
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
                        Rank #{rank} • Lead Milestone
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
                                    <h3 className="text-[11px] font-semibold text-muted-foreground px-1 uppercase tracking-widest">Top Racers</h3>
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
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Sub-Milestones</h3>
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
                                                        <AvatarInfoTooltip
                                                            key={`${member.fullName || "member"}-${idx}`}
                                                            fullName={member.fullName}
                                                            pictureURL={member.pictureURL}
                                                            avatarClassName="h-6 w-6 border-2 border-background ring-1 ring-border/50"
                                                            fallbackClassName="bg-muted text-[8px]"
                                                        />
                                                    ))}
                                                    {subMembers.length > 4 && (
                                                        <AvatarOverflowTooltip
                                                            members={subMembers.map((member: KrDetail) => ({
                                                                fullName: member.fullName,
                                                                pictureURL: member.pictureURL,
                                                            }))}
                                                            hiddenCount={subMembers.length - 4}
                                                            label="Contributors"
                                                            triggerClassName="z-10 flex h-6 w-6 cursor-help items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-medium ring-1 ring-border/50"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )})}
                                {obj.subStats.length === 0 && (
                                    <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                                        <Target className="w-8 h-8 mb-3 opacity-20" />
                                        <h4 className="text-sm font-medium">No Sub-Milestones Found</h4>
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
        <TooltipProvider delay={120}>
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
                    
                    {/* Hero Card: Cycle Health */}
                    <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-border/40 bg-background/70 backdrop-blur-md p-6 lg:p-8 shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Activity className="w-48 h-48 -mr-12 -mt-12" />
                        </div>
                        
                        <div className="flex flex-col gap-2 relative z-10">
                            <div className="flex items-center gap-2 text-sm font-semibold text-blue-500">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
                                    <Activity className="h-4 w-4" />
                                </span>
                                Cycle Health
                            </div>
                            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mt-1">Overall Progress</span>
                        </div>

                        <div className="flex-1 w-full max-w-2xl relative z-10">
                            <div className="flex items-end justify-between gap-4 mb-4">
                                <div className="text-5xl lg:text-6xl font-black tracking-tighter text-blue-600 dark:text-blue-400 drop-shadow-sm">
                                    {avgObjectiveProgress.toFixed(1)}%
                                </div>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> On Track {onTrackCount}
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> At Risk {atRiskCount}
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Behind {behindCount}
                                    </span>
                                </div>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
                                <div className="bg-emerald-500 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${totalObjectives > 0 ? (onTrackCount / totalObjectives) * 100 : 0}%` }} />
                                <div className="bg-amber-500 transition-all duration-700 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${totalObjectives > 0 ? (atRiskCount / totalObjectives) * 100 : 0}%` }} />
                                <div className="bg-rose-500 transition-all duration-700 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${totalObjectives > 0 ? (behindCount / totalObjectives) * 100 : 0}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Uniform Stat Cards */}
                    <div className="rounded-2xl border border-border/40 bg-background/70 backdrop-blur-md p-5 shadow-sm transition-all hover:shadow-md flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 top-0 opacity-[0.03] group-hover:opacity-5 transition-opacity">
                            <Target className="w-24 h-24 -mr-4 -mt-4" />
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold mb-4 text-indigo-500">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15">
                                <Target className="h-4 w-4" />
                            </span>
                            Objectives
                        </div>
                        <div className="flex items-end gap-2 mt-auto">
                            <div className="text-4xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 leading-none">
                                {completedSubObjectives}
                            </div>
                            <span className="text-xl font-medium text-muted-foreground pb-0.5">/ {totalSubObjectives}</span>
                        </div>
                        <div className="mt-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                            {subObjectiveCompletionRate.toFixed(1)}% completed
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border/40 bg-background/70 backdrop-blur-md p-5 shadow-sm transition-all hover:shadow-md flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 top-0 opacity-[0.03] group-hover:opacity-5 transition-opacity">
                            <CopyCheck className="w-24 h-24 -mr-4 -mt-4" />
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold mb-4 text-emerald-500">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                                <CopyCheck className="h-4 w-4" />
                            </span>
                            Key Results
                        </div>
                        <div className="flex items-end gap-2 mt-auto">
                            <div className="text-4xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 leading-none">
                                {completedKRs}
                            </div>
                            <span className="text-xl font-medium text-muted-foreground pb-0.5">/ {totalKRs}</span>
                        </div>
                        <div className="mt-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                            {krCompletionRate.toFixed(1)}% completed
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border/40 bg-background/70 backdrop-blur-md p-5 shadow-sm transition-all hover:shadow-md flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 top-0 opacity-[0.03] group-hover:opacity-5 transition-opacity">
                            <Users className="w-24 h-24 -mr-4 -mt-4" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-purple-500">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15">
                                    <Users className="h-4 w-4" />
                                </span>
                                Team
                            </div>
                            <div className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">{participantDetails.length}</div>
                        </div>
                        <div className="mt-auto pt-2">
                            <div className="flex -space-x-2">
                                {participantDetails.slice(0, 7).map((member, i) => (
                                    <AvatarInfoTooltip
                                        key={member.employeeId || `${member.fullName || "member"}-${i}`}
                                        fullName={member.fullName}
                                        pictureURL={member.pictureMediumURL || member.pictureURL}
                                        avatarClassName="h-9 w-9 border-2 border-background shadow-sm hover:z-10 transition-transform hover:scale-110"
                                        fallbackClassName="bg-purple-100 text-[10px] font-semibold text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                    />
                                ))}
                                {participantDetails.length > 7 && (
                                    <AvatarOverflowTooltip
                                        members={participantDetails.map(member => ({
                                            fullName: member.fullName,
                                            pictureURL: member.pictureMediumURL || member.pictureURL,
                                        }))}
                                        hiddenCount={participantDetails.length - 7}
                                        label="Team members"
                                        triggerClassName="z-10 flex h-9 w-9 cursor-help items-center justify-center rounded-full border-2 border-background bg-purple-100 text-[10px] font-bold text-purple-700 shadow-sm dark:bg-purple-900 dark:text-purple-300 hover:scale-110 transition-transform"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border/40 bg-background/70 backdrop-blur-md p-5 shadow-sm transition-all hover:shadow-md flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 top-0 opacity-[0.03] group-hover:opacity-5 transition-opacity">
                            <CheckCircle2 className="w-24 h-24 -mr-4 -mt-4" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-amber-500">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
                                    <CheckCircle2 className="h-4 w-4" />
                                </span>
                                Check-ins
                            </div>
                            <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{totalCheckIns}</div>
                        </div>
                        <div className="mt-auto pt-2">
                            {missingCheckInEmployees.length === 0 ? (
                                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 w-full justify-center">
                                    <CheckCircle2 className="h-4 w-4" />
                                    All clear
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="inline-flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                        <UserX className="h-3.5 w-3.5" />
                                        {missingCheckInEmployees.length} missed
                                    </div>
                                    <div className="flex -space-x-2">
                                        {missingCheckInEmployees.slice(0, 4).map((member, i) => (
                                            <AvatarInfoTooltip
                                                key={member.employeeId || `${member.fullName || "member"}-${i}`}
                                                fullName={member.fullName}
                                                pictureURL={member.pictureMediumURL || member.pictureURL}
                                                avatarClassName="h-7 w-7 border-2 border-background shadow-sm"
                                                fallbackClassName="bg-rose-100 text-[9px] font-semibold text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                                            />
                                        ))}
                                        {missingCheckInEmployees.length > 4 && (
                                            <AvatarOverflowTooltip
                                                members={missingCheckInEmployees.map(member => ({
                                                    fullName: member.fullName,
                                                    pictureURL: member.pictureMediumURL || member.pictureURL,
                                                }))}
                                                hiddenCount={missingCheckInEmployees.length - 4}
                                                label="Missed check-ins"
                                                triggerClassName="z-10 flex h-7 w-7 cursor-help items-center justify-center rounded-full border-2 border-background bg-rose-100 text-[9px] font-bold text-rose-700 shadow-sm dark:bg-rose-900 dark:text-rose-300"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
