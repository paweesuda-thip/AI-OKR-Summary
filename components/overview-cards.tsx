import { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { CopyCheck, Target, TrendingUp, Users, CheckCircle2, UserX, ArrowUpRight } from "lucide-react";
import { TeamSummary, ParticipantDetailRaw, Objective, KrDetail } from "@/lib/types/okr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
        <div className="flex flex-col gap-6">
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
                    
                    {/* <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                        <TabsList className="bg-background/50 border border-border/40 backdrop-blur-md p-1 h-auto rounded-xl">
                            <TabsTrigger value="current" className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md py-1.5 px-4 rounded-lg transition-all font-semibold">
                                Current Cycle
                            </TabsTrigger>
                            <TabsTrigger value="all" className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-md py-1.5 px-4 rounded-lg transition-all font-semibold text-muted-foreground">
                                All Quarters
                            </TabsTrigger>
                        </TabsList>
                    </Tabs> */}
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

            {/* Top Active Objectives Section */}
            {objectives.length > 0 && topObjectives.length > 0 && (
                <div className="flex flex-col items-center gap-6 mt-10 mb-4">
                    <div className="flex flex-col items-center text-center px-4 mb-2">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">Top Active Objectives</h2>
                        <p className="text-sm text-muted-foreground font-medium">Ranked by team engagement, member participation, and check-in volume.</p>
                    </div>
                    
                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 w-full">
                        {topObjectives.map((obj, index) => (
                            <TopObjectiveCard key={index} obj={obj} rank={index + 1} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
