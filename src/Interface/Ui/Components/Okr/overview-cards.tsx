import { useState, useMemo } from 'react';
import { Card } from "@/src/Interface/Ui/Primitives/card";
import { CopyCheck, Target, Users, CheckCircle2, Activity, UserX, ArrowUpRight, Gauge, Flag, Timer } from "lucide-react";
import { TeamSummary, ParticipantDetailRaw, Objective, KrDetail } from "@/src/Domain/Entities/Okr";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/Interface/Ui/Primitives/avatar";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/src/Interface/Ui/Primitives/dialog";
import { ScrollArea } from "@/src/Interface/Ui/Primitives/scroll-area";
import { Badge } from "@/src/Interface/Ui/Primitives/badge";
import { TooltipProvider } from "@/src/Interface/Ui/Primitives/tooltip";

import { AvatarInfoTooltip, AvatarOverflowTooltip } from "@/src/Interface/Ui/Primitives/avatar-tooltip";

interface OverviewCardsProps {
    summary: TeamSummary | null;
    participantDetails?: ParticipantDetailRaw[];
    objectives?: Objective[];
    showStatus?: boolean;
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

const TopObjectiveCard = ({ obj, rank, showStatus = true }: { obj: TopObjective, rank: number, showStatus?: boolean }) => {
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
                                            obj.progress >= 80 ? 'bg-violet-500' : 
                                            obj.progress >= 60 ? 'bg-foreground' : 
                                            obj.progress >= 40 ? 'bg-muted-foreground' : 'bg-muted-foreground/50'
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
                                            obj.progress >= 80 ? 'bg-violet-500' : 
                                            obj.progress >= 60 ? 'bg-foreground' : 
                                            obj.progress >= 40 ? 'bg-muted-foreground' : 'bg-muted-foreground/50'
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
                                                {showStatus && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Beyond' ? 'bg-violet-500' : sub.status === 'On Track' ? 'bg-emerald-500' : sub.status === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                                        <span className="text-xs text-muted-foreground font-medium">{sub.status}</span>
                                                    </div>
                                                )}
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

export default function OverviewCards({ summary, participantDetails = [], objectives = [], showStatus = true }: OverviewCardsProps) {
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
    const beyondCount = summary?.beyondCount || 0;
    const onTrackCount = summary?.onTrackCount || 0;
    const totalObjectives = summary?.totalObjectives || 0;
    const atRiskCount = summary?.atRiskCount || 0;
    const behindCount = summary?.behindCount || 0;
    const teamSize = participantDetails.length;
    const missingCheckInRate = teamSize > 0 ? (missingCheckInEmployees.length / teamSize) * 100 : 0;
    const beyondPercent = totalObjectives > 0 ? (beyondCount / totalObjectives) * 100 : 0;
    const onTrackPercent = totalObjectives > 0 ? (onTrackCount / totalObjectives) * 100 : 0;
    const atRiskPercent = totalObjectives > 0 ? (atRiskCount / totalObjectives) * 100 : 0;
    const behindPercent = totalObjectives > 0 ? (behindCount / totalObjectives) * 100 : 0;

    return (
        <TooltipProvider delay={120}>
            <div className="w-full">
                <div className="grid w-full grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
                    {/* Card 1: Cycle Health (col-span-2) */}
                    <section className="group relative col-span-1 md:col-span-2 xl:col-span-2 overflow-hidden rounded-2xl border border-border/50 bg-background/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-sky-500/30 hover:bg-background/60 shadow-sm flex flex-col justify-between">
                        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-sky-500/10 blur-2xl pointer-events-none" />
                        
                        <div className="relative z-10 flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <Gauge className="h-4 w-4 text-sky-500" />
                                System Health
                            </div>
                            <div className="flex items-center gap-1.5 bg-background/50 border border-border/50 px-2 py-0.5 rounded-full">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
                                </span>
                                <span className="text-[9px] font-bold text-sky-500/80 uppercase tracking-widest">Live Sync</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-end gap-2 mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">{avgObjectiveProgress.toFixed(1)}</span>
                                <span className="text-xl sm:text-2xl font-bold text-sky-500">%</span>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground mb-1.5 ml-1">Avg Progression</span>
                        </div>

                        {showStatus && (
                            <div className="relative z-10 w-full mt-auto">
                                <div className="flex justify-between items-center mb-2.5 text-[10px] font-semibold uppercase tracking-wider">
                                    <span className="text-violet-500/90">{beyondCount} Beyond</span>
                                    <span className="text-emerald-500/90">{onTrackCount} On Track</span>
                                    <span className="text-amber-500/90">{atRiskCount} At Risk</span>
                                    <span className="text-rose-500/90">{behindCount} Behind</span>
                                </div>

                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50 flex">
                                    <div className="h-full bg-violet-500 transition-all duration-700" style={{ width: `${beyondPercent}%` }} />
                                    <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${onTrackPercent}%` }} />
                                    <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${atRiskPercent}%` }} />
                                    <div className="h-full bg-rose-500 transition-all duration-700" style={{ width: `${behindPercent}%` }} />
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Card 2: Delivery (col-span-1) */}
                    <section className="group relative col-span-1 overflow-hidden rounded-2xl border border-border/50 bg-background/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/30 hover:bg-background/60 shadow-sm flex flex-col justify-between">
                        <div className="absolute top-0 right-0 h-20 w-20 translate-x-4 -translate-y-4 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />
                        
                        <div className="relative z-10 flex items-center justify-between mb-5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <Flag className="h-4 w-4 text-indigo-500" />
                                Delivery
                            </div>
                            <Activity className="h-4 w-4 text-indigo-500/40" />
                        </div>

                        <div className="relative z-10 space-y-4 mt-auto">
                            <div>
                                <div className="flex justify-between items-end mb-1.5">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Milestones</span>
                                    <span className="text-xs font-bold text-foreground">{completedSubObjectives} <span className="text-[10px] font-medium text-muted-foreground">/ {totalSubObjectives}</span></span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                                    <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${subObjectiveCompletionRate}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-1.5">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Key Results</span>
                                    <span className="text-xs font-bold text-foreground">{completedKRs} <span className="text-[10px] font-medium text-muted-foreground">/ {totalKRs}</span></span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                                    <div className="h-full bg-fuchsia-500 transition-all duration-700" style={{ width: `${krCompletionRate}%` }} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Card 3: Check-ins (col-span-1) */}
                    <section className="group relative col-span-1 overflow-hidden rounded-2xl border border-border/50 bg-background/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/30 hover:bg-background/60 shadow-sm flex flex-col justify-between">
                        <div className="absolute top-0 right-0 h-20 w-20 translate-x-4 -translate-y-4 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
                        
                        <div className="relative z-10 flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <Timer className="h-4 w-4 text-amber-500" />
                                Check-ins
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center flex-1 py-2">
                            <div className="text-5xl font-black tracking-tight text-foreground">{totalCheckIns}</div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Total Logs</span>
                        </div>

                        <div className="relative z-10 mt-auto w-full pt-2">
                            <div className="flex justify-between items-center mb-2 text-[10px]">
                                <span className="font-semibold text-muted-foreground uppercase tracking-wider">Coverage</span>
                                <span className={`font-bold ${missingCheckInRate > 25 ? 'text-rose-500' : missingCheckInRate > 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {(100 - missingCheckInRate).toFixed(0)}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                                <div
                                    className={`h-full transition-all duration-700 ${missingCheckInRate > 25 ? "bg-rose-500" : missingCheckInRate > 10 ? "bg-amber-500" : "bg-emerald-500"}`}
                                    style={{ width: `${Math.min(100, Math.max(0, 100 - missingCheckInRate))}%` }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Card 4: Team Pulse (col-span-2) */}
                    <section className="group relative col-span-1 md:col-span-3 xl:col-span-2 overflow-hidden rounded-2xl border border-border/50 bg-background/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/30 hover:bg-background/60 shadow-sm flex flex-col justify-between">
                        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
                        
                        <div className="relative z-10 flex items-center justify-between mb-5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <Users className="h-4 w-4 text-purple-500" />
                                Squad Pulse
                            </div>
                            <div className="flex items-baseline gap-1.5 bg-muted/40 px-3 py-1 rounded-md border border-border/50">
                                <span className="text-sm font-bold text-foreground">{teamSize}</span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Members</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-end justify-between mt-auto">
                            <div className="flex-1">
                                <div className="flex flex-wrap -space-x-2.5">
                                    {participantDetails.slice(0, 7).map((member, i) => (
                                        <div key={member.employeeId || `${member.fullName || "member"}-${i}`} className="relative hover:z-20 transition-transform duration-300 hover:-translate-y-1">
                                            <AvatarInfoTooltip
                                                fullName={member.fullName}
                                                pictureURL={member.pictureMediumURL || member.pictureURL}
                                                avatarClassName="h-10 w-10 border-2 border-background ring-1 ring-border/50 hover:ring-purple-500/30 transition-all"
                                                fallbackClassName="bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                            />
                                        </div>
                                    ))}
                                    {participantDetails.length > 7 && (
                                        <div className="relative z-10 hover:z-20 transition-transform duration-300 hover:-translate-y-1">
                                            <AvatarOverflowTooltip
                                                members={participantDetails.map(member => ({
                                                    fullName: member.fullName,
                                                    pictureURL: member.pictureMediumURL || member.pictureURL,
                                                }))}
                                                hiddenCount={participantDetails.length - 7}
                                                label="Squad members"
                                                triggerClassName="flex h-10 w-10 cursor-help items-center justify-center rounded-full border-2 border-background bg-purple-500/10 text-[10px] font-bold text-purple-600 ring-1 ring-border/50 hover:bg-purple-500/20 transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end text-right ml-4">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Missing Logs</span>
                                <div className={`flex items-baseline gap-1.5 ${missingCheckInEmployees.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    <span className="text-2xl font-black">{missingCheckInEmployees.length}</span>
                                    {missingCheckInEmployees.length > 0 && <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Racers</span>}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </TooltipProvider>
    );
}
