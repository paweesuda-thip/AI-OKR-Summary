import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, PartyPopper } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContributorSum, ContributorSumObj } from "@/lib/types/okr";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const statusDot: Record<string, string> = {
    'On Track': 'bg-emerald-500',
    'At Risk':  'bg-amber-500',
    'Behind':   'bg-rose-500',
};

const INITIAL_SHOW = 6;

export default function NeedsAttentionSection({ contributors }: { contributors: ContributorSum[] }) {
    const [showAll, setShowAll] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState<ContributorSum | null>(null);

    // Show employees who have checked in but have low avgObjectiveProgress (< 70%)
    const atRiskContributors = [...(contributors || [])]
        .filter((c: ContributorSum) => c.checkInCount > 0 && c.avgObjectiveProgress < 70)
        .sort((a, b) => a.avgObjectiveProgress - b.avgObjectiveProgress);

    const visible = showAll ? atRiskContributors : atRiskContributors.slice(0, INITIAL_SHOW);
    const hiddenCount = atRiskContributors.length - INITIAL_SHOW;

    if (atRiskContributors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    <PartyPopper className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-bold text-foreground tracking-tight mb-3">Everyone is On Track</h3>
                <p className="text-muted-foreground text-lg">No employees need attention right now.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border/30 pb-6">
                <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-rose-500" />
                        Needs Attention
                    </h3>
                    <p className="text-muted-foreground text-lg mt-2">Employees below 70% objective progress</p>
                </div>
                <Badge variant="outline" className="text-base px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-500 border-rose-500/20 font-semibold backdrop-blur-md">
                    {atRiskContributors.length} Employee{atRiskContributors.length !== 1 ? 's' : ''}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visible.map((person: ContributorSum, i: number) => {
                    const isCritical = person.avgObjectiveProgress < 40;
                    const progressColor = isCritical ? 'text-rose-500' : 'text-amber-500';
                    const barColor = isCritical ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]';
                    const bgClass = isCritical ? 'bg-rose-500/5 hover:bg-rose-500/10' : 'bg-muted/30 hover:bg-muted/50';

                    return (
                        <div 
                            key={person.fullName} 
                            className={`rounded-3xl p-6 transition-all duration-300 ${bgClass} border border-border/40 backdrop-blur-sm group cursor-pointer hover:-translate-y-1 hover:shadow-lg`}
                            onClick={() => setSelectedPerson(person)}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <Avatar className="w-14 h-14 border-2 border-background shadow-md">
                                        <AvatarImage src={person.pictureURL} alt={person.fullName} />
                                        <AvatarFallback className="bg-muted text-muted-foreground text-lg font-bold">
                                            {person.fullName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-sm border border-border/50">
                                        #{i + 1}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-bold text-foreground truncate">{person.fullName}</h4>
                                    <p className="text-sm text-muted-foreground font-medium">{person.checkInCount} check-in{person.checkInCount !== 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avg Progress</span>
                                    <span className={`text-3xl font-bold tracking-tighter ${progressColor}`}>
                                        {person.avgObjectiveProgress}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${barColor}`} 
                                        style={{ width: `${Math.min(person.avgObjectiveProgress, 100)}%` }} 
                                    />
                                </div>
                            </div>

                            {person.objectives && person.objectives.length > 0 && (
                                <div className="space-y-3">
                                    {person.objectives.slice(0, 2).map((okr: ContributorSumObj, oi: number) => (
                                        <div key={oi} className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[okr.status] || 'bg-muted-foreground'}`} />
                                            <span className="flex-1 text-sm text-foreground/80 font-medium truncate">{okr.objectiveName}</span>
                                            <span className="text-sm font-bold tabular-nums">{okr.progress}%</span>
                                        </div>
                                    ))}
                                    {person.objectives.length > 2 && (
                                        <p className="text-xs font-semibold text-muted-foreground pt-2">
                                            + {person.objectives.length - 2} more objectives
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!showAll && hiddenCount > 0 && (
                <div className="mt-8 flex justify-center">
                    <Button
                        variant="ghost"
                        className="rounded-full px-8 py-6 text-base font-semibold hover:bg-muted/50 transition-colors"
                        onClick={() => setShowAll(true)}
                    >
                        <ChevronDown className="w-5 h-5 mr-2" />
                        View {hiddenCount} more employee{hiddenCount !== 1 ? 's' : ''}
                    </Button>
                </div>
            )}

            {showAll && atRiskContributors.length > INITIAL_SHOW && (
                <div className="mt-8 flex justify-center">
                    <Button
                        variant="ghost"
                        className="rounded-full px-8 py-6 text-base font-semibold hover:bg-muted/50 transition-colors"
                        onClick={() => setShowAll(false)}
                    >
                        <ChevronUp className="w-5 h-5 mr-2" />
                        Show less
                    </Button>
                </div>
            )}

            <Dialog open={!!selectedPerson} onOpenChange={(open) => !open && setSelectedPerson(null)}>
                <DialogContent className="sm:max-w-[700px] w-[95vw] bg-background/95 backdrop-blur-xl border-border/50 max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Objectives Details</DialogTitle>
                        <DialogDescription>
                            {selectedPerson?.fullName}&apos;s current objectives and progress
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedPerson && (
                        <div className="mt-4 flex flex-col gap-6 overflow-hidden flex-1">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40 shrink-0">
                                <Avatar className="w-16 h-16 border-2 border-background shadow-md">
                                    <AvatarImage src={selectedPerson.pictureURL} alt={selectedPerson.fullName} />
                                    <AvatarFallback className="bg-muted text-muted-foreground text-xl font-bold">
                                        {selectedPerson.fullName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="text-xl font-bold text-foreground">{selectedPerson.fullName}</h4>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <Badge variant="secondary" className="font-medium bg-background/50">
                                            {selectedPerson.checkInCount} check-in{selectedPerson.checkInCount !== 1 ? 's' : ''}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            Avg Progress: <strong className={selectedPerson.avgObjectiveProgress < 40 ? 'text-rose-500' : 'text-amber-500'}>{selectedPerson.avgObjectiveProgress}%</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 overflow-y-auto pr-2 pb-4 flex-1 custom-scrollbar">
                                <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">All Objectives ({selectedPerson.objectives?.length || 0})</h5>
                                {selectedPerson.objectives?.map((okr: ContributorSumObj, idx: number) => {
                                    const progressColor = okr.progress < 40 ? 'bg-rose-500' : okr.progress < 70 ? 'bg-amber-500' : 'bg-emerald-500';
                                    
                                    return (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-background/40 hover:bg-muted/20 transition-colors">
                                            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                                                <span className={`mt-1.5 sm:mt-0 w-3 h-3 rounded-full shrink-0 shadow-sm ${statusDot[okr.status] || 'bg-muted-foreground'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <h6 className="font-semibold text-foreground/90 leading-tight">{okr.objectiveName}</h6>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-1.5 inline-block px-2 py-0.5 rounded-full bg-muted border border-border/50">
                                                        {okr.status}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 sm:w-[35%] shrink-0">
                                                <div className="flex-1 h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-border/20">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${progressColor}`} 
                                                        style={{ width: `${Math.min(okr.progress, 100)}%` }} 
                                                    />
                                                </div>
                                                <span className="font-bold tabular-nums min-w-12 text-right">{okr.progress}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
