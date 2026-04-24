"use client";

import { useState } from "react";
import { SubObjective, KrDetail } from "@/src/Domain/Entities/Okr";
import { Badge } from "@/src/Interface/Ui/Primitives/badge";
import { Target, TrendingDown, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/Interface/Ui/Primitives/avatar";
import { AvatarInfoTooltip, AvatarOverflowTooltip } from "@/src/Interface/Ui/Primitives/avatar-tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/src/Interface/Ui/Primitives/dialog";
import { Progress } from "@/src/Interface/Ui/Primitives/progress";

interface ProgressUpdateSectionProps {
    title: string;
    description: string;
    subObjectives: SubObjective[];
    type: 'top' | 'bottom';
}

export default function ProgressUpdateSection({ title, description, subObjectives, type }: ProgressUpdateSectionProps) {
    const isTop = type === 'top';
    const Icon = isTop ? TrendingUp : TrendingDown;
    const colorClass = isTop ? 'text-emerald-500' : 'text-rose-500';
    const bgClass = isTop ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';

    const [selectedObj, setSelectedObj] = useState<SubObjective | null>(null);

    if (!subObjectives || subObjectives.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <Target className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No Data</h3>
                <p className="text-muted-foreground text-sm">No objective updates found in this period.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-border/30 pb-4">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                        <Icon className={`w-6 h-6 ${colorClass}`} />
                        {title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{description}</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 flex-1">
                {subObjectives.map((obj, idx) => {
                    return (
                        <div 
                            key={`${obj.objectiveId}-${idx}`}
                            className="bg-background/40 backdrop-blur-sm border border-border/40 hover:border-border/80 transition-all duration-300 rounded-2xl p-5 flex flex-col group cursor-pointer"
                            onClick={() => setSelectedObj(obj)}
                        >
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                        {obj.title || obj.title_EN}
                                    </h4>
                                    {obj.ownerTeam && (
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">{obj.ownerTeam}</p>
                                    )}
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-1">
                                    <Badge variant="outline" className={`text-sm px-3 py-1 font-bold ${colorClass} ${bgClass}`}>
                                        {obj.progressUpdate > 0 ? '+' : ''}{obj.progressUpdate?.toFixed(1)}%
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/20">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-muted-foreground">Current Progress:</span>
                                    <span className="text-sm font-bold text-foreground">{obj.progress?.toFixed(1)}%</span>
                                </div>
                                
                                {/* Mini Avatar Group for Contributors */}
                                {obj.details && obj.details.length > 0 && (() => {
                                    const members = Array.from(new Map(obj.details.filter(d => d.fullName).map(d => [d.fullName, d])).values());
                                    return (
                                        <div className="flex -space-x-2 rtl:space-x-reverse">
                                            {members.slice(0, 3).map((member: KrDetail, i: number) => (
                                                <AvatarInfoTooltip
                                                    key={i}
                                                    fullName={member.fullName}
                                                    pictureURL={member.pictureURL}
                                                    avatarClassName="w-6 h-6 border-2 border-background ring-1 ring-border/50"
                                                    fallbackClassName="text-[8px] bg-muted"
                                                />
                                            ))}
                                            {members.length > 3 && (
                                                <AvatarOverflowTooltip
                                                    members={members.map(m => ({
                                                        fullName: m.fullName,
                                                        pictureURL: m.pictureURL
                                                    }))}
                                                    hiddenCount={members.length - 3}
                                                    label="Contributors"
                                                    triggerClassName="flex items-center justify-center w-6 h-6 rounded-full border-2 border-background bg-muted text-[9px] font-medium z-10 ring-1 ring-border/50 text-foreground cursor-help"
                                                />
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    );
                })}
            </div>

            <Dialog open={!!selectedObj} onOpenChange={(open) => !open && setSelectedObj(null)}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Objective Details</DialogTitle>
                        <DialogDescription>
                            View detailed progress and key results for this objective.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedObj && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden mt-4">
                            {/* Left Section: Objective Details */}
                            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="bg-background/40 border border-border/40 rounded-2xl p-6 flex flex-col gap-6">
                                    <div>
                                        <h4 className="text-xl font-bold text-foreground mb-3 leading-snug">
                                            {selectedObj.title || selectedObj.title_EN}
                                        </h4>
                                        {selectedObj.ownerTeam && (
                                            <p className="text-sm text-muted-foreground font-medium">{selectedObj.ownerTeam}</p>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Badge variant="outline" className={`px-4 py-1.5 text-sm font-bold ${selectedObj.progressUpdate > 0 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 border-rose-500/20'}`}>
                                            {selectedObj.progressUpdate > 0 ? '+' : ''}{selectedObj.progressUpdate?.toFixed(1)}% Update
                                        </Badge>
                                        <Badge variant="outline" className="px-4 py-1.5 text-sm bg-background/50">
                                            {selectedObj.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-border/20">
                                        <div className="flex justify-between items-end">
                                            <span className="font-medium text-muted-foreground">Overall Quarter</span>
                                            <span className="text-2xl font-bold">{selectedObj.progress?.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={selectedObj.progress || 0} className="h-3 w-full [&>div>div]:bg-primary" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Section: Key Results */}
                            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                <h5 className="font-bold text-lg sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                                    Key Results & Contributors
                                </h5>
                                <div className="flex flex-col gap-4 pb-4">
                                    {selectedObj.details && selectedObj.details.length > 0 ? (
                                        selectedObj.details.map((kr, idx) => (
                                            <div key={idx} className="bg-background/30 border border-border/30 rounded-xl p-5 flex flex-col gap-4 transition-colors hover:bg-background/50">
                                                <div className="flex items-start gap-4">
                                                    <Avatar className="w-10 h-10 shrink-0 border border-border/50">
                                                        <AvatarImage src={kr.pictureURL} alt={kr.fullName} />
                                                        <AvatarFallback className="bg-muted">{kr.fullName?.substring(0, 2) || "KR"}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0 pt-1">
                                                        <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug mb-1">{kr.krTitle}</p>
                                                        <p className="text-xs text-muted-foreground font-medium">{kr.fullName}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 pt-2">
                                                    <div className="flex justify-between text-xs font-medium">
                                                        <span className="text-muted-foreground">Progress</span>
                                                        <span className="text-foreground">{kr.krProgress?.toFixed(1)}%</span>
                                                    </div>
                                                    <Progress value={kr.krProgress || 0} className="h-2 w-full [&>div>div]:bg-primary/80" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-border/50 rounded-xl bg-background/20">
                                            <p className="text-sm text-muted-foreground font-medium text-center">No key results found for this objective.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}