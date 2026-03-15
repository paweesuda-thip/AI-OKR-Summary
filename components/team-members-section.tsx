"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, UserMinus, ShieldAlert, BadgeInfo, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarInfoTooltip, AvatarOverflowTooltip } from "@/components/ui/avatar-tooltip";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";

export interface TeamMember {
    employeeId: string;
    employeeName: string;
    picture: string;
    employeeStatus: number;
    positionName: string;
}

export default function TeamMembersSection({ teamMembers = [] }: { teamMembers: TeamMember[] }) {
    const [expanded, setExpanded] = useState(false);

    if (!teamMembers || teamMembers.length === 0) return null;

    const activeCount   = teamMembers.filter(m => m.employeeStatus === 1).length;
    const inactiveCount = teamMembers.filter(m => m.employeeStatus === 2).length;
    const resignedCount = teamMembers.filter(m => m.employeeStatus === 3).length;

    return (
        <Card className="border-none bg-transparent shadow-none w-full">
            <Collapsible open={expanded} onOpenChange={setExpanded}>
                <CollapsibleTrigger 
                    render={<button className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-0 py-5 hover:bg-background/40 transition-colors group border-b border-border/40" />}
                >
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 shadow-inner">
                                <Users className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-xl font-bold text-foreground tracking-tight leading-tight">Team Members</h2>
                                <span className="text-sm text-muted-foreground font-medium">{teamMembers.length} members</span>
                            </div>
                        </div>
                        {/* Mobile expansion indicator */}
                        <div className="sm:hidden text-muted-foreground">
                            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center gap-6">
                            {/* Stacked avatars */}
                            <div className="flex -space-x-3">
                                {teamMembers.slice(0, 6).map((m, i) => (
                                    <AvatarInfoTooltip
                                        key={m.employeeId}
                                        fullName={m.employeeName}
                                        pictureURL={m.picture}
                                        avatarClassName="w-10 h-10 border-2 border-background shadow-sm opacity-90 transition-opacity hover:opacity-100"
                                        fallbackClassName="bg-muted text-muted-foreground text-xs font-bold"
                                        style={{ zIndex: 6 - i }}
                                    />
                                ))}
                                {teamMembers.length > 6 && (
                                    <AvatarOverflowTooltip
                                        members={teamMembers.map(m => ({
                                            fullName: m.employeeName,
                                            pictureURL: m.picture
                                        }))}
                                        hiddenCount={teamMembers.length - 6}
                                        label="Team members"
                                        triggerClassName="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-muted text-xs font-bold text-muted-foreground z-0 shadow-sm cursor-help"
                                    />
                                )}
                            </div>

                            {/* Status dots */}
                            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5" title="Active">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    {activeCount}
                                </span>
                                {inactiveCount > 0 && (
                                    <span className="flex items-center gap-1.5" title="Inactive">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                        {inactiveCount}
                                    </span>
                                )}
                                {resignedCount > 0 && (
                                    <span className="flex items-center gap-1.5" title="Resigned">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                        {resignedCount}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Desktop expansion indicator */}
                        <div className="hidden sm:block text-muted-foreground group-hover:text-foreground transition-colors">
                            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <CardContent className="px-6 py-5 border-t border-border/40 bg-transparent">
                        {/* Mobile Status Dots (visible only when expanded on mobile) */}
                        <div className="flex md:hidden items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border/50 font-medium">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-foreground font-semibold">Active</span>
                                <span className="ml-1 px-1.5 bg-background/50 border border-border/50 shadow-sm rounded backdrop-blur-sm">{activeCount}</span>
                            </span>
                            {inactiveCount > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                    <span className="text-foreground font-semibold">Inactive</span>
                                    <span className="ml-1 px-1.5 bg-background/50 border border-border/50 shadow-sm rounded backdrop-blur-sm">{inactiveCount}</span>
                                </span>
                            )}
                            {resignedCount > 0 && (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                    <span className="text-foreground font-semibold">Resigned</span>
                                    <span className="ml-1 px-1.5 bg-background/50 border border-border/50 shadow-sm rounded backdrop-blur-sm">{resignedCount}</span>
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {teamMembers.map((member) => (
                                <div
                                    key={member.employeeId}
                                    className="flex items-center gap-3 bg-background/40 backdrop-blur-md border border-border/50 rounded-xl p-3 hover:shadow-md hover:bg-background/60 transition-all shadow-sm group"
                                >
                                    <Avatar className="w-11 h-11 border border-border/40 relative shadow-sm opacity-90 group-hover:border-muted-foreground/30 transition-colors">
                                        <AvatarImage src={member.picture} alt={member.employeeName} />
                                        <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                                            {member.employeeName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-bold text-foreground truncate">{member.employeeName}</p>
                                            <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${
                                                member.employeeStatus === 1 ? 'bg-emerald-500' :
                                                member.employeeStatus === 2 ? 'bg-amber-500' : 'bg-rose-500'
                                            }`} title={
                                                member.employeeStatus === 1 ? 'Active' :
                                                member.employeeStatus === 2 ? 'Inactive' : 'Resigned'
                                            } />
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium" title={member.positionName}>
                                            {member.positionName || 'No position specified'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
